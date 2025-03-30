import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDatabaseService } from '../../services/databaseService';
import { Ticket } from '../../types/ticket';

interface TicketsState {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
}

const initialState: TicketsState = {
  tickets: [],
  loading: false,
  error: null,
};

// Async thunk for fetching tickets
export const fetchTickets = createAsyncThunk(
  'tickets/fetchTickets',
  async (_, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const tickets = await db.getDocuments<Ticket>('tickets');
      console.log('Tickets', tickets);
      return tickets;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch tickets');
    }
  }
);

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    clearTickets: (state) => {
      state.tickets = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTickets } = ticketsSlice.actions;
export default ticketsSlice.reducer; 