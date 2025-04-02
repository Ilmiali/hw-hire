import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { getDatabaseService, Document } from '../../services/databaseService';
import { Message } from '../../types/message';

interface MessagesState {
  messages: Record<string, Message[]>; // Keyed by ticketId
  loading: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  messages: {},
  loading: false,
  error: null,
};

// Async thunk for fetching messages by ticket ID
export const fetchMessagesByTicketId = createAsyncThunk(
  'messages/fetchMessagesByTicketId',
  async (ticketId: string, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const payload = await db.getDocuments<Document>('messages', {
        constraints: [{ field: 'ticketId', operator: '==', value: ticketId }],
        sortBy: { field: 'createdAt', order: 'asc' }
      });
      const messages = payload.map(item => {
        return {
          id: item.id,
          sentAt: item.createdAt,
          content: item.data.body,
          cc: item.data.cc,
          bcc: item.data.bcc,
          from: item.data.from,
          to: item.data.to,
          ticketId: item.data.ticketId
        } as Message;
      });
      console.log('Messages:', messages, ticketId);
      return { ticketId, messages };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch messages');
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = {};
      state.error = null;
    },
    clearMessagesForTicket: (state, action) => {
      const ticketId = action.payload;
      delete state.messages[ticketId];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessagesByTicketId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessagesByTicketId.fulfilled, (state, action) => {
        state.loading = false;
        const { ticketId, messages } = action.payload;
        state.messages[ticketId] = messages;
      })
      .addCase(fetchMessagesByTicketId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMessages, clearMessagesForTicket } = messagesSlice.actions;
export default messagesSlice.reducer; 