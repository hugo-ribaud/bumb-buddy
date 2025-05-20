import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { fetalSizeService } from "../../services/fetalSizeService";
import { FetalSizeComparison } from "../../types/fetalSize";
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
