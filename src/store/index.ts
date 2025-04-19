import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import ticketsReducer from './slices/ticketsSlice';
import messagesReducer from './slices/messagesSlice';
import organizationReducer from './slices/organizationSlice';
import viewsReducer from './slices/viewsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tickets: ticketsReducer,
    messages: messagesReducer,
    organization: organizationReducer,
    views: viewsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 