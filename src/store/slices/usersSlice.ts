import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDatabaseService, Document } from '../../services/databaseService';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organizations: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface UsersState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
};

// Async thunk for fetching users by organizationId
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (organizationId: string, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const users = await db.getDocuments<Document>('users', {
        constraints: [
          {
            field: 'organizations',
            operator: 'array-contains',
            value: organizationId
          }
        ],
        sortBy: { field: 'name', order: 'asc' }
      });

      return users.map(user => ({
        id: user.id,
        name: user.data.name as string,
        email: user.data.email as string,
        role: user.data.role as string,
        organizations: user.data.organizations as string[],
        createdAt: user.createdAt || new Date(),
        updatedAt: user.updatedAt || new Date()
      })) as User[];
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch users');
    }
  }
);

// Async thunk for fetching a single user by ID
export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (userId: string, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const document = await db.getDocument<Document>('users', userId);
      if (!document) {
        return rejectWithValue('User not found');
      }

      const user = {
        id: document.id,
        name: document.data.name as string,
        email: document.data.email as string,
        role: document.data.role as string,
        organizations: document.data.organizations as string[],
        createdAt: document.createdAt || new Date(),
        updatedAt: document.updatedAt || new Date()
      } as User;

      return user;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch user');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUsers: (state) => {
      state.users = [];
      state.currentUser = null;
      state.error = null;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single user
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUsers, clearCurrentUser } = usersSlice.actions;
export default usersSlice.reducer; 