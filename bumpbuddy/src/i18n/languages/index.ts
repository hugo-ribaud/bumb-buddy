/**
 * Exports all translation files and provides utility functions
 */

// Import all translation files
import en from './en.json';
import es from './es.json';
import fr from './fr.json';

// Export the translations
export { en, es, fr };

// List of supported languages with their native names
export const supportedLanguages = {
  en: {
    name: 'English',
    nativeName: 'English',
    isRTL: false,
    flag: '🇬🇧',
  },
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    isRTL: false,
    flag: '🇪🇸',
  },
  fr: {
    name: 'French',
    nativeName: 'Français',
    isRTL: false,
    flag: '🇫🇷',
  },
};

// RTL languages (for future support)
export const rtlLanguages = ['ar', 'he', 'fa', 'ur'];

// Check if a language is RTL
export const isRTL = (language: string): boolean => {
  return rtlLanguages.includes(language);
};

// Get native language name
export const getLanguageName = (language: string): string => {
  return (
    supportedLanguages[language as keyof typeof supportedLanguages]
      ?.nativeName || language
  );
};

// Get language flag
export const getLanguageFlag = (language: string): string => {
  return (
    supportedLanguages[language as keyof typeof supportedLanguages]?.flag ||
    '🌐'
  );
};

// Default language fallback
export const defaultLanguage = 'en';

// Get language display info
export const getLanguageInfo = (code: string) => {
  if (code in supportedLanguages) {
    return supportedLanguages[code as keyof typeof supportedLanguages];
  }
  return {
    name: code,
    nativeName: code,
    isRTL: isRTL(code),
    flag: '🌐',
  };
};
