import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDatabaseService, Document } from '../../services/databaseService';
import { Ticket } from '../../types/ticket';

interface TicketsState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  loading: boolean;
  error: string | null;
}

const initialState: TicketsState = {
  tickets: [],
  currentTicket: null,
  loading: false,
  error: null,
};

// Async thunk for fetching tickets
export const fetchTickets = createAsyncThunk(
  'tickets/fetchTickets',
  async (_, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const tickets = await db.getDocuments<Ticket>('tickets', {
        sortBy: { field: 'createdAt', order: 'desc' }
      });
      return tickets;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch tickets');
    }
  }
);

// Async thunk for fetching a single ticket
export const fetchTicketById = createAsyncThunk(
  'tickets/fetchTicketById',
  async (ticketId: string, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const document = await db.getDocument<Document>('tickets', ticketId);
      if (!document) {
        return rejectWithValue('Ticket not found');
      }
      const ticket = {
        id: document.id,
        updatedAt: document.updatedAt,
        subject: document.data.subject,
        status: document.data.status,
        priority: document.data.priority,
        assignee: document.data.assignee,
        snippet: document.data.snippet,
        channel: document.data.channel,
        groupId: document.data.groupId,
        tags: document.data.tags,
        type: document.data.type,
        source: document.data.source,
        requestedAt: document.createdAt,
        requestedBy: document.data.from,
      } as Ticket;
      if (!ticket) {
        return rejectWithValue('Ticket not found');
      }
      return ticket;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch ticket');
    }
  }
);

// Async thunk for fetching tickets by groupId
export const fetchTicketsByGroupId = createAsyncThunk(
  'tickets/fetchTicketsByGroupId',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const tickets = await db.getDocuments<Ticket>('tickets', {
        constraints: [{ field: 'groupId', operator: '==', value: groupId }],
        sortBy: { field: 'createdAt', order: 'desc' }
      });
      return tickets;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch tickets by groupId');
    }
  }
);

// Async thunk for fetching tickets by members
export const fetchTicketsByMembers = createAsyncThunk(
  'tickets/fetchTicketsByMembers',
  async (memberIds: string[], { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const tickets = await db.getDocuments<Ticket>('tickets', {
        constraints: [{ field: 'assignee', operator: 'in', value: memberIds }],
        sortBy: { field: 'createdAt', order: 'desc' }
      });
      return tickets;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch tickets by members');
    }
  }
);

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    clearTickets: (state) => {
      state.tickets = [];
      state.currentTicket = null;
      state.error = null;
    },
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all tickets
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
      })
      // Fetch single ticket
      .addCase(fetchTicketById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTicket = action.payload;
      })
      .addCase(fetchTicketById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch tickets by groupId
      .addCase(fetchTicketsByGroupId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketsByGroupId.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchTicketsByGroupId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch tickets by members
      .addCase(fetchTicketsByMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketsByMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchTicketsByMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTickets, clearCurrentTicket } = ticketsSlice.actions;
export default ticketsSlice.reducer; 