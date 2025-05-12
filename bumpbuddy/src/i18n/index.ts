/**
 * i18n configuration
 * Sets up internationalization with device language detection and locale support
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "react-native-localize";

// Import translations
import { defaultLanguage, en, es, fr, supportedLanguages } from "./languages";

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = "bumpbuddy_language";

// Define custom detector type
const languageDetector = {
  type: "languageDetector" as any,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Try to get language from storage first
      const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (storedLanguage) {
        return callback(storedLanguage);
      }

      // If no stored language, get device language
      const locales = getLocales();
      if (locales.length > 0) {
        const deviceLanguage = locales[0].languageCode;
        // Check if device language is supported, otherwise use default
        const language = Object.keys(supportedLanguages).includes(
          deviceLanguage
        )
          ? deviceLanguage
          : defaultLanguage;
        return callback(language);
      }

      // Fallback to Expo's localization if RN Localize fails
      const locale = Localization.locale;
      const language = locale.split("-")[0];
      return callback(
        Object.keys(supportedLanguages).includes(language)
          ? language
          : defaultLanguage
      );
    } catch (error) {
      console.error("Error detecting language:", error);
      callback(defaultLanguage);
    }
  },
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.error("Error caching language:", error);
    }
  },
};

// Resources object with all translations
const resources = {
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
  fr: {
    translation: fr,
  },
};

// Get dev mode from environment
const isDev = process.env.NODE_ENV === "development";

// Initialize i18next
i18next
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: defaultLanguage,
    compatibilityJSON: "v3" as const, // Required for Android
    debug: isDev,

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      useSuspense: false, // Prevents issues with React Native
    },
  });

export default i18next;
