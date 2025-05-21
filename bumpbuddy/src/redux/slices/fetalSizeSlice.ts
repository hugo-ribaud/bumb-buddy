import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { fetalSizeService } from "../../services/fetalSizeService";
import { FetalSizeComparison } from "../../types/fetalSize";

interface FetalSizeState {
  allComparisons: FetalSizeComparison[];
  currentComparison: FetalSizeComparison | null;
  loading: boolean;
  error: string | null;
}

const initialState: FetalSizeState = {
  allComparisons: [],
  currentComparison: null,
  loading: false,
  error: null,
};

export const fetchAllFetalSizes = createAsyncThunk(
  "fetalSize/fetchAll",
  async () => {
    return await fetalSizeService.getAll();
  }
);

export const fetchFetalSizeByWeek = createAsyncThunk(
  "fetalSize/fetchByWeek",
  async (week: number) => {
    return await fetalSizeService.getByWeek(week);
  }
);

const fetalSizeSlice = createSlice({
  name: "fetalSize",
  initialState,
  reducers: {
    clearFetalSizeData: (state) => {
      state.allComparisons = [];
      state.currentComparison = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFetalSizes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllFetalSizes.fulfilled,
        (state, action: PayloadAction<FetalSizeComparison[]>) => {
          state.loading = false;
          state.allComparisons = action.payload;
        }
      )
      .addCase(fetchAllFetalSizes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch fetal size data";
      })
      .addCase(fetchFetalSizeByWeek.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchFetalSizeByWeek.fulfilled,
        (state, action: PayloadAction<FetalSizeComparison | null>) => {
          state.loading = false;
          state.currentComparison = action.payload;
        }
      )
      .addCase(fetchFetalSizeByWeek.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch fetal size data";
      });
  },
});

export const { clearFetalSizeData } = fetalSizeSlice.actions;
export default fetalSizeSlice.reducer;
