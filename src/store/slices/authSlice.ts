import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError
} from 'firebase/auth';
import { auth } from '../../firebase/config';
import { User } from '../../types/user';
import { getDatabaseService, Document } from '../../services/databaseService';
import { fetchUserOrganizations } from './organizationSlice';

interface AuthState {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  userData: null,
  loading: true,
  error: null
};

// Async thunks for authentication actions
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      const authError = error as AuthError;
      return rejectWithValue(authError.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      const authError = error as AuthError;
      return rejectWithValue(authError.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
    } catch (error) {
      const authError = error as AuthError;
      return rejectWithValue(authError.message);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const document = await db.getDocument<Document>('users', userId);
      
      if (!document) {
        return rejectWithValue('User not found');
      }

      // Fetch orgMemberships subcollection
      const membershipsDocs = await db.getDocuments<Document>(`users/${userId}/orgMemberships`);
      
      const orgMemberships = membershipsDocs.map(doc => ({
        id: doc.id,
        name: doc.data.name as string || '',
        role: doc.data.role as string || '',
        joinedAt: doc.data.joinedAt instanceof Object && 'toDate' in doc.data.joinedAt 
          ? (doc.data.joinedAt as any).toDate() 
          : new Date(doc.data.joinedAt as string || Date.now())
      }));

      // Map document data to User type
      const userData: User = {
        id: document.id,
        firstName: document.data.firstName as string || '',
        lastName: document.data.lastName as string || '',
        email: document.data.email as string || '',
        role: document.data.role as string || '',
        phoneNumber: document.data.phoneNumber as string || '',
        accountId: document.data.accountId as string || '',
        accounts: (document.data.accounts as string[]) || [],
        orgMemberships
      };

      return userData;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch user data');
    }
  }
);

// Initialize auth state listener
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { dispatch }) => {
    return new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        dispatch(setUser(user));
        
        if (user) {
          // If user is logged in, fetch their data
          await dispatch(fetchCurrentUser(user.uid));
          // Fetch their organizations and select the first one by default
          await dispatch(fetchUserOrganizations(user.uid));
        } else {
          // Clear user data if logged out
          dispatch(setUserData(null));
        }

        dispatch(setLoading(false));
        resolve();
      });
      return unsubscribe;
    });
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      if (!action.payload) {
        state.userData = null;
      }
      state.error = null;
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
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
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.userData = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        // We might not want to set global loading here to avoid full page screen blocks if it's a background fetch
        // dependent on UX requirements. For now, we'll keep it simple.
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.userData = action.payload;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.error = action.payload as string;
        // Don't clear user state here, just userData fetch failed
      });
  }
});

export const { setUser, setUserData, setLoading, setError, clearError } = authSlice.actions;
export default authSlice.reducer; 