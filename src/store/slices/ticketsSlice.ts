import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDatabaseService, Document } from '../../services/databaseService';
import { Ticket } from '../../types/ticket';

interface TicketsState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  loading: boolean;
  error: string | null;
  activeListeners: { [key: string]: () => void }; // Track active listeners by ticket ID
}

const initialState: TicketsState = {
  tickets: [],
  currentTicket: null,
  loading: false,
  error: null,
  activeListeners: {},
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
        assignedTo: document.data.assignedTo,
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
        constraints: [{ field: 'assignedTo', operator: 'in', value: memberIds }],
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

// Async thunk for updating a ticket
export const updateTicket = createAsyncThunk(
  'tickets/updateTicket',
  async ({ id, data }: { id: string; data: Partial<Ticket> }, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const updatedTicket = await db.updateDocument('tickets', id, data);
      return updatedTicket;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to update ticket');
    }
  }
);

// Async thunk for listening to ticket changes
export const listenToTicketChanges = createAsyncThunk(
  'tickets/listenToTicketChanges',
  async (ticketId: string, { dispatch, rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const unsubscribe = db.onDocumentChange('tickets', ticketId, (document) => {
        if (document) {
          const ticket = {
            id: document.id,
            updatedAt: document.updatedAt,
            subject: document.data.subject,
            status: document.data.status,
            priority: document.data.priority,
            assignedTo: document.data.assignedTo,
            snippet: document.data.snippet,
            channel: document.data.channel,
            groupId: document.data.groupId,
            tags: document.data.tags,
            type: document.data.type,
            source: document.data.source,
            requestedAt: document.createdAt,
            requestedBy: document.data.from,
          } as Ticket;
          
          // Update current ticket if it's the one being listened to
          dispatch(setCurrentTicket(ticket));
          
          // Update ticket in tickets array if it exists
          dispatch(updateTicketInList(ticket));
        }
      });
      
      return { ticketId, unsubscribe };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to listen to ticket changes');
    }
  }
);

// Async thunk for unregistering from ticket changes
export const unregisterTicketListener = createAsyncThunk(
  'tickets/unregisterTicketListener',
  async (ticketId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { tickets: TicketsState };
      const unsubscribe = state.tickets.activeListeners[ticketId];
      
      if (unsubscribe) {
        unsubscribe();
      }
      
      return ticketId;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to unregister ticket listener');
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
    setCurrentTicket: (state, action) => {
      state.currentTicket = action.payload;
    },
    updateTicketInList: (state, action) => {
      const index = state.tickets.findIndex(ticket => ticket.id === action.payload.id);
      if (index !== -1) {
        state.tickets[index] = action.payload;
      }
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
      })
      // Update ticket
      .addCase(updateTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTicket.fulfilled, (state) => {
        state.loading = false;
        // Update the ticket in the tickets array if it exists
      /*  const index = state.tickets.findIndex(ticket => ticket.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = { ...state.tickets[index], ...action.payload };
        }
        // Update currentTicket if it's the one being updated
        if (state.currentTicket?.id === action.payload.id) {
          state.currentTicket = { ...state.currentTicket, ...action.payload };
        }*/
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Listen to ticket changes
      .addCase(listenToTicketChanges.fulfilled, (state, action) => {
        const { ticketId, unsubscribe } = action.payload;
        state.activeListeners[ticketId] = unsubscribe;
      })
      .addCase(listenToTicketChanges.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Unregister ticket listener
      .addCase(unregisterTicketListener.fulfilled, (state, action) => {
        const ticketId = action.payload;
        delete state.activeListeners[ticketId];
      })
      .addCase(unregisterTicketListener.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearTickets, clearCurrentTicket, setCurrentTicket, updateTicketInList } = ticketsSlice.actions;
export default ticketsSlice.reducer; 