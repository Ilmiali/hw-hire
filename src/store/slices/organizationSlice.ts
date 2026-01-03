import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { serializeDate } from '../../utils/serialization';
import { Document as DbDocument, getDatabaseService } from '../../services/databaseService';
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
      
      // First fetch the memberships to get the IDs from the subcollection
      const membershipsDocs = await db.getDocuments<DbDocument>(`users/${userId}/orgMemberships`);
      const orgIds = membershipsDocs.map(doc => doc.id);

      if (orgIds.length === 0) {
        return [];
      }

      // Fetch each organization individually
      const orgPromises = orgIds.map(id => db.getDocument<DbDocument>('orgs', id));
      const orgDocs = await Promise.all(orgPromises);
      
      const filteredOrgs = orgDocs.filter((doc): doc is DbDocument => doc !== null);

      console.log('Fetched Organizations:', filteredOrgs);

      return filteredOrgs.map(org => ({
        id: org.id,
        name: org.name as string,
        members: [], // Members are now in a subcollection, providing empty array for now to match type
        owner: org.owner as string,
        createdAt: serializeDate(org.createdAt || new Date()) || new Date().toISOString(),
        updatedAt: serializeDate(org.updatedAt || new Date()) || new Date().toISOString()
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