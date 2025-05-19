import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';  // Auth slice
import profileReducer from './profileSlice';  // Profile slice
import eventsReducer from './eventsSlice';  // Events slice
import messageReducer from './messageSlice'; // Message slice

const store = configureStore({
  reducer: {
    auth: authReducer,  // Handles auth state
    profile: profileReducer,  // Handles profile state
    events: eventsReducer,  // Handles events state
    messages: messageReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable the middleware
    }),
});

// TypeScript types for Redux state and dispatch
export type RootState = ReturnType<typeof store.getState>;  // Type of the entire Redux state
export type AppDispatch = typeof store.dispatch;  // Type of the dispatch function

export default store;
