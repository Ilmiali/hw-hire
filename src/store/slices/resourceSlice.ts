import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getDatabaseService } from '../../services/databaseService';
import { serializeDate } from '../../utils/serialization';
import { Resource, ResourceVersion } from '../../types/resource';
import { Document } from '../../types/database';
import { grantAccess, revokeAccess } from './shareSlice';
interface ResourceState {
  resources: Record<string, Resource[]>; // Dictionary by resourceType
  activeResource: Resource | null;
  activeDraft: ResourceVersion | null;
  activeResourceVersions: ResourceVersion[];
  loading: boolean;
  error: string | null;
}

const initialState: ResourceState = {
  resources: {},
  activeResource: null,
  activeDraft: null,
  activeResourceVersions: [],
  loading: false,
  error: null,
};

// --- Paths & Helpers ---

const getResourcePath = (orgId: string, moduleId: string, resourceType: string) =>
  `orgs/${orgId}/modules/${moduleId}/${resourceType}`;

const getDraftPath = (orgId: string, moduleId: string, resourceType: string, resourceId: string) =>
    `orgs/${orgId}/modules/${moduleId}/${resourceType}/${resourceId}/draft`;

const getVersionsPath = (orgId: string, moduleId: string, resourceType: string, resourceId: string) =>
    `orgs/${orgId}/modules/${moduleId}/${resourceType}/${resourceId}/versions`;

const getUserSharePath = (orgId: string, moduleId: string, userId: string) =>
  `orgs/${orgId}/modules/${moduleId}/members/${userId}/shares`;

// Generic mapper (assumes document data matches Resource interface mostly)
const mapDocumentToResource = (doc: any): Resource => ({
    id: doc.id,
    name: doc.data?.name || '',
    description: doc.data?.description || '',
    status: doc.data?.status || 'active',
    visibility: doc.data?.visibility || 'private',
    ownerIds: doc.data?.ownerIds || [],
    createdBy: doc.data?.createdBy || '',
    publishedVersionId: doc.data?.publishedVersionId,
    createdAt: serializeDate(doc.createdAt) || (serializeDate(doc.data?.createdAt) as string) || new Date().toISOString(),
    updatedAt: serializeDate(doc.updatedAt) || (serializeDate(doc.data?.updatedAt) as string) || new Date().toISOString(),
    // Allow extra fields
    ...doc.data
});

const mapDocumentToVersion = (doc: any): ResourceVersion => ({
    id: doc.id,
    data: doc.data?.data || doc.data || {}, 
    createdAt: serializeDate(doc.createdAt) || (serializeDate(doc.data?.createdAt) as string) || new Date().toISOString(),
    publishedAt: doc.data?.publishedAt ? (serializeDate(doc.data.publishedAt) as string) : undefined
});

// Helper to sanitize data (remove undefined)
const sanitizeData = (data: any): any => {
    if (Array.isArray(data)) {
        return data.map(sanitizeData);
    } else if (data !== null && typeof data === 'object') {
        return Object.entries(data).reduce((acc: any, [key, value]) => {
            if (value !== undefined) {
                acc[key] = sanitizeData(value);
            }
            return acc;
        }, {});
    }
    return data;
};


// --- Thunks ---

export const fetchResources = createAsyncThunk(
  'resource/fetchResources',
  async ({ orgId, moduleId, resourceType }: { orgId: string; moduleId: string; resourceType: string }, { rejectWithValue, getState }) => {
    try {
      const db = getDatabaseService();
      const state = getState() as any;
      const currentUserId = state.auth.user?.uid;

      if (!currentUserId) throw new Error('User not authenticated');

      // 1. Fetch Public Resources
      const resourcePath = getResourcePath(orgId, moduleId, resourceType);
      const publicDocsPromise = db.getDocuments<Document>(resourcePath, {
        constraints: [{ field: 'visibility', operator: '==', value: 'public' }]
      });

      // 2. Fetch Shared Resources
      const userSharePath = getUserSharePath(orgId, moduleId, currentUserId);
      const sharesPromise = db.getDocuments<Document>(userSharePath);

      // 3. Fetch Owned Resources
      const ownedDocsPromise = db.getDocuments<Document>(resourcePath, {
        constraints: [{ field: 'ownerIds', operator: 'array-contains', value: currentUserId }]
      });

      const [publicDocs, shareDocs, ownedDocs] = await Promise.all([publicDocsPromise, sharesPromise, ownedDocsPromise]);

      // Filter shares
      const sharedResourceIds = shareDocs
        .filter((doc) => doc.id.startsWith(`${resourceType}_`))
        .map((doc) => doc.id.replace(`${resourceType}_`, ''));

      // Fetch full shared docs
      const sharedDocsPromises = sharedResourceIds.map(id => 
        db.getDocument<Document>(resourcePath, id)
      );

      const sharedDocs = await Promise.all(sharedDocsPromises);
      const validSharedDocs = sharedDocs.filter(doc => doc !== null);

      // Merge and Deduplicate
      const allDocsMap = new Map();
      publicDocs.forEach(doc => allDocsMap.set(doc.id, doc));
      ownedDocs.forEach(doc => allDocsMap.set(doc.id, doc));
      validSharedDocs.forEach(doc => allDocsMap.set(doc!.id, doc));

      const allDocs = Array.from(allDocsMap.values());

      // Map and Sort
      const mappedResources = allDocs.map(mapDocumentToResource);
      mappedResources.sort((a, b) => {
        const dateA = new Date(a.updatedAt || 0).getTime();
        const dateB = new Date(b.updatedAt || 0).getTime();
        return dateB - dateA;
      });

      return { resourceType, resources: mappedResources };

    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch resources');
    }
  }
);

export const fetchResourceById = createAsyncThunk(
    'resource/fetchResourceById',
    async ({ orgId, moduleId, resourceType, resourceId }: { orgId: string; moduleId: string; resourceType: string; resourceId: string }, { rejectWithValue }) => {
        try {
            const db = getDatabaseService();
            const doc = await db.getDocument(getResourcePath(orgId, moduleId, resourceType), resourceId);
            if (!doc) return rejectWithValue('Resource not found');
            return mapDocumentToResource(doc);
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch resource');
        }
    }
);

export const createResource = createAsyncThunk(
    'resource/createResource',
    async ({ 
        orgId, 
        moduleId, 
        resourceType, 
        data, 
        initialDraftData 
    }: { 
        orgId: string; 
        moduleId: string; 
        resourceType: string; 
        data: Partial<Resource>;
        initialDraftData: any;
    }, { rejectWithValue, getState }) => {
        try {
            const db = getDatabaseService();
            const state = getState() as any;
            const currentUserId = state.auth.user?.uid;
            if (!currentUserId) throw new Error('User not authenticated');

            const resourceData = {
                ...data,
                status: 'active',
                visibility: 'private', // Default
                ownerIds: [currentUserId],
                createdBy: currentUserId,
            };

            const docId = await db.addDocument(getResourcePath(orgId, moduleId, resourceType), resourceData);
            const actualId = typeof docId === 'string' ? docId : (docId as any).id;

            const draftData = typeof initialDraftData === 'function' ? initialDraftData(actualId) : initialDraftData;

            // Create initial draft
            await db.setDocument(getDraftPath(orgId, moduleId, resourceType, actualId), 'current', {
                data: sanitizeData(draftData)
            });

            // Return the created resource
            const createdDoc = await db.getDocument(getResourcePath(orgId, moduleId, resourceType), actualId);
            return {
                resource: mapDocumentToResource(createdDoc),
                resourceType
            };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create resource');
        }
    }
);

export const deleteResource = createAsyncThunk(
    'resource/deleteResource',
    async ({ orgId, moduleId, resourceType, resourceId }: { orgId: string; moduleId: string; resourceType: string; resourceId: string }, { rejectWithValue }) => {
        try {
            const db = getDatabaseService();
            await db.deleteDocument(getResourcePath(orgId, moduleId, resourceType), resourceId);
            // We should also probably delete subcollections but generic deletion is hard without recursive delete support from DB service
            // For now assuming shallow delete is "okay" or handled by backend triggers
            return { resourceId, resourceType };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete resource');
        }
    }
);

export const fetchResourceDraft = createAsyncThunk(
    'resource/fetchResourceDraft',
    async ({ orgId, moduleId, resourceType, resourceId }: { orgId: string; moduleId: string; resourceType: string; resourceId: string }, { rejectWithValue }) => {
        try {
            const db = getDatabaseService();
            const draft = await db.getDocument(getDraftPath(orgId, moduleId, resourceType, resourceId), 'current');
            return draft ? mapDocumentToVersion(draft) : null;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch draft');
        }
    }
);

export const saveResourceDraft = createAsyncThunk(
    'resource/saveResourceDraft',
    async ({ 
        orgId, 
        moduleId, 
        resourceType, 
        resourceId, 
        data, 
        resourceUpdates 
    }: { 
        orgId: string; 
        moduleId: string; 
        resourceType: string; 
        resourceId: string; 
        data: any; // The generic data payload
        resourceUpdates?: Partial<Resource>; // Updates to the parent resource e.g. name
    }, { rejectWithValue }) => {
        try {
            const db = getDatabaseService();
            
            // 1. Write to draft/current
            await db.setDocument(getDraftPath(orgId, moduleId, resourceType, resourceId), 'current', {
                data: sanitizeData(data)
            });

            // 2. Update resource metadata
            const updates = {
                ...resourceUpdates,
                updatedAt: new Date() as any
            };
            
            const updatedResourceDoc = await db.updateDocument(getResourcePath(orgId, moduleId, resourceType), resourceId, updates);

            // 3. Update 'shares' timestamps (optimistic approach, assuming 'access' subcollection existence for this resource)
            // Note: This relies on 'access' subcollection conventions being used by all resources!
            // If strict separation is needed, we might need a separate service call.
            // For now, mirroring `formsSlice` logic:
            try {
                const accessPath = `orgs/${orgId}/modules/${moduleId}/${resourceType}/${resourceId}/access`;
                const accessDocs = await db.getDocuments<any>(accessPath);
                for (const access of accessDocs) {
                    const userSharePath = `orgs/${orgId}/modules/${moduleId}/members/${access.id}/shares`;
                    await db.updateDocument(userSharePath, `${resourceType}_${resourceId}`, {
                        resourceUpdatedAt: new Date().toISOString()
                    });
                }
            } catch (err) {
               console.warn("Could not update shares timestamps", err);
            }

            const draft = await db.getDocument(getDraftPath(orgId, moduleId, resourceType, resourceId), 'current');
            return {
                version: mapDocumentToVersion(draft),
                resource: mapDocumentToResource(updatedResourceDoc)
            };

        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to save draft');
        }
    }
);

export const publishResource = createAsyncThunk(
    'resource/publishResource',
    async ({ orgId, moduleId, resourceType, resourceId }: { orgId: string; moduleId: string; resourceType: string; resourceId: string }, { rejectWithValue }) => {
        try {
            const db = getDatabaseService();

            // 1. Fetch current draft
            const draft = await db.getDocument(getDraftPath(orgId, moduleId, resourceType, resourceId), 'current');
            if (!draft) throw new Error('No draft to publish');

            // 2. Create immutable version
            const versionId = `v_${Date.now()}`;
            await db.setDocument(getVersionsPath(orgId, moduleId, resourceType, resourceId), versionId, {
                data: (draft.data as any).data || draft.data, 
                publishedAt: new Date()
            });

            // 3. Update resource metadata
            await db.updateDocument(getResourcePath(orgId, moduleId, resourceType), resourceId, {
                publishedVersionId: versionId,
                updatedAt: new Date().toISOString()
            });

            return versionId;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to publish resource');
        }
    }
);

export const fetchResourceVersions = createAsyncThunk(
    'resource/fetchResourceVersions',
    async ({ orgId, moduleId, resourceType, resourceId }: { orgId: string; moduleId: string; resourceType: string; resourceId: string }, { rejectWithValue }) => {
        try {
            const db = getDatabaseService();
            const versionsPath = getVersionsPath(orgId, moduleId, resourceType, resourceId);
            const docs = await db.getDocuments<any>(versionsPath);
            
            const versions = docs.map(mapDocumentToVersion);
            // Sort by publishedAt decending (most recent first)
            versions.sort((a, b) => {
                const dateA = new Date(a.publishedAt || a.createdAt).getTime();
                const dateB = new Date(b.publishedAt || b.createdAt).getTime();
                return dateB - dateA;
            });
            
            return versions;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch versions');
        }
    }
);

export const fetchResourceVersionById = createAsyncThunk(
    'resource/fetchResourceVersionById',
    async ({ orgId, moduleId, resourceType, resourceId, versionId }: { orgId: string; moduleId: string; resourceType: string; resourceId: string; versionId: string }, { rejectWithValue }) => {
        try {
            const db = getDatabaseService();
            const versionPath = getVersionsPath(orgId, moduleId, resourceType, resourceId);
            const doc = await db.getDocument(versionPath, versionId);
            if (!doc) throw new Error('Version not found');
            return mapDocumentToVersion(doc);
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch version details');
        }
    }
);

export const updateResourceSettings = createAsyncThunk(
    'resource/updateSettings',
    async ({ orgId, moduleId, resourceType, resourceId, settings }: { orgId: string; moduleId: string; resourceType: string; resourceId: string; settings: Partial<Resource> }, { rejectWithValue }) => {
        try {
            const db = getDatabaseService();
            const updatedDoc = await db.updateDocument(getResourcePath(orgId, moduleId, resourceType), resourceId, settings);
            return mapDocumentToResource(updatedDoc);
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update settings');
        }
    }
);


const resourceSlice = createSlice({
  name: 'resource',
  initialState,
  reducers: {
    clearResources: (state, action) => {
        const resourceType = action.payload;
        if (resourceType) {
            delete state.resources[resourceType];
        } else {
            state.resources = {};
        }
    },
    setActiveResource: (state, action: PayloadAction<Resource | null>) => {
        state.activeResource = action.payload;
    },
    clearActiveResource: (state) => {
        state.activeResource = null;
        state.activeDraft = null;
    }
  },
  extraReducers: (builder) => {
    builder
        // Fetch Resources
      .addCase(fetchResources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.loading = false;
        state.resources[action.payload.resourceType] = action.payload.resources;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch By ID
      .addCase(fetchResourceById.pending, (state) => {
          state.loading = true;
      })
      .addCase(fetchResourceById.fulfilled, (state, action) => {
          state.loading = false;
          state.activeResource = action.payload;
      })
      .addCase(fetchResourceById.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
      })

      // Create
      .addCase(createResource.fulfilled, (state, action) => {
          const { resource, resourceType } = action.payload;
          if (!state.resources[resourceType]) {
              state.resources[resourceType] = [];
          }
           state.resources[resourceType].unshift(resource);
           // Optionally set active?
      })

      // Delete
      .addCase(deleteResource.fulfilled, (state, action) => {
          const { resourceId, resourceType } = action.payload;
          if (state.resources[resourceType]) {
              state.resources[resourceType] = state.resources[resourceType].filter(r => r.id !== resourceId);
          }
          if (state.activeResource?.id === resourceId) {
              state.activeResource = null;
              state.activeDraft = null;
          }
      })

      // Drafts
      .addCase(fetchResourceDraft.pending, (state) => {
          state.loading = true;
      })
      .addCase(fetchResourceDraft.fulfilled, (state, action) => {
          state.loading = false;
          state.activeDraft = action.payload;
      })
      .addCase(saveResourceDraft.fulfilled, (state, action) => {
          state.activeDraft = action.payload.version;
          state.activeResource = action.payload.resource;
          // Update in list as well?
          // Ideally we find it in the list and update name/updatedAt
      })
      
      // Settings
      .addCase(updateResourceSettings.fulfilled, (state, action) => {
          state.activeResource = action.payload;
          // Update in list
          // Simplification: We might need to know resourceType to update the list, payload is just Resource.
          // Since Resource doesn't store its "type", we might need to search all lists or pass type in payload.
          // For now, letting it update activeResource is enough for the builder view.
      })
      // Access Management Updates
      .addCase(grantAccess.fulfilled, (state, action) => {
          const { resourceType, resourceId, ownerIds } = action.payload;
          
          // Update active resource if it matches
          if (state.activeResource?.id === resourceId) {
             state.activeResource.ownerIds = ownerIds;
          }

          // Update in resources list
          if (state.resources[resourceType]) {
              const res = state.resources[resourceType].find(r => r.id === resourceId);
              if (res) {
                  res.ownerIds = ownerIds;
              }
          }
      })
      .addCase(revokeAccess.fulfilled, (state, action) => {
          const { resourceType, resourceId, ownerIds } = action.payload;
          
          if (state.activeResource?.id === resourceId) {
             state.activeResource.ownerIds = ownerIds;
          }

          if (state.resources[resourceType]) {
              const res = state.resources[resourceType].find(r => r.id === resourceId);
              if (res) {
                  res.ownerIds = ownerIds;
              }
          }
      })
      
      // Resource Versions
      .addCase(fetchResourceVersions.pending, (state) => {
          state.loading = true;
      })
      .addCase(fetchResourceVersions.fulfilled, (state, action) => {
          state.loading = false;
          state.activeResourceVersions = action.payload;
      })
      .addCase(fetchResourceVersions.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
      })
      .addCase(fetchResourceVersionById.pending, (state) => {
          state.loading = true;
      })
      .addCase(fetchResourceVersionById.fulfilled, (state, action) => {
          state.loading = false;
          // You might set it as activeDraft or something if needed, 
          // but for previews we probably just return it from the thunk 
          // or use the list.
      })
      .addCase(fetchResourceVersionById.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
      });
  },
});

export const { clearResources, setActiveResource, clearActiveResource } = resourceSlice.actions;
export default resourceSlice.reducer;
