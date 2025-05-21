import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  PregnancyWeek,
  PregnancyWeekTranslation,
  TrimesterType,
} from "../../types/timeline";

import timelineService from "../../services/timelineService";

// Define the state interface
interface TimelineState {
  currentWeek: number;
  selectedWeek: number | null;
  weekData: PregnancyWeek | null;
  allWeeks: PregnancyWeek[];
  translations: Record<string, PregnancyWeekTranslation[]>;
  availableLanguages: string[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: TimelineState = {
  currentWeek: 0,
  selectedWeek: null,
  weekData: null,
  allWeeks: [],
  translations: {},
  availableLanguages: ["en"],
  loading: false,
  error: null,
};

// Async thunks
export const fetchAllWeeks = createAsyncThunk(
  "timeline/fetchAllWeeks",
  async () => {
    return await timelineService.getAllWeeks();
  }
);

export const fetchWeekData = createAsyncThunk(
  "timeline/fetchWeekData",
  async (weekNumber: number) => {
    return await timelineService.getWeekInfo(weekNumber);
  }
);

export const fetchTrimesterWeeks = createAsyncThunk(
  "timeline/fetchTrimesterWeeks",
  async (trimester: TrimesterType) => {
    return await timelineService.getTrimesterWeeks(trimester);
  }
);

export const fetchCurrentWeek = createAsyncThunk(
  "timeline/fetchCurrentWeek",
  async (dueDate: string | null) => {
    const weekNumber = timelineService.calculateCurrentWeek(dueDate);
    const weekData = await timelineService.getWeekInfo(weekNumber);
    return { weekNumber, weekData };
  }
);

export const fetchAllTranslations = createAsyncThunk(
  "timeline/fetchAllTranslations",
  async () => {
    return await timelineService.getAllTranslations();
  }
);

export const fetchLocalizedWeek = createAsyncThunk(
  "timeline/fetchLocalizedWeek",
  async ({
    weekNumber,
    language,
  }: {
    weekNumber: number;
    language: string;
  }) => {
    return await timelineService.getLocalizedWeek(weekNumber, language);
  }
);

export const fetchWeeksWithTranslations = createAsyncThunk(
  "timeline/fetchWeeksWithTranslations",
  async () => {
    return await timelineService.getAllWeeksWithTranslations();
  }
);

export const clearTimelineCache = createAsyncThunk(
  "timeline/clearCache",
  async () => {
    await timelineService.clearCache();
    return true;
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
    setSelectedWeek: (state, action: PayloadAction<number>) => {
      state.selectedWeek = action.payload;
    },
    clearSelectedWeek: (state) => {
      state.selectedWeek = null;
    },
    clearTimelineError: (state) => {
      state.error = null;
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
        state.error = action.error.message || "Failed to fetch weeks";
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
        state.error = action.error.message || "Failed to fetch week data";
      })

      // Fetch current week data
      .addCase(fetchCurrentWeek.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentWeek.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWeek = action.payload.weekNumber;
        if (action.payload.weekData) {
          state.weekData = action.payload.weekData;
        }
      })
      .addCase(fetchCurrentWeek.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch current week";
      })

      // Fetch all translations
      .addCase(fetchAllTranslations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTranslations.fulfilled, (state, action) => {
        state.loading = false;
        state.translations = action.payload;
        state.availableLanguages = ["en", ...Object.keys(action.payload)];
      })
      .addCase(fetchAllTranslations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch translations";
      })

      // Fetch localized week data
      .addCase(fetchLocalizedWeek.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocalizedWeek.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.weekData = action.payload;
        }
      })
      .addCase(fetchLocalizedWeek.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch localized week";
      })

      // Fetch weeks with translations
      .addCase(fetchWeeksWithTranslations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeeksWithTranslations.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.length > 0) {
          // Extract unique available languages from all weeks
          const languages = new Set<string>();
          languages.add("en"); // Always include English

          action.payload.forEach((week) => {
            week.availableLanguages.forEach((lang) => languages.add(lang));
          });

          state.availableLanguages = Array.from(languages);
          state.allWeeks = action.payload.map((week) => ({
            week: week.week,
            fetal_development: week.fetal_development,
            maternal_changes: week.maternal_changes,
            tips: week.tips,
            nutrition_advice: week.nutrition_advice,
            common_symptoms: week.common_symptoms,
            medical_checkups: week.medical_checkups,
            image_url: week.image_url,
          }));
        }
      })
      .addCase(fetchWeeksWithTranslations.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch weeks with translations";
      })

      // Handle clearTimelineCache
      .addCase(clearTimelineCache.fulfilled, (state) => {
        state.error = null;
      });
  },
});

// Export actions
export const {
  setCurrentWeek,
  setSelectedWeek,
  clearSelectedWeek,
  clearTimelineError,
} = timelineSlice.actions;

export default timelineSlice.reducer;
