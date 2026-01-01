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

      // 1. Update access subcollection
      await db.setDocument(getAccessPath(orgId, moduleId, resourceType, resourceId), userId, {
        role,
        addedAt: new Date(),
        addedBy: currentUserId
      });

      // 2. Update user's shares subcollection
      const resourceDoc = await db.getDocument<{ id: string; data: any }>(getResourcePath(orgId, moduleId, resourceType), resourceId);
      const userSharePath = getUserSharePath(orgId, moduleId, userId);
      const shareId = `${resourceType}_${resourceId}`;
      
      await db.setDocument(userSharePath, shareId, {
        resourceName: resourceDoc?.data?.name || 'Unknown Resource',
        resourceUpdatedAt: new Date().toISOString()
      });

      // 3. If role is editor or owner, allow update of ownerIds
      const currentOwnerIds = (resourceDoc?.data?.ownerIds as string[]) || [];
      let newOwnerIds = [...currentOwnerIds];

      if (role === 'owner' || role === 'editor') {
        if (!newOwnerIds.includes(userId)) {
          newOwnerIds.push(userId);
        }
      } else if (role === 'viewer') {
        newOwnerIds = newOwnerIds.filter(id => id !== userId);
      }

      if (JSON.stringify(newOwnerIds) !== JSON.stringify(currentOwnerIds)) {
         await db.updateDocument(getResourcePath(orgId, moduleId, resourceType), resourceId, {
            ownerIds: newOwnerIds
         });
      }

      // Return the new access object + updated ownerIds + resource info
      return {
          access: {
            uid: userId,
            role,
            addedAt: new Date().toISOString(),
            addedBy: currentUserId
          },
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
      
      // 1. Delete from access subcollection
      await db.deleteDocument(getAccessPath(orgId, moduleId, resourceType, resourceId), userId);

      // 2. Remove from user's shares subcollection
      const userSharePath = getUserSharePath(orgId, moduleId, userId);
      const shareId = `${resourceType}_${resourceId}`;
      await db.deleteDocument(userSharePath, shareId);

      // 3. Remove from ownerIds
      const resourceDoc = await db.getDocument<{ id: string; data: any }>(getResourcePath(orgId, moduleId, resourceType), resourceId);
      const currentOwnerIds = (resourceDoc?.data?.ownerIds as string[]) || [];
      const newOwnerIds = currentOwnerIds.filter(id => id !== userId);

      if (newOwnerIds.length !== currentOwnerIds.length) {
         await db.updateDocument(getResourcePath(orgId, moduleId, resourceType), resourceId, {
            ownerIds: newOwnerIds
         });
      }

      return { userId, ownerIds: newOwnerIds, resourceId, resourceType };
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to revoke access');
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
        const existing = state.accessList.findIndex(a => a.uid === action.payload.access.uid);
        if (existing >= 0) {
          state.accessList[existing] = action.payload.access;
        } else {
          state.accessList.push(action.payload.access);
        }
      })
      .addCase(revokeAccess.fulfilled, (state, action) => {
        state.accessList = state.accessList.filter(a => a.uid !== action.payload.userId);
      });
  },
});

export const { clearAccessList } = shareSlice.actions;
export default shareSlice.reducer;
