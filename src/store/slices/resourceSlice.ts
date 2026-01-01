import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDatabaseService } from '../../services/databaseService';
import { serializeDate } from '../../utils/serialization';

import { Document } from '../../types/database';

interface ResourceState {
  resources: Record<string, any[]>; // Dictionary by resourceType
  loading: boolean;
  error: string | null;
}

const initialState: ResourceState = {
  resources: {},
  loading: false,
  error: null,
};

const getResourcePath = (orgId: string, moduleId: string, resourceType: string) =>
  `orgs/${orgId}/modules/${moduleId}/${resourceType}`;

const getUserSharePath = (orgId: string, moduleId: string, userId: string) =>
  `orgs/${orgId}/modules/${moduleId}/members/${userId}/shares`;

export const fetchResources = createAsyncThunk(
  'resource/fetchResources',
  async ({ orgId, moduleId, resourceType }: { orgId: string; moduleId: string; resourceType: string }, { rejectWithValue, getState }) => {
    try {
      const db = getDatabaseService();
      const state = getState() as any;
      const currentUserId = state.auth.user?.uid;

      if (!currentUserId) throw new Error('User not authenticated');

      // 1. Fetch Public Resources
      const publicDocsPromise = db.getDocuments<Document>(getResourcePath(orgId, moduleId, resourceType), {
        constraints: [{ field: 'visibility', operator: '==', value: 'public' }]
      });

      // 2. Fetch Shared Resources (ids from user's shares subcollection)
      const sharesPromise = db.getDocuments<Document>(getUserSharePath(orgId, moduleId, currentUserId));

      const [publicDocs, shareDocs] = await Promise.all([publicDocsPromise, sharesPromise]);

      // Filter shares for this resource type (ids are like "forms_123", "pipelines_456")
      const sharedResourceIds = shareDocs
        .filter((doc) => doc.id.startsWith(`${resourceType}_`))
        .map((doc) => doc.id.replace(`${resourceType}_`, '')); // Extract actual ID

      // Fetch full documents for shared resources
      const sharedDocsPromises = sharedResourceIds.map(id => 
        db.getDocument<Document>(getResourcePath(orgId, moduleId, resourceType), id)
      );

      const sharedDocs = await Promise.all(sharedDocsPromises);
      const validSharedDocs = sharedDocs.filter(doc => doc !== null);

      // 3. Merge and Deduplicate
      const allDocsMap = new Map();

      // Add public docs
      publicDocs.forEach(doc => {
        allDocsMap.set(doc.id, doc);
      });

      // Add shared docs (overwrite if exists - unlikely to differ significantly, but ensures we have accessible ones)
      validSharedDocs.forEach(doc => {
        allDocsMap.set(doc!.id, doc);
      });

      const allDocs = Array.from(allDocsMap.values());

      // 4. Map and Sort
      const mappedResources = allDocs.map(doc => ({
        ...doc.data,
        id: doc.id,
        createdAt: serializeDate(doc.createdAt) || (serializeDate(doc.data?.createdAt) as string),
        updatedAt: serializeDate(doc.updatedAt) || (serializeDate(doc.data?.updatedAt) as string),
      }));

      // Sort by updatedAt desc
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
    }
  },
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export const { clearResources } = resourceSlice.actions;
export default resourceSlice.reducer;
