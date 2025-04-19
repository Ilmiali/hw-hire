import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Document, getDatabaseService } from '../../services/databaseService';
import { View } from '../../types/view';
import { RootState } from '../index';

interface ViewState {
  views: View[];
  currentView: View | null;
  loading: boolean;
  error: string | null;
}

const initialState: ViewState = {
  views: [],
  currentView: null,
  loading: false,
  error: null
};

export const fetchOrganizationViews = createAsyncThunk(
  'view/fetchOrganizationViews',
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
      return views.map(view => ({
        createdAt: view.createdAt || new Date(),
        updatedAt: view.updatedAt || new Date(),
        id: view.id,
        name: view.data.name as string,
        organizationId: view.data.organizationId as string,
        members: view.data.members as View['members']
      }));
    } catch (error) {
      console.error('Error fetching views:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch views';
      return rejectWithValue(errorMessage);
    }
  }
);

const viewSlice = createSlice({
  name: 'view',
  initialState,
  reducers: {
    setCurrentView: (state, action) => {
      state.currentView = action.payload;
    },
    clearViews: (state) => {
      state.views = [];
      state.currentView = null;
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
      });
  }
});

export const { setCurrentView, clearViews } = viewSlice.actions;

// Selectors
export const selectViews = (state: RootState) => state.view.views;
export const selectCurrentView = (state: RootState) => state.view.currentView;
export const selectViewLoading = (state: RootState) => state.view.loading;
export const selectViewError = (state: RootState) => state.view.error;

export default viewSlice.reducer; 