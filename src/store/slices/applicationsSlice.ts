import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { serializeDate } from '../../utils/serialization';
import { getDatabaseService, Document as DbDocument } from '../../services/databaseService';
import { Application } from '../../types/application';

interface ApplicationsState {
  applications: Application[];
  currentApplication: Application | null;
  loading: boolean;
  error: string | null;
  activeListeners: { [key: string]: () => void }; // Track active listeners by application ID
}

const initialState: ApplicationsState = {
  applications: [],
  currentApplication: null,
  loading: false,
  error: null,
  activeListeners: {},
};

// Async thunk for fetching applications
export const fetchApplications = createAsyncThunk(
  'applications/fetchApplications',
  async (_, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const applications = await db.getDocuments<Application>('applications', {
        sortBy: { field: 'createdAt', order: 'desc' }
      });
      return applications.map(app => ({
        ...app,
        updatedAt: serializeDate(app.updatedAt) || new Date().toISOString(),
        appliedAt: serializeDate(app.appliedAt || (app as any).createdAt) || new Date().toISOString(),
        candidate: app.candidate || (app as any).from
      })) as Application[];
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch applications');
    }
  }
);

// Async thunk for fetching a single application
export const fetchApplicationById = createAsyncThunk(
  'applications/fetchApplicationById',
  async (applicationId: string, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const document = await db.getDocument<DbDocument>('applications', applicationId) as any;
      if (!document) {
        return rejectWithValue('Application not found');
      }
      const application: Application = {
        id: document.id,
        updatedAt: serializeDate(document.updatedAt) || new Date().toISOString(),
        subject: (document.data as any).subject,
        status: (document.data as any).status,
        priority: (document.data as any).priority,
        assignedTo: (document.data as any).assignedTo,
        snippet: (document.data as any).snippet,
        channel: (document.data as any).channel,
        groupId: (document.data as any).groupId,
        tags: (document.data as any).tags,
        // type: (document.data as any).type, // Not in interface
        // source: (document.data as any).source, // Not in interface
        appliedAt: serializeDate(document.createdAt) || new Date().toISOString(),
        candidate: (document.data as any).candidate || (document.data as any).from, // Fallback for transition
      } as unknown as Application;
      
      if (!application) {
        return rejectWithValue('Application not found');
      }
      return application;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch application');
    }
  }
);

// Async thunk for fetching applications by groupId
export const fetchApplicationsByGroupId = createAsyncThunk(
  'applications/fetchApplicationsByGroupId',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const applications = await db.getDocuments<Application>('applications', {
        constraints: [{ field: 'groupId', operator: '==', value: groupId }],
        sortBy: { field: 'createdAt', order: 'desc' }
      });
      return applications.map(app => ({
        ...app,
        updatedAt: serializeDate(app.updatedAt) || new Date().toISOString(),
        appliedAt: serializeDate(app.appliedAt || (app as any).createdAt) || new Date().toISOString(),
        candidate: app.candidate || (app as any).from
      })) as Application[];
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch applications by groupId');
    }
  }
);

// Async thunk for fetching applications by members
export const fetchApplicationsByMembers = createAsyncThunk(
  'applications/fetchApplicationsByMembers',
  async (memberIds: string[], { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const applications = await db.getDocuments<Application>('applications', {
        constraints: [{ field: 'assignedTo', operator: 'in', value: memberIds }],
        sortBy: { field: 'createdAt', order: 'desc' }
      });
      return applications.map(app => ({
        ...app,
        updatedAt: serializeDate(app.updatedAt) || new Date().toISOString(),
        appliedAt: serializeDate(app.appliedAt || (app as any).createdAt) || new Date().toISOString(),
        candidate: app.candidate || (app as any).from
      })) as Application[];
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch applications by members');
    }
  }
);

// Async thunk for updating an application
export const updateApplication = createAsyncThunk(
  'applications/updateApplication',
  async ({ id, data }: { id: string; data: Partial<Application> }, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const updatedApplication = await db.updateDocument('applications', id, data);
      return updatedApplication;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to update application');
    }
  }
);

// Async thunk for listening to application changes
export const listenToApplicationChanges = createAsyncThunk(
  'applications/listenToApplicationChanges',
  async (applicationId: string, { dispatch, rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const unsubscribe = db.onDocumentChange('applications', applicationId, (document) => {
        if (document) {
          const doc = document as any;
          const application: Application = {
            id: doc.id,
            updatedAt: serializeDate(doc.updatedAt) || new Date().toISOString(),
            subject: doc.data.subject,
            status: doc.data.status,
            priority: doc.data.priority,
            assignedTo: doc.data.assignedTo,
            snippet: doc.data.snippet,
            channel: doc.data.channel,
            groupId: doc.data.groupId,
            tags: doc.data.tags,
            // type: doc.data.type,
            // source: doc.data.source,
            appliedAt: serializeDate(doc.createdAt) || new Date().toISOString(),
            candidate: doc.data.candidate || doc.data.from,
          } as unknown as Application;
          
          // Update current application if it's the one being listened to
          dispatch(setCurrentApplication(application));
          
          // Update application in applications array if it exists
          dispatch(updateApplicationInList(application));
        }
      });
      
      return { applicationId, unsubscribe };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to listen to application changes');
    }
  }
);

// Async thunk for unregistering from application changes
export const unregisterApplicationListener = createAsyncThunk(
  'applications/unregisterApplicationListener',
  async (applicationId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { applications: ApplicationsState };
      const unsubscribe = state.applications.activeListeners[applicationId];
      
      if (unsubscribe) {
        unsubscribe();
      }
      
      return applicationId;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to unregister application listener');
    }
  }
);

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    clearApplications: (state) => {
      state.applications = [];
      state.currentApplication = null;
      state.error = null;
    },
    clearCurrentApplication: (state) => {
      state.currentApplication = null;
    },
    setCurrentApplication: (state, action) => {
      state.currentApplication = action.payload;
    },
    updateApplicationInList: (state, action) => {
      const index = state.applications.findIndex(app => app.id === action.payload.id);
      if (index !== -1) {
        state.applications[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all applications
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single application
      .addCase(fetchApplicationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentApplication = action.payload;
      })
      .addCase(fetchApplicationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch applications by groupId
      .addCase(fetchApplicationsByGroupId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationsByGroupId.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(fetchApplicationsByGroupId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch applications by members
      .addCase(fetchApplicationsByMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationsByMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(fetchApplicationsByMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update application
      .addCase(updateApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateApplication.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Listen to application changes
      .addCase(listenToApplicationChanges.fulfilled, (state, action) => {
        const { applicationId, unsubscribe } = action.payload;
        state.activeListeners[applicationId] = unsubscribe;
      })
      .addCase(listenToApplicationChanges.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Unregister application listener
      .addCase(unregisterApplicationListener.fulfilled, (state, action) => {
        const applicationId = action.payload;
        delete state.activeListeners[applicationId];
      })
      .addCase(unregisterApplicationListener.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearApplications, clearCurrentApplication, setCurrentApplication, updateApplicationInList } = applicationsSlice.actions;
export default applicationsSlice.reducer; 
