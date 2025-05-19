import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark" | "system";
export type LanguageCode = "en" | "es" | "fr" | "de" | string;
export type UnitSystem = "metric" | "imperial";

interface PreferencesState {
  theme: ThemeMode;
  language: LanguageCode;
  units: UnitSystem;
  isLoading: boolean;
  error: string | null;
  lastSynced: string | null;
}

// Initial state with defaults
const initialState: PreferencesState = {
  theme: "system",
  language: "en",
  units: "metric",
  isLoading: false,
  error: null,
  lastSynced: null,
};

// Create the preferences slice
const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    // Start loading preferences
    preferencesRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    // Set preferences from various sources (local storage, Supabase, etc.)
    setPreferences: (
      state,
      action: PayloadAction<{
        theme?: ThemeMode;
        language?: LanguageCode;
        units?: UnitSystem;
      }>
    ) => {
      state.isLoading = false;

      if (action.payload.theme) {
        state.theme = action.payload.theme;
      }

      if (action.payload.language) {
        state.language = action.payload.language;
      }

      if (action.payload.units) {
        state.units = action.payload.units;
      }

      state.lastSynced = new Date().toISOString();
      state.error = null;
    },

    // Set specific theme
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
      // We don't update lastSynced here as this might just be a UI change
      // The sync process will handle updating lastSynced
    },

    // Set specific language
    setLanguage: (state, action: PayloadAction<LanguageCode>) => {
      state.language = action.payload;
    },

    // Set unit system
    setUnits: (state, action: PayloadAction<UnitSystem>) => {
      state.units = action.payload;
    },

    // Handle errors
    preferencesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Mark as synced
    markSynced: (state) => {
      state.lastSynced = new Date().toISOString();
    },

    // Reset to defaults
    resetPreferences: (state) => {
      state.theme = "system";
      state.language = "en";
      state.units = "metric";
      state.lastSynced = new Date().toISOString();
    },
  },
});

// Export actions and reducer
export const {
  preferencesRequest,
  setPreferences,
  setTheme,
  setLanguage,
  setUnits,
  preferencesFailure,
  markSynced,
  resetPreferences,
} = preferencesSlice.actions;

export default preferencesSlice.reducer;
