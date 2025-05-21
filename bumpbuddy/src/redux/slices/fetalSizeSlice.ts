import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  FetalSizeComparison,
  FetalSizeComparisonWithTranslations,
} from "../../types/fetalSize";

import { fetalSizeService } from "../../services/fetalSizeService";

interface FetalSizeState {
  allComparisons: FetalSizeComparison[];
  currentComparison: FetalSizeComparison | null;
  translatedComparisons: FetalSizeComparisonWithTranslations[];
  translatedCurrent: FetalSizeComparisonWithTranslations | null;
  loading: boolean;
  error: string | null;
  availableLanguages: string[];
  currentLanguage: string;
}

const initialState: FetalSizeState = {
  allComparisons: [],
  currentComparison: null,
  translatedComparisons: [],
  translatedCurrent: null,
  loading: false,
  error: null,
  availableLanguages: ["en"],
  currentLanguage: "en",
};

export const fetchAllFetalSizes = createAsyncThunk(
  "fetalSize/fetchAll",
  async () => {
    const data = await fetalSizeService.getAll();
    console.log(
      "Redux: fetchAllFetalSizes received data:",
      data.length,
      "items"
    );
    if (data.length > 0) {
      console.log("Redux: First item sample:", data[0]);
    }
    return data;
  }
);

export const fetchFetalSizeByWeek = createAsyncThunk(
  "fetalSize/fetchByWeek",
  async (week: number) => {
    const data = await fetalSizeService.getByWeek(week);
    console.log(`Redux: fetchFetalSizeByWeek for week ${week} received:`, data);
    return data;
  }
);

export const fetchAllFetalSizesWithTranslations = createAsyncThunk(
  "fetalSize/fetchAllWithTranslations",
  async (languages: string[]) => {
    const data = await fetalSizeService.getAllWithTranslations(languages);
    console.log(
      `Redux: fetchAllFetalSizesWithTranslations for languages [${languages.join(
        ", "
      )}] received:`,
      data.length,
      "items"
    );
    return data;
  }
);

export const fetchFetalSizeByWeekWithTranslations = createAsyncThunk(
  "fetalSize/fetchByWeekWithTranslations",
  async ({ week, languages }: { week: number; languages: string[] }) => {
    const data = await fetalSizeService.getByWeekWithTranslations(
      week,
      languages
    );
    console.log(
      `Redux: fetchFetalSizeByWeekWithTranslations for week ${week} and languages [${languages.join(
        ", "
      )}] received:`,
      data
    );
    return data;
  }
);

const fetalSizeSlice = createSlice({
  name: "fetalSize",
  initialState,
  reducers: {
    clearFetalSizeData: (state) => {
      state.allComparisons = [];
      state.currentComparison = null;
      state.translatedComparisons = [];
      state.translatedCurrent = null;
    },
    setCurrentLanguage: (state, action: PayloadAction<string>) => {
      state.currentLanguage = action.payload;
    },
    setAvailableLanguages: (state, action: PayloadAction<string[]>) => {
      state.availableLanguages = action.payload;
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
      })
      .addCase(fetchAllFetalSizesWithTranslations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllFetalSizesWithTranslations.fulfilled,
        (
          state,
          action: PayloadAction<FetalSizeComparisonWithTranslations[]>
        ) => {
          state.loading = false;
          state.translatedComparisons = action.payload;

          // Update available languages based on first week data
          if (action.payload.length > 0) {
            state.availableLanguages = action.payload[0].availableLanguages;
          }
        }
      )
      .addCase(fetchAllFetalSizesWithTranslations.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch translated fetal size data";
      })
      .addCase(fetchFetalSizeByWeekWithTranslations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchFetalSizeByWeekWithTranslations.fulfilled,
        (
          state,
          action: PayloadAction<FetalSizeComparisonWithTranslations | null>
        ) => {
          state.loading = false;
          state.translatedCurrent = action.payload;

          // Update available languages based on this week's data
          if (action.payload) {
            state.availableLanguages = action.payload.availableLanguages;
          }
        }
      )
      .addCase(
        fetchFetalSizeByWeekWithTranslations.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.error.message ||
            "Failed to fetch translated fetal size data";
        }
      );
  },
});

export const { clearFetalSizeData, setCurrentLanguage, setAvailableLanguages } =
  fetalSizeSlice.actions;
export default fetalSizeSlice.reducer;
