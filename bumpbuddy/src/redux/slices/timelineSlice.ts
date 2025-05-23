import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PregnancyWeek } from "timeline-types";
import timelineService from "../../services/timelineService";

// Define the state interface
interface TimelineState {
  currentWeek: number;
  selectedWeek: number | null;
  weekData: PregnancyWeek | null;
  allWeeks: PregnancyWeek[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: TimelineState = {
  currentWeek: 0,
  selectedWeek: null,
  weekData: null,
  allWeeks: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchAllWeeks = createAsyncThunk(
  "timeline/fetchAllWeeks",
  async (language: string = "en", { rejectWithValue }) => {
    try {
      const data = await timelineService.getAllWeeks(language);
      return data;
    } catch (error) {
      return rejectWithValue("Failed to fetch pregnancy weeks data");
    }
  }
);

export const fetchWeekData = createAsyncThunk(
  "timeline/fetchWeekData",
  async (
    { weekNumber, language = "en" }: { weekNumber: number; language?: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await timelineService.getWeekInfo(weekNumber, language);
      if (!data) {
        return rejectWithValue(`Week ${weekNumber} data not found`);
      }
      return data;
    } catch (error) {
      return rejectWithValue(`Failed to fetch week ${weekNumber} data`);
    }
  }
);

export const fetchCurrentWeekData = createAsyncThunk(
  "timeline/fetchCurrentWeekData",
  async (
    { dueDate, language = "en" }: { dueDate: string | null; language?: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      if (!dueDate) {
        return rejectWithValue("Due date not set");
      }

      const currentWeek = timelineService.calculateCurrentWeek(dueDate);
      dispatch(setCurrentWeek(currentWeek));

      if (currentWeek > 0) {
        const data = await timelineService.getWeekInfo(currentWeek, language);
        if (!data) {
          return rejectWithValue(`Week ${currentWeek} data not found`);
        }
        return data;
      } else {
        return rejectWithValue("Invalid pregnancy week");
      }
    } catch (error) {
      return rejectWithValue("Failed to fetch current week data");
    }
  }
);

// Create the slice
const timelineSlice = createSlice({
  name: "timeline",
  initialState,
  reducers: {
    setCurrentWeek: (state, action: PayloadAction<number>) => {
      state.currentWeek = action.payload;
    },
    selectWeek: (state, action: PayloadAction<number>) => {
      state.selectedWeek = action.payload;
    },
    clearSelection: (state) => {
      state.selectedWeek = null;
      state.weekData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all weeks
      .addCase(fetchAllWeeks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllWeeks.fulfilled, (state, action) => {
        state.loading = false;
        state.allWeeks = action.payload;
      })
      .addCase(fetchAllWeeks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch week data
      .addCase(fetchWeekData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeekData.fulfilled, (state, action) => {
        state.loading = false;
        state.weekData = action.payload;
      })
      .addCase(fetchWeekData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch current week data
      .addCase(fetchCurrentWeekData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentWeekData.fulfilled, (state, action) => {
        state.loading = false;
        state.weekData = action.payload;
      })
      .addCase(fetchCurrentWeekData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { setCurrentWeek, selectWeek, clearSelection } =
  timelineSlice.actions;

export default timelineSlice.reducer;
