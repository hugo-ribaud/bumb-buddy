import {
  PregnancyWeek,
  PregnancyWeekTranslation,
  PregnancyWeekWithTranslations,
  TimelineCacheData,
  TranslationsCacheData,
  TrimesterType,
} from "../types/timeline";

import AsyncStorage from "@react-native-async-storage/async-storage";
import i18next from "i18next";
import supabase from "../config/supabaseConfig";

// Constants
const TIMELINE_DATA_KEY = "timeline_data";
const TIMELINE_LAST_UPDATED_KEY = "timeline_last_updated";
const TRANSLATIONS_CACHE_KEY = "timeline_translations";
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Service for managing pregnancy timeline data
 */
export const timelineService = {
  /**
   * Get information for a specific pregnancy week
   */
  async getWeekInfo(weekNumber: number): Promise<PregnancyWeek | null> {
    try {
      const weeks = await this.getAllWeeks();
      return weeks.find((week) => week.week === weekNumber) || null;
    } catch (error) {
      console.error("Error getting week info:", error);
      return null;
    }
  },

  /**
   * Get all pregnancy weeks
   */
  async getAllWeeks(): Promise<PregnancyWeek[]> {
    try {
      // Check cache first
      const cachedData = await this.getFromCache();
      if (cachedData) {
        return cachedData;
      }

      // If no cache or expired, fetch from Supabase
      const { data, error } = await supabase
        .from("pregnancy_weeks")
        .select("*")
        .order("week");

      if (error) {
        console.error("Error fetching pregnancy weeks:", error);
        return [];
      }

      // Save to cache
      await this.saveToCache(data as PregnancyWeek[]);

      return data as PregnancyWeek[];
    } catch (error) {
      console.error("Error getting all weeks:", error);
      return [];
    }
  },

  /**
   * Get weeks for a specific trimester
   */
  async getTrimesterWeeks(trimester: TrimesterType): Promise<PregnancyWeek[]> {
    try {
      const weeks = await this.getAllWeeks();

      // Filter weeks by trimester
      if (trimester === 1) {
        return weeks.filter((week) => week.week >= 1 && week.week <= 13);
      } else if (trimester === 2) {
        return weeks.filter((week) => week.week >= 14 && week.week <= 26);
      } else {
        return weeks.filter((week) => week.week >= 27 && week.week <= 40);
      }
    } catch (error) {
      console.error("Error getting trimester weeks:", error);
      return [];
    }
  },

  /**
   * Calculate current pregnancy week based on due date
   */
  calculateCurrentWeek(dueDate: string | null): number {
    if (!dueDate) return 0;

    try {
      const due = new Date(dueDate);
      const today = new Date();

      // Calculate the difference in days
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 280 days is the standard pregnancy length (40 weeks)
      const daysLeft = Math.max(0, diffDays);
      const currentWeek = Math.min(
        40,
        Math.max(1, Math.ceil((280 - daysLeft) / 7))
      );

      return currentWeek;
    } catch (error) {
      console.error("Error calculating current week:", error);
      return 0;
    }
  },

  /**
   * Get information for the current pregnancy week
   */
  async getCurrentWeekInfo(
    dueDate: string | null
  ): Promise<PregnancyWeek | null> {
    const currentWeek = this.calculateCurrentWeek(dueDate);
    if (currentWeek === 0) return null;

    return this.getWeekInfo(currentWeek);
  },

  /**
   * Clear all timeline caches
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        TIMELINE_DATA_KEY,
        TIMELINE_LAST_UPDATED_KEY,
        TRANSLATIONS_CACHE_KEY,
      ]);
      console.log("Timeline cache cleared successfully");
    } catch (error) {
      console.error("Error clearing timeline cache:", error);
    }
  },

  /**
   * Get translations for a specific week in the current language
   */
  async getWeekTranslation(
    weekNumber: number,
    language: string = i18next.language
  ): Promise<PregnancyWeekTranslation | null> {
    try {
      const translations = await this.getTranslationsForLanguage(language);
      return translations.find((t) => t.week === weekNumber) || null;
    } catch (error) {
      console.error("Error getting week translation:", error);
      return null;
    }
  },

  /**
   * Get a week with its translations merged in the preferred language
   */
  async getLocalizedWeek(
    weekNumber: number,
    language: string = i18next.language
  ): Promise<PregnancyWeek | null> {
    try {
      const baseWeek = await this.getWeekInfo(weekNumber);
      if (!baseWeek) return null;

      // If requesting English, return the base week (English is the default)
      if (language === "en") return baseWeek;

      const translation = await this.getWeekTranslation(weekNumber, language);
      if (!translation) return baseWeek;

      // Merge the translation with the base week
      return {
        ...baseWeek,
        ...translation.translations,
      };
    } catch (error) {
      console.error("Error getting localized week:", error);
      return null;
    }
  },

  /**
   * Get all translations for a specific language
   */
  async getTranslationsForLanguage(
    language: string = i18next.language
  ): Promise<PregnancyWeekTranslation[]> {
    try {
      // Try to get from cache first
      const allTranslations = await this.getAllTranslations();
      return allTranslations[language] || [];
    } catch (error) {
      console.error("Error getting translations for language:", error);
      return [];
    }
  },

  /**
   * Get all translations for all languages
   */
  async getAllTranslations(): Promise<
    Record<string, PregnancyWeekTranslation[]>
  > {
    try {
      // Check cache first
      const cachedData = await this.getTranslationsFromCache();
      if (cachedData) {
        return cachedData;
      }

      // If no cache or expired, fetch from Supabase
      const { data, error } = await supabase
        .from("pregnancy_week_translations")
        .select("*");

      if (error) {
        console.error("Error fetching translations:", error);
        return {};
      }

      // Group translations by language
      const groupedByLanguage: Record<string, PregnancyWeekTranslation[]> = {};
      (data as PregnancyWeekTranslation[]).forEach(
        (item: PregnancyWeekTranslation) => {
          if (!groupedByLanguage[item.language]) {
            groupedByLanguage[item.language] = [];
          }
          groupedByLanguage[item.language].push(item);
        }
      );

      // Save to cache
      await this.saveTranslationsToCache(groupedByLanguage);

      return groupedByLanguage;
    } catch (error) {
      console.error("Error getting all translations:", error);
      return {};
    }
  },

  /**
   * Get all weeks with their available translations
   */
  async getAllWeeksWithTranslations(): Promise<
    PregnancyWeekWithTranslations[]
  > {
    try {
      const weeks = await this.getAllWeeks();
      const allTranslations = await this.getAllTranslations();

      // Map through weeks and add translation info
      return weeks.map((week) => {
        const availableLanguages: string[] = ["en"];
        const translatedContent: Record<string, any> = { en: {} };

        // Check each language for translations of this week
        Object.entries(allTranslations).forEach(([lang, translations]) => {
          const weekTranslation = translations.find(
            (t) => t.week === week.week
          );
          if (weekTranslation) {
            availableLanguages.push(lang);
            translatedContent[lang] = weekTranslation.translations;
          }
        });

        return {
          ...week,
          availableLanguages,
          translatedContent,
        };
      });
    } catch (error) {
      console.error("Error getting weeks with translations:", error);
      return [];
    }
  },

  /**
   * Get translated content for the current pregnancy week
   */
  async getCurrentWeekTranslation(
    dueDate: string | null,
    language: string = i18next.language
  ): Promise<PregnancyWeekTranslation | null> {
    const currentWeek = this.calculateCurrentWeek(dueDate);
    if (currentWeek === 0) return null;

    return this.getWeekTranslation(currentWeek, language);
  },

  /**
   * Get timeline data from cache
   */
  async getFromCache(): Promise<PregnancyWeek[] | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(TIMELINE_DATA_KEY);
      if (!jsonValue) return null;

      const cachedData: TimelineCacheData = JSON.parse(jsonValue);
      const now = Date.now();

      // Check if cache is expired
      if (now - cachedData.timestamp > cachedData.expiration) {
        console.log("Timeline cache expired");
        return null;
      }

      return cachedData.data;
    } catch (error) {
      console.error("Error reading timeline cache:", error);
      return null;
    }
  },

  /**
   * Save timeline data to cache
   */
  async saveToCache(data: PregnancyWeek[]): Promise<void> {
    try {
      const cacheData: TimelineCacheData = {
        data,
        timestamp: Date.now(),
        expiration: CACHE_EXPIRATION,
      };

      await AsyncStorage.setItem(TIMELINE_DATA_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error saving timeline to cache:", error);
    }
  },

  /**
   * Get translations from cache
   */
  async getTranslationsFromCache(): Promise<Record<
    string,
    PregnancyWeekTranslation[]
  > | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(TRANSLATIONS_CACHE_KEY);
      if (!jsonValue) return null;

      const cachedData: TranslationsCacheData = JSON.parse(jsonValue);
      const now = Date.now();

      // Check if cache is expired
      if (now - cachedData.timestamp > cachedData.expiration) {
        console.log("Translations cache expired");
        return null;
      }

      return cachedData.data;
    } catch (error) {
      console.error("Error reading translations cache:", error);
      return null;
    }
  },

  /**
   * Save translations to cache
   */
  async saveTranslationsToCache(
    data: Record<string, PregnancyWeekTranslation[]>
  ): Promise<void> {
    try {
      const cacheData: TranslationsCacheData = {
        data,
        timestamp: Date.now(),
        expiration: CACHE_EXPIRATION,
      };

      await AsyncStorage.setItem(
        TRANSLATIONS_CACHE_KEY,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error("Error saving translations to cache:", error);
    }
  },
};

export default timelineService;
