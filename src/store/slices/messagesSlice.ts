import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { serializeDate } from '../../utils/serialization';

import { getDatabaseService, Document } from '../../services/databaseService';
import { Message } from '../../types/message';

interface MessagesState {
  messages: Record<string, Message[]>; // Keyed by applicationId
  loading: boolean;
  error: string | null;
}

const initialState: MessagesState = {
  messages: {},
  loading: false,
  error: null,
};

// Async thunk for fetching messages by application ID
export const fetchMessagesByApplicationId = createAsyncThunk(
  'messages/fetchMessagesByApplicationId',
  async (applicationId: string, { rejectWithValue }) => {
    try {
      const db = getDatabaseService();
      const payload = await db.getDocuments<Document>('messages', {
        constraints: [{ field: 'ticketId', operator: '==', value: applicationId }],
        sortBy: { field: 'createdAt', order: 'asc' }
      });
      const messages = payload.map(item => {
        return {
          id: item.id,
          sentAt: serializeDate(item.createdAt) || new Date().toISOString(),
          content: item.data.body,
          cc: item.data.cc,
          bcc: item.data.bcc,
          from: item.data.from,
          to: item.data.to,
          ticketId: item.data.ticketId
        } as Message;
      });
      console.log('Messages:', messages, applicationId);
      return { applicationId, messages };
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
    clearMessagesForApplication: (state, action) => {
      const applicationId = action.payload;
      delete state.messages[applicationId];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessagesByApplicationId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessagesByApplicationId.fulfilled, (state, action) => {
        state.loading = false;
        const { applicationId, messages } = action.payload;
        state.messages[applicationId] = messages;
      })
      .addCase(fetchMessagesByApplicationId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMessages, clearMessagesForApplication } = messagesSlice.actions;
export default messagesSlice.reducer; 