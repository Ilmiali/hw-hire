import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { serializeDate } from '../../utils/serialization';
import { getDatabaseService, Document as DbDocument } from '../../services/databaseService';
import { Group } from '../../types/group';
import { RootState } from '../index';

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

// Async thunk for creating a group
export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (groupData: Omit<Group, 'id'>, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const document = await db.addDocument('groups', groupData);
      return {
        id: document.id,
        ...groupData,
        createdAt: serializeDate(groupData.createdAt) || new Date().toISOString(),
        updatedAt: serializeDate(groupData.updatedAt) || new Date().toISOString()
      } as Group;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to create group');
    }
  }
);

// Async thunk for updating a group
export const updateGroup = createAsyncThunk(
  'groups/updateGroup',
  async ({ id, ...groupData }: Group, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      await db.updateDocument('groups', id, groupData);
      return { 
        id, 
        ...groupData,
        createdAt: serializeDate(groupData.createdAt) || new Date().toISOString(),
        updatedAt: serializeDate(groupData.updatedAt) || new Date().toISOString()
      } as Group;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to update group');
    }
  }
);

// Async thunk for fetching groups by organizationId and checking if user is a member
export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async ({ organizationId, userId }: { organizationId: string; userId: string }, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const groups = await db.getDocuments<DbDocument>('groups', {
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
        name: group.name as string,
        organizationId: group.organizationId as string,
        totalNumApplications: (group.totalNumApplications || group.totalNumTickets) as number,
        description: group.description as string,
        members: (group.members as string[]).filter((member: string) => member !== group.owner),
        createdAt: serializeDate(group.createdAt || new Date()) || new Date().toISOString(),
        updatedAt: serializeDate(group.updatedAt || new Date()) || new Date().toISOString()
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
      const document = await db.getDocument<DbDocument>('groups', groupId);
      if (!document) {
        return rejectWithValue('Group not found');
      }

      const group = {
        id: document.id,
        name: document.name as string,
        organizationId: document.organizationId as string,
        totalNumApplications: (document.totalNumApplications || document.totalNumTickets) as number,
        members: document.members as string[],
        createdAt: serializeDate(document.createdAt || new Date()) || new Date().toISOString(),
        updatedAt: serializeDate(document.updatedAt || new Date()) || new Date().toISOString()
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

// Async thunk for deleting a group
export const deleteGroup = createAsyncThunk(
  'groups/deleteGroup',
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      await db.deleteDocument('groups', id);
      return id;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to delete group');
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
      })
      // Create group
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups.push(action.payload);
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update group
      .addCase(updateGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.groups.findIndex(group => group.id === action.payload.id);
        if (index !== -1) {
          state.groups[index] = action.payload;
        }
        if (state.currentGroup?.id === action.payload.id) {
          state.currentGroup = action.payload;
        }
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete group
      .addCase(deleteGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = state.groups.filter(group => group.id !== action.payload);
        if (state.currentGroup?.id === action.payload) {
          state.currentGroup = null;
        }
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearGroups, clearCurrentGroup } = groupsSlice.actions;

export const selectGroupById = (state: RootState, groupId: string) => 
  state.groups.groups.find(group => group.id === groupId) || null;

export default groupsSlice.reducer; 