import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDatabaseService } from '../../services/databaseService';
import { AccessRole } from '../../types/access';
import { serializeDate } from '../../utils/serialization';

export interface Access {
  uid: string;
  role: AccessRole;
  addedAt: string;
  addedBy: string;
}

interface ShareState {
  accessList: Access[];
  loading: boolean;
  error: string | null;
}

const initialState: ShareState = {
  accessList: [],
  loading: false,
  error: null,
};

const getAccessPath = (orgId: string, moduleId: string, resourceType: string, resourceId: string) => 
  `orgs/${orgId}/modules/${moduleId}/${resourceType}/${resourceId}/access`;

const getResourcePath = (orgId: string, moduleId: string, resourceType: string) =>
  `orgs/${orgId}/modules/${moduleId}/${resourceType}`;

const getUserSharePath = (orgId: string, moduleId: string, userId: string) =>
  `orgs/${orgId}/modules/${moduleId}/members/${userId}/shares`;

// Thunks
export const fetchAccess = createAsyncThunk(
  'share/fetchAccess',
  async ({ orgId, moduleId, resourceType, resourceId }: { orgId: string; moduleId: string; resourceType: string; resourceId: string }, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const docs = await db.getDocuments<{ id: string; data: any }>(getAccessPath(orgId, moduleId, resourceType, resourceId));
      return docs.map(doc => ({
        uid: doc.id,
        role: doc.data.role as AccessRole,
        addedAt: serializeDate(doc.data.addedAt) || new Date().toISOString(),
        addedBy: doc.data.addedBy as string
      }));
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch access list');
    }
  }
);

export const grantAccess = createAsyncThunk(
  'share/grantAccess',
  async ({ 
    orgId, 
    moduleId, 
    resourceType, 
    resourceId, 
    userId, 
    role 
  }: { 
    orgId: string; 
    moduleId: string; 
    resourceType: string; 
    resourceId: string; 
    userId: string; 
    role: AccessRole 
  }, { rejectWithValue, getState }) => {
    try {
      const db = getDatabaseService();
      const state = getState() as any;
      const currentUserId = state.auth.user?.uid;

      if (!currentUserId) throw new Error('User not authenticated');

      const resourcePath = getResourcePath(orgId, moduleId, resourceType);
      const accessPath = getAccessPath(orgId, moduleId, resourceType, resourceId);
      const userSharePath = getUserSharePath(orgId, moduleId, userId);
      const shareId = `${resourceType}_${resourceId}`;

      // Fetch current resource to get ownerIds
      const resourceDoc = await db.getDocument<{ id: string; data: any }>(resourcePath, resourceId);
      const currentOwnerIds = (resourceDoc?.data?.ownerIds as string[]) || [];
      let newOwnerIds = [...currentOwnerIds];

      if (role === 'owner') {
        // 1. Ensure in ownerIds
        if (!newOwnerIds.includes(userId)) {
          newOwnerIds.push(userId);
        }
        // 2. Remove from 'access' subcollection (if exists)
        await db.deleteDocument(accessPath, userId);
        
        // 3. Remove from user's 'shares' subcollection (owners don't need shares)
        await db.deleteDocument(userSharePath, shareId);
        
      } else {
        // 1. Ensure NOT in ownerIds
        newOwnerIds = newOwnerIds.filter(id => id !== userId);
        
        // 2. Add/Update in 'access' subcollection
        await db.setDocument(accessPath, userId, {
          role,
          addedAt: new Date(),
          addedBy: currentUserId
        });

        // 3. Update user's 'shares' subcollection (ensure entry exists, no name needed)
        await db.setDocument(userSharePath, shareId, {
           resourceUpdatedAt: new Date().toISOString()
        });
      }

      // 4. Update ownerIds on resource if changed
      if (JSON.stringify(newOwnerIds) !== JSON.stringify(currentOwnerIds)) {
         await db.updateDocument(resourcePath, resourceId, {
            ownerIds: newOwnerIds
         });
      }

      return {
          uid: userId,
          role,
          addedAt: new Date().toISOString(),
          addedBy: currentUserId,
          ownerIds: newOwnerIds,
          resourceId, 
          resourceType
      };

    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to grant access');
    }
  }
);

export const revokeAccess = createAsyncThunk(
  'share/revokeAccess',
  async ({ orgId, moduleId, resourceType, resourceId, userId }: { orgId: string; moduleId: string; resourceType: string; resourceId: string; userId: string }, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const resourcePath = getResourcePath(orgId, moduleId, resourceType);
      
      // 1. Delete from access subcollection
      await db.deleteDocument(getAccessPath(orgId, moduleId, resourceType, resourceId), userId);

      // 2. Remove from user's shares subcollection
      const userSharePath = getUserSharePath(orgId, moduleId, userId);
      const shareId = `${resourceType}_${resourceId}`;
      await db.deleteDocument(userSharePath, shareId);

      // 3. Remove from ownerIds if present
      const resourceDoc = await db.getDocument<{ id: string; data: any }>(resourcePath, resourceId);
      const currentOwnerIds = (resourceDoc?.data?.ownerIds as string[]) || [];
      const newOwnerIds = currentOwnerIds.filter(id => id !== userId);

      if (newOwnerIds.length !== currentOwnerIds.length) {
         await db.updateDocument(resourcePath, resourceId, {
            ownerIds: newOwnerIds
         });
      }

      return { userId, ownerIds: newOwnerIds, resourceId, resourceType };
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to revoke access');
    }
  }
);

// Fetch all users who have access (owners + values in access subcollection)
// Smartly dedupes and checks current state to minimalize fetches
export const fetchResourceUsers = createAsyncThunk(
    'share/fetchResourceUsers',
    async ({ orgId, moduleId, resourceType, resourceId }: { orgId: string; moduleId: string; resourceType: string; resourceId: string }, { rejectWithValue, getState, dispatch }) => {
        try {
            const db = getDatabaseService();
            const state = getState() as any;
            const existingUsers = state.users.users as { id: string }[];
            
            // 1. Get Owner IDs
            // Optimization: check if resource is in state first
            let ownerIds: string[] = [];
            
            // Try to find resource in state
            const resourcesInState = state.resource?.resources?.[resourceType] as any[];
            const cachedResource = resourcesInState?.find((r: any) => r.id === resourceId);
            
            if (cachedResource && cachedResource.ownerIds) {
                ownerIds = cachedResource.ownerIds;
            } else {
                 // Fallback to fetch
                 const resourcePath = getResourcePath(orgId, moduleId, resourceType);
                 const doc = await db.getDocument<{ id: string; data: any }>(resourcePath, resourceId);
                 ownerIds = (doc?.data?.ownerIds as string[]) || [];
            }

            // 2. Get Shared Access IDs
            // We use the existing fetchAccess logic but we want just the IDs here essentially
            // But we can just query the collection directly to save overhead of the full action if needed, 
            // but let's just do a direct query here to be "smart"
            const accessPath = getAccessPath(orgId, moduleId, resourceType, resourceId);
            const accessDocs = await db.getDocuments<{ id: string }>(accessPath);
            const accessIds = accessDocs.map(d => d.id);

            // 3. Combine Unique IDs
            const allUserIds = Array.from(new Set([...ownerIds, ...accessIds]));

            // 4. Identify Missing Users
            const missingIds = allUserIds.filter(uid => !existingUsers.find(u => u.id === uid));

            // 5. Fetch Missing Users
            if (missingIds.length > 0) {
                 // Fetch them in parallel
                 const fetchedUsers = await Promise.all(
                     missingIds.map(uid => db.getDocument<any>('users', uid)) 
                 );
                 
                 const validUsers = fetchedUsers
                    .filter(doc => doc !== null)
                    .map(doc => ({
                        id: doc!.id,
                        name: doc!.data.name as string,
                        fullName: (doc!.data.fullName || doc!.data.name) as string,
                        email: doc!.data.email as string,
                        role: doc!.data.role as string,
                        organizations: doc!.data.organizations as string[],
                        createdAt: serializeDate(doc!.createdAt || new Date()) || new Date().toISOString(),
                        updatedAt: serializeDate(doc!.updatedAt || new Date()) || new Date().toISOString()
                    }));

                 // 6. Update User Store (Upsert)
                 // We need to dispatch to usersSlice. We assume 'upsertUsers' exists or 'fetchUsers' was sufficient.
                 // Ideally we dispatch an action to add these users to the store so we don't fetch them again.
                 // Since we don't have direct import of upsertUsers here (to avoid circular dep if usersSlice imports shareSlice),
                 // we can dynamically dispatch if we imported it. 
                 // However, shareSlice imports from usersSlice is fine if usersSlice doesn't import shareSlice.
                 // Let's assume we can import it.
                 /* 
                    Note: To allow this verify usersSlice doesn't import shareSlice. 
                    usersSlice: imports serializeDate, databaseService. OK.
                 */
                 const { upsertUsers } = await import('../slices/usersSlice');
                 if (validUsers.length > 0) {
                    dispatch(upsertUsers(validUsers));
                 }
                 
                 return [...existingUsers.filter(u => allUserIds.includes(u.id)), ...validUsers];
            }

            return existingUsers.filter(u => allUserIds.includes(u.id));

        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch resource users');
        }
    }
);

const shareSlice = createSlice({
  name: 'share',
  initialState,
  reducers: {
    clearAccessList: (state) => {
      state.accessList = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccess.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccess.fulfilled, (state, action) => {
        state.loading = false;
        state.accessList = action.payload;
      })
      .addCase(fetchAccess.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(grantAccess.fulfilled, (state, action) => {
        const { uid, role, addedAt, addedBy } = action.payload;
        
        // Remove from list if they became an owner (owners are handled by resource ownerIds)
        if (role === 'owner') {
          state.accessList = state.accessList.filter(a => a.uid !== uid);
        } else {
          // Add or update in accessList (for editors/viewers)
          const newAccess: Access = { uid, role, addedAt, addedBy };
          const existing = state.accessList.findIndex(a => a.uid === uid);
          if (existing >= 0) {
            state.accessList[existing] = newAccess;
          } else {
            state.accessList.push(newAccess);
          }
        }
      })
      .addCase(revokeAccess.fulfilled, (state, action) => {
        state.accessList = state.accessList.filter(a => a.uid !== action.payload.userId);
      });
  },
});

export const { clearAccessList } = shareSlice.actions;
export default shareSlice.reducer;
