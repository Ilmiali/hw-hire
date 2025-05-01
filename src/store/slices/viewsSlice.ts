import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Document, getDatabaseService } from '../../services/databaseService';
import { View, DatabaseView } from '../../types/view';
import { Group } from '../../types/group';
import { RootState } from '../index';

interface ViewsState {
  views: View[];
  currentView: View | null;
  loading: boolean;
  error: string | null;
}

const initialState: ViewsState = {
  views: [],
  currentView: null,
  loading: false,
  error: null
};

export const fetchOrganizationViews = createAsyncThunk(
  'views/fetchOrganizationViews',
  async ({ organizationId, userId }: { organizationId: string; userId: string }, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const views = await db.getDocuments<Document>('views', {
        constraints: [
          {
            field: 'organizationId',
            operator: '==',
            value: organizationId
          },
          {
            field: 'members',
            operator: 'array-contains',
            value: userId
          }
        ]
      });
      // Fetch group data for each view
      const viewsWithGroups = await Promise.all(views.map(async (view) => {
        const groupIds = view.data.groups as string[];
        const groups = await Promise.all(groupIds.map(async (groupId) => {
          const groupDoc = await db.getDocument<Document>('groups', groupId);
          if (!groupDoc) return null;
          return {
            id: groupDoc.id,
            name: groupDoc.data.name as string,
            totalNumTickets: groupDoc.data.totalNumTickets as number,
            organizationId: groupDoc.data.organizationId as string,
            members: groupDoc.data.members as string[],
            createdAt: groupDoc.createdAt || new Date(),
            updatedAt: groupDoc.updatedAt || new Date()
          } as Group;
        }));
        
        // Filter out null groups and groups where user is not a member
        const validGroups = groups.filter((group): group is Group => 
          group !== null && group.members.includes(userId)
        );
        
        const totalNumTickets = validGroups.reduce((sum, group) => sum + (group.totalNumTickets || 0), 0);
        
        return {
          createdAt: view.createdAt || new Date(),
          updatedAt: view.updatedAt || new Date(),
          id: view.id,
          layout: view.data.layout as View['layout'],
          name: view.data.name as string,
          organizationId: view.data.organizationId as string,
          members: view.data.members as View['members'],
          groups: validGroups,
          totalNumTickets
        } as View;
      }));
      return viewsWithGroups;
    } catch (error) {
      console.error('Error fetching views:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch views';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createView = createAsyncThunk(
  'views/createView',
  async ({ 
    name, 
    organizationId, 
    members,
    groups,
    layout
  }: { 
    name: string; 
    organizationId: string; 
    members: string[];
    groups: string[];
    layout: {
      cover: string;
      coverType: string;
      iconType: string;
      icon: string;
    }
  }, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const newView: Omit<DatabaseView, 'id'> = {
        name,
        organizationId,
        members,
        groups,
        layout,
        totalNumTickets: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.addDocument('views', newView);
    } catch (error) {
      console.error('Error creating view:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create view';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateView = createAsyncThunk(
  'views/updateView',
  async ({ id, data }: { id: string; data: Partial<View> }, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const updateData: Partial<DatabaseView> = {
        ...data,
        groups: data.groups ? (data.groups as Group[]).map(group => group.id) : undefined,
        updatedAt: new Date()
      };
      await db.updateDocument('views', id, updateData);
    } catch (error) {
      console.error('Error updating view:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update view';
      return rejectWithValue(errorMessage);
    }
  }
);

export const viewsSlice = createSlice({
  name: 'views',
  initialState,
  reducers: {
    setCurrentView: (state, action) => {
      const viewId = action.payload;
      state.currentView = state.views.find(view => view.id === viewId) || null;
    },
    clearViews: (state) => {
      state.views = [];
      state.currentView = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizationViews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizationViews.fulfilled, (state, action) => {
        state.loading = false;
        state.views = action.payload;
        // Set the first view as the current one if none is selected
        if (!state.currentView && action.payload.length > 0) {
          state.currentView = action.payload[0];
        }
      })
      .addCase(fetchOrganizationViews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createView.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createView.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createView.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateView.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateView.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateView.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// Export actions
export const { 
  setCurrentView, 
  clearViews,
  setLoading,
  setError,
  clearError
} = viewsSlice.actions;

// Selectors
export const selectViews = (state: RootState) => state.views.views;
export const selectCurrentView = (state: RootState) => state.views.currentView;
export const selectViewsLoading = (state: RootState) => state.views.loading;
export const selectViewsError = (state: RootState) => state.views.error;
export const selectViewById = (state: RootState, viewId: string) => 
  state.views.views.find(view => view.id === viewId) || null;

export default viewsSlice.reducer; 