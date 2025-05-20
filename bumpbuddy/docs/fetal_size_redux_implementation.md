# Fetal Size Comparison - Redux Implementation

## Redux Slice

```typescript
// src/redux/slices/fetalSizeSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { FetalSizeComparison } from "../../types/fetalSize";
import { fetalSizeService } from "../../services/fetalSizeService";
import { RootState } from "../store";

// Define the state interface
interface FetalSizeState {
  sizeComparisons: FetalSizeComparison[];
  currentWeekComparison: FetalSizeComparison | null;
  selectedWeekComparison: FetalSizeComparison | null;
  loading: boolean;
  error: string | null;
}

// Define initial state
const initialState: FetalSizeState = {
  sizeComparisons: [],
  currentWeekComparison: null,
  selectedWeekComparison: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchAllSizeComparisons = createAsyncThunk(
  "fetalSize/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await fetalSizeService.getAllSizeComparisons();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchSizeComparisonByWeek = createAsyncThunk(
  "fetalSize/fetchByWeek",
  async (week: number, { rejectWithValue }) => {
    try {
      const comparison = await fetalSizeService.getSizeComparisonByWeek(week);
      if (!comparison) {
        return rejectWithValue(`No comparison data found for week ${week}`);
      }
      return comparison;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const clearFetalSizeCache = createAsyncThunk(
  "fetalSize/clearCache",
  async (_, { dispatch }) => {
    await fetalSizeService.clearCache();
    // Refetch after clearing cache
    dispatch(fetchAllSizeComparisons());
  }
);

// Create the slice
const fetalSizeSlice = createSlice({
  name: "fetalSize",
  initialState,
  reducers: {
    setSelectedWeek: (state, action: PayloadAction<number>) => {
      state.selectedWeekComparison =
        state.sizeComparisons.find((item) => item.week === action.payload) ||
        null;
    },
    clearSelectedWeek: (state) => {
      state.selectedWeekComparison = null;
    },
    setCurrentWeek: (state, action: PayloadAction<number>) => {
      state.currentWeekComparison =
        state.sizeComparisons.find((item) => item.week === action.payload) ||
        null;
    },
  },
  extraReducers: (builder) => {
    // Handle fetchAllSizeComparisons
    builder.addCase(fetchAllSizeComparisons.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAllSizeComparisons.fulfilled, (state, action) => {
      state.loading = false;
      state.sizeComparisons = action.payload;
    });
    builder.addCase(fetchAllSizeComparisons.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Handle fetchSizeComparisonByWeek
    builder.addCase(fetchSizeComparisonByWeek.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSizeComparisonByWeek.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedWeekComparison = action.payload;
    });
    builder.addCase(fetchSizeComparisonByWeek.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

// Export actions
export const { setSelectedWeek, clearSelectedWeek, setCurrentWeek } =
  fetalSizeSlice.actions;

// Export selectors
export const selectAllSizeComparisons = (state: RootState) =>
  state.fetalSize.sizeComparisons;
export const selectCurrentWeekComparison = (state: RootState) =>
  state.fetalSize.currentWeekComparison;
export const selectSelectedWeekComparison = (state: RootState) =>
  state.fetalSize.selectedWeekComparison;
export const selectFetalSizeLoading = (state: RootState) =>
  state.fetalSize.loading;
export const selectFetalSizeError = (state: RootState) => state.fetalSize.error;

// Export reducer
export default fetalSizeSlice.reducer;
```

## Store Integration

Update the Redux store configuration to include the new slice:

```typescript
// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";

// Import existing reducers
import authReducer from "./slices/authSlice";
import timelineReducer from "./slices/timelineSlice";
import foodReducer from "./slices/foodSlice";
import healthReducer from "./slices/healthSlice";

// Import new reducer
import fetalSizeReducer from "./slices/fetalSizeSlice";

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "timeline", "food", "health", "fetalSize"], // Add fetalSize to persist list
};

const rootReducer = combineReducers({
  auth: authReducer,
  timeline: timelineReducer,
  food: foodReducer,
  health: healthReducer,
  fetalSize: fetalSizeReducer, // Add new reducer here
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## Usage in Components

### Loading Data

```typescript
// Inside a component
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllSizeComparisons,
  selectAllSizeComparisons,
  selectFetalSizeLoading,
} from "../redux/slices/fetalSizeSlice";
import { AppDispatch } from "../redux/store";

const Component = () => {
  const dispatch = useDispatch<AppDispatch>();
  const sizeComparisons = useSelector(selectAllSizeComparisons);
  const loading = useSelector(selectFetalSizeLoading);

  useEffect(() => {
    if (sizeComparisons.length === 0) {
      dispatch(fetchAllSizeComparisons());
    }
  }, [dispatch, sizeComparisons.length]);

  // Component logic...
};
```

### Selecting a Week

```typescript
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedWeek,
  selectSelectedWeekComparison,
} from "../redux/slices/fetalSizeSlice";

const WeekSelector = () => {
  const dispatch = useDispatch();
  const selectedComparison = useSelector(selectSelectedWeekComparison);

  const handleWeekSelection = (week: number) => {
    dispatch(setSelectedWeek(week));
  };

  // Component logic...
};
```

### Settings Current Week Based on Due Date

```typescript
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWeek } from "../redux/slices/fetalSizeSlice";
import { selectUserProfile } from "../redux/slices/authSlice";
import { calculateCurrentWeek } from "../utils/pregnancyUtils";

const PregnancyTracker = () => {
  const dispatch = useDispatch();
  const userProfile = useSelector(selectUserProfile);

  useEffect(() => {
    if (userProfile?.due_date) {
      const currentWeek = calculateCurrentWeek(userProfile.due_date);
      dispatch(setCurrentWeek(currentWeek));
    }
  }, [dispatch, userProfile?.due_date]);

  // Component logic...
};
```

This Redux implementation provides a comprehensive state management solution for the fetal size comparison feature, with proper caching, error handling, and selectors for accessing the data throughout the application.
