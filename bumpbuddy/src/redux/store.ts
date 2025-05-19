import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import healthReducer from "./slices/healthSlice";
import preferencesReducer from "./slices/preferencesSlice";
import timelineReducer from "./slices/timelineSlice";

// Configure the Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    timeline: timelineReducer,
    health: healthReducer,
    preferences: preferencesReducer,
    // Other reducers will be added here as we develop features
  },
  // Add middleware for async operations if needed
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Define RootState and AppDispatch types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
