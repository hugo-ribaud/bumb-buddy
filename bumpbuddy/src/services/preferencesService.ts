import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LanguageCode,
  ThemeMode,
  UnitSystem,
} from "../redux/slices/preferencesSlice";
import authService from "./authService";

// Define storage keys
const STORAGE_KEYS = {
  THEME: "bumpbuddy_theme",
  LANGUAGE: "bumpbuddy_language",
  UNITS: "bumpbuddy_units",
  LAST_SYNCED: "bumpbuddy_preferences_last_synced",
};

// Define interfaces
interface SyncPreferencesParams {
  userId: string;
  theme?: ThemeMode;
  language?: LanguageCode;
  units?: UnitSystem;
}

interface LoadPreferencesResult {
  theme?: ThemeMode;
  language?: LanguageCode;
  units?: UnitSystem;
  lastSynced?: string;
  source: "local" | "remote" | "default";
  error?: string;
}

// Preferences service
const preferencesService = {
  // Load preferences from local storage
  loadLocalPreferences: async (): Promise<LoadPreferencesResult> => {
    try {
      // Get all preferences from AsyncStorage
      const [theme, language, units, lastSynced] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.THEME),
        AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
        AsyncStorage.getItem(STORAGE_KEYS.UNITS),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNCED),
      ]);

      // Only include valid values
      const preferences: LoadPreferencesResult = {
        source: "local",
      };

      if (theme && ["light", "dark", "system"].includes(theme)) {
        preferences.theme = theme as ThemeMode;
      }

      if (language) {
        preferences.language = language as LanguageCode;
      }

      if (units && ["metric", "imperial"].includes(units)) {
        preferences.units = units as UnitSystem;
      }

      if (lastSynced) {
        preferences.lastSynced = lastSynced;
      }

      return preferences;
    } catch (error: any) {
      console.error("Failed to load preferences from local storage:", error);
      return { source: "local", error: error.message };
    }
  },

  // Save preferences to local storage
  saveLocalPreferences: async ({
    theme,
    language,
    units,
  }: {
    theme?: ThemeMode;
    language?: LanguageCode;
    units?: UnitSystem;
  }) => {
    try {
      const promises = [];

      // Only save items that are provided
      if (theme !== undefined) {
        promises.push(AsyncStorage.setItem(STORAGE_KEYS.THEME, theme));
      }

      if (language !== undefined) {
        promises.push(AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language));
      }

      if (units !== undefined) {
        promises.push(AsyncStorage.setItem(STORAGE_KEYS.UNITS, units));
      }

      // Update last synced time
      const now = new Date().toISOString();
      promises.push(AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNCED, now));

      await Promise.all(promises);
      return { error: null, lastSynced: now };
    } catch (error: any) {
      console.error("Failed to save preferences to local storage:", error);
      return { error: error.message };
    }
  },

  // Load preferences from Supabase
  loadRemotePreferences: async (
    userId: string
  ): Promise<LoadPreferencesResult> => {
    try {
      const { data, error } = await authService.getProfile(userId);

      if (error) {
        throw new Error(error);
      }

      if (!data || !data.app_settings) {
        return { source: "remote" };
      }

      const appSettings = data.app_settings;
      const preferences: LoadPreferencesResult = {
        source: "remote",
      };

      // Extract preferences from app_settings
      if (
        appSettings.theme &&
        ["light", "dark", "system"].includes(appSettings.theme)
      ) {
        preferences.theme = appSettings.theme as ThemeMode;
      }

      if (appSettings.language) {
        preferences.language = appSettings.language as LanguageCode;
      }

      if (
        appSettings.units &&
        ["metric", "imperial"].includes(appSettings.units)
      ) {
        preferences.units = appSettings.units as UnitSystem;
      }

      return preferences;
    } catch (error: any) {
      console.error("Failed to load preferences from Supabase:", error);
      return { source: "remote", error: error.message };
    }
  },

  // Sync preferences with Supabase
  syncPreferencesToServer: async ({
    userId,
    theme,
    language,
    units,
  }: SyncPreferencesParams) => {
    try {
      // Get current profile first
      const { data: userData, error: fetchError } =
        await authService.getProfile(userId);

      if (fetchError) {
        throw new Error(fetchError);
      }

      // Update settings, preserving other settings not being updated
      const currentSettings = userData?.app_settings || {};
      const updatedSettings = { ...currentSettings };

      if (theme !== undefined) {
        updatedSettings.theme = theme;
      }

      if (language !== undefined) {
        updatedSettings.language = language;
      }

      if (units !== undefined) {
        updatedSettings.units = units;
      }

      // Only update if there are changes
      if (JSON.stringify(currentSettings) !== JSON.stringify(updatedSettings)) {
        const { error } = await authService.updateProfile({
          id: userId,
          appSettings: updatedSettings,
        });

        if (error) {
          throw new Error(error);
        }
      }

      return { error: null };
    } catch (error: any) {
      console.error("Failed to sync preferences to Supabase:", error);
      return { error: error.message };
    }
  },

  // Get merged preferences (combining local and remote)
  getMergedPreferences: async (
    userId: string
  ): Promise<LoadPreferencesResult> => {
    // Load both local and remote preferences
    const [localPrefs, remotePrefs] = await Promise.all([
      preferencesService.loadLocalPreferences(),
      preferencesService.loadRemotePreferences(userId),
    ]);

    // Check if remote preferences are more recent and should override local
    const shouldUseRemote =
      remotePrefs.theme || remotePrefs.language || remotePrefs.units;

    // Merge, with remote taking precedence if available
    const merged: LoadPreferencesResult = {
      theme: shouldUseRemote ? remotePrefs.theme : localPrefs.theme,
      language: shouldUseRemote ? remotePrefs.language : localPrefs.language,
      units: shouldUseRemote ? remotePrefs.units : localPrefs.units,
      lastSynced: localPrefs.lastSynced,
      source: shouldUseRemote ? "remote" : "local",
    };

    // If we used remote preferences, update local storage
    if (shouldUseRemote) {
      await preferencesService.saveLocalPreferences({
        theme: remotePrefs.theme,
        language: remotePrefs.language,
        units: remotePrefs.units,
      });
    }
    // If we used local preferences, sync to remote
    else if (
      userId &&
      (localPrefs.theme || localPrefs.language || localPrefs.units)
    ) {
      await preferencesService.syncPreferencesToServer({
        userId,
        theme: localPrefs.theme,
        language: localPrefs.language,
        units: localPrefs.units,
      });
    }

    return merged;
  },
};

export default preferencesService;
