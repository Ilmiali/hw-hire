import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDatabaseService, Document } from '../../services/databaseService';
import { Group } from '../../types/group';

interface GroupsState {
  groups: Group[];
  currentGroup: Group | null;
  loading: boolean;
  error: string | null;
}

const initialState: GroupsState = {
  groups: [],
  currentGroup: null,
  loading: false,
  error: null,
};

// Async thunk for fetching groups by organizationId and checking if user is a member
export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async ({ organizationId, userId }: { organizationId: string; userId: string }, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const groups = await db.getDocuments<Document>('groups', {
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
        ],
        sortBy: { field: 'name', order: 'asc' }
      });

      return groups.map(group => ({
        id: group.id,
        name: group.data.name as string,
        organizationId: group.data.organizationId as string,
        totalNumTickets: group.data.totalNumTickets as number,
        members: group.data.members as string[],
        createdAt: group.createdAt || new Date(),
        updatedAt: group.updatedAt || new Date()
      })) as Group[];
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch groups');
    }
  }
);

// Async thunk for fetching a single group by ID
export const fetchGroupById = createAsyncThunk(
  'groups/fetchGroupById',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const document = await db.getDocument<Document>('groups', groupId);
      if (!document) {
        return rejectWithValue('Group not found');
      }

      const group = {
        id: document.id,
        name: document.data.name as string,
        organizationId: document.data.organizationId as string,
        totalNumTickets: document.data.totalNumTickets as number,
        members: document.data.members as string[],
        createdAt: document.createdAt || new Date(),
        updatedAt: document.updatedAt || new Date()
      } as Group;

      return group;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch group');
    }
  }
);

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearGroups: (state) => {
      state.groups = [];
      state.currentGroup = null;
      state.error = null;
    },
    clearCurrentGroup: (state) => {
      state.currentGroup = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch groups
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single group
      .addCase(fetchGroupById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroupById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGroup = action.payload;
      })
      .addCase(fetchGroupById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearGroups, clearCurrentGroup } = groupsSlice.actions;
export default groupsSlice.reducer; 