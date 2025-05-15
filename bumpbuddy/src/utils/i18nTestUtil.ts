/**
 * i18n Test Utility
 * Helper functions for testing internationalization implementation
 */

import i18next from "i18next";
import { supportedLanguages } from "../i18n/languages";
import { TranslationKey } from "../i18n/types/translations";

/**
 * Check if translation key exists in all supported languages
 * @param key Translation key to check
 * @returns Object containing results for each language
 */
export const validateTranslationKey = (
  key: TranslationKey
): {
  isValid: boolean;
  results: { [lang: string]: boolean };
} => {
  const results: { [lang: string]: boolean } = {};
  let isValid = true;

  Object.keys(supportedLanguages).forEach((lang) => {
    // Temporarily change language to check if key exists
    const originalLanguage = i18next.language;
    i18next.changeLanguage(lang);

    // Check if translation exists and is not the key itself
    const translation = i18next.t(key, { defaultValue: null });
    const exists = translation !== null && translation !== key;

    // Record result
    results[lang] = exists;
    if (!exists) {
      isValid = false;
      console.warn(
        `Missing translation for key '${key}' in language '${lang}'`
      );
    }

    // Restore original language
    i18next.changeLanguage(originalLanguage);
  });

  return { isValid, results };
};

/**
 * Check for missing translations in a set of keys
 * @param keys Array of translation keys to validate
 * @returns Object with validation results
 */
export const validateTranslationKeys = (
  keys: TranslationKey[]
): {
  allValid: boolean;
  results: {
    [key: string]: { isValid: boolean; languages: { [lang: string]: boolean } };
  };
} => {
  const results: {
    [key: string]: { isValid: boolean; languages: { [lang: string]: boolean } };
  } = {};
  let allValid = true;

  keys.forEach((key) => {
    const validation = validateTranslationKey(key);
    results[key] = {
      isValid: validation.isValid,
      languages: validation.results,
    };

    if (!validation.isValid) {
      allValid = false;
    }
  });

  return { allValid, results };
};

/**
 * Compare two languages to find missing translation keys
 * @param sourceLanguage Source language code (e.g., 'en')
 * @param targetLanguage Target language code (e.g., 'fr')
 * @returns Array of keys missing in the target language
 */
export const findMissingTranslations = (
  sourceLanguage: string,
  targetLanguage: string
): string[] => {
  const originalLanguage = i18next.language;

  // Set to source language to get all keys
  i18next.changeLanguage(sourceLanguage);

  // Get all resources for source language
  const sourceResources = i18next.getResourceBundle(
    sourceLanguage,
    "translation"
  );

  // Switch to target language
  i18next.changeLanguage(targetLanguage);

  // Check each key from source language
  const missingKeys: string[] = [];

  const checkNestedKeys = (obj: any, prefix = "") => {
    Object.keys(obj).forEach((key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof obj[key] === "object" && obj[key] !== null) {
        // Recursively check nested objects
        checkNestedKeys(obj[key], fullKey);
      } else {
        // Check if key exists in target language
        const translation = i18next.t(fullKey, { defaultValue: null });
        if (translation === null || translation === fullKey) {
          missingKeys.push(fullKey);
        }
      }
    });
  };

  checkNestedKeys(sourceResources);

  // Restore original language
  i18next.changeLanguage(originalLanguage);

  return missingKeys;
};

export default {
  validateTranslationKey,
  validateTranslationKeys,
  findMissingTranslations,
};
