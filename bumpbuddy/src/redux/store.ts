import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice } from "@reduxjs/toolkit";
import appointmentReducer from "./slices/appointmentSlice";
import authReducer from "./slices/authSlice";
import healthReducer from "./slices/healthSlice";
import preferencesReducer from "./slices/preferencesSlice";
import timelineReducer from "./slices/timelineSlice";

// Create a sync reducer interface for tracking offline operations

const networkSlice = createSlice({
  name: "network",
  initialState: {
    isConnected: true,
    lastOnline: new Date().toISOString(),
    pendingSyncCount: 0,
  },
  reducers: {
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
      if (action.payload) {
        state.lastOnline = new Date().toISOString();
      }
    },
    setPendingSyncCount: (state, action) => {
      state.pendingSyncCount = action.payload;
    },
  },
});

export const { setConnectionStatus, setPendingSyncCount } =
  networkSlice.actions;

// Configure redux-persist
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  // Don't persist auth state as it's managed by Supabase
  blacklist: ["auth"],
  // Add state recovery options
  timeout: 10000, // 10 seconds
};

// Configure specific persistence settings for health data
const healthPersistConfig = {
  key: "health",
  storage: AsyncStorage,
  // Optional: use stateReconciler to handle conflicts
  // stateReconciler: autoMergeLevel2,
};

// Configure specific persistence settings for appointment data
const appointmentPersistConfig = {
  key: "appointment",
  storage: AsyncStorage,
};

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  timeline: timelineReducer,
  health: persistReducer(healthPersistConfig, healthReducer),
  preferences: preferencesReducer,
  network: networkSlice.reducer,
  appointment: persistReducer(appointmentPersistConfig, appointmentReducer),
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the Redux store
export const store = configureStore({
  reducer: persistedReducer,
  // Add middleware for async operations
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

// Define RootState and AppDispatch types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
