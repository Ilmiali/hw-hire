import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './slices/authSlice';
import applicationsReducer from './slices/applicationsSlice';
import messagesReducer from './slices/messagesSlice';
import organizationReducer from './slices/organizationSlice';
import viewsReducer from './slices/viewsSlice';
import groupsReducer from './slices/groupsSlice';

import formsReducer from './slices/formsSlice';
import shareReducer from './slices/shareSlice';
import resourceReducer from './slices/resourceSlice';
import usersReducer from './slices/usersSlice';
import applicationDraftsReducer from './slices/applicationDraftsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  applications: applicationsReducer,
  messages: messagesReducer,
  organization: organizationReducer,
  views: viewsReducer,
  groups: groupsReducer,
  forms: formsReducer,
  share: shareReducer,
  resource: resourceReducer,
  users: usersReducer,
  applicationDrafts: applicationDraftsReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'organization', 'applicationDrafts'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 