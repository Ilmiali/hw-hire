import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import applicationsReducer from './slices/applicationsSlice';
import messagesReducer from './slices/messagesSlice';
import organizationReducer from './slices/organizationSlice';
import viewsReducer from './slices/viewsSlice';
import groupsReducer from './slices/groupsSlice';

import formsReducer from './slices/formsSlice';
import shareReducer from './slices/shareSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    applications: applicationsReducer,
    messages: messagesReducer,
    organization: organizationReducer,
    views: viewsReducer,
    groups: groupsReducer,
    forms: formsReducer,
    share: shareReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 