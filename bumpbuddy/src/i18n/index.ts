/**
 * i18n configuration
 * Sets up internationalization with device language detection and locale support
 */

import * as Localization from 'expo-localization';

import { defaultLanguage, en, es, fr, supportedLanguages } from './languages';

import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = 'bumpbuddy_language';

// Try to import react-native-localize, fallback to expo-localization if it fails
let reactNativeLocalize: {
  getLocales: () => Array<{ languageCode: string }>;
} | null = null;
try {
  reactNativeLocalize = require('react-native-localize');
} catch (error) {
  console.warn(
    'react-native-localize not available, falling back to expo-localization'
  );
  reactNativeLocalize = null;
}

// Define custom detector type
const languageDetector = {
  type: 'languageDetector' as any,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Try to get language from storage first
      const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (storedLanguage) {
        return callback(storedLanguage);
      }

      // If react-native-localize is available, use it
      if (reactNativeLocalize) {
        try {
          const locales = reactNativeLocalize.getLocales();
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
        } catch (error) {
          console.warn('Error using react-native-localize:', error);
        }
      }

      // Fallback to Expo's localization
      const locale = Localization.locale;
      const language = locale.split('-')[0];
      return callback(
        Object.keys(supportedLanguages).includes(language)
          ? language
          : defaultLanguage
      );
    } catch (error) {
      console.error('Error detecting language:', error);
      callback(defaultLanguage);
    }
  },
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.error('Error caching language:', error);
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

// Initialize i18next with properly typed options
const i18nOptions = {
  resources,
  fallbackLng: defaultLanguage,
  debug: false,
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  react: {
    useSuspense: false, // Prevents issues with React Native
  },
};

// Initialize i18next
i18next.use(languageDetector).use(initReactI18next).init(i18nOptions);

export default i18next;
