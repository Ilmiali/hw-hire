import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Document, getDatabaseService } from '../../services/databaseService';
import { Organization } from '../../types/organization';
import { RootState } from '../index';

interface OrganizationState {
  organizations: Organization[];
  currentOrganization: Organization | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrganizationState = {
  organizations: [],
  currentOrganization: null,
  loading: false,
  error: null
};

export const fetchUserOrganizations = createAsyncThunk(
  'organization/fetchUserOrganizations',
  async (userId: string, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const organizations = await db.getDocuments<Document>('organizations', {
        constraints: [{
          field: 'members',
          operator: 'array-contains',
          value: userId
        }]
      });
      console.log('Organizations:', organizations);
      return organizations.map(org => ({
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
        id: org.id,
        name: org.data.name,
        members: org.data.members,
        owner: org.data.owner
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch organizations';
      return rejectWithValue(errorMessage);
    }
  }
);

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setCurrentOrganization: (state, action) => {
      state.currentOrganization = action.payload;
    },
    clearOrganizations: (state) => {
      state.organizations = [];
      state.currentOrganization = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = action.payload;
        // Set the first organization as the current one if none is selected
        if (!state.currentOrganization && action.payload.length > 0) {
          state.currentOrganization = action.payload[0];
        }
      })
      .addCase(fetchUserOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setCurrentOrganization, clearOrganizations } = organizationSlice.actions;

// Selectors
export const selectOrganizations = (state: RootState) => state.organization.organizations;
export const selectCurrentOrganization = (state: RootState) => state.organization.currentOrganization;
export const selectOrganizationLoading = (state: RootState) => state.organization.loading;
export const selectOrganizationError = (state: RootState) => state.organization.error;

export default organizationSlice.reducer; 