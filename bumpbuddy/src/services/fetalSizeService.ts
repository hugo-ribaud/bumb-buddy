import {
  FetalSizeComparison,
  FetalSizeComparisonWithTranslations,
  FetalSizeTranslation,
  FetalSizeTranslationsCacheData,
} from "../types/fetalSize";

import AsyncStorage from "@react-native-async-storage/async-storage";
import supabase from "../config/supabaseConfig";

const CACHE_KEY = "fetal_size_data";
const TRANSLATIONS_CACHE_KEY = "fetal_size_translations";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Force clear cache on load during development
(async () => {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
    console.log(
      "DEBUG: Fetal size cache cleared on load to get fresh data with size_cm"
    );
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
})();

export const fetalSizeService = {
  async getAll(): Promise<FetalSizeComparison[]> {
    // Check cache first
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          console.log("Using cached fetal size data:", data.length, "items");
          return data as FetalSizeComparison[];
        }
      }
    } catch (error) {
      console.error("Error reading from cache:", error);
    }

    // Fetch fresh data
    console.log("Fetching fetal size data from Supabase");
    try {
      const { data, error } = await supabase
        .from("fetal_size_comparisons")
        .select("*")
        .order("week");

      if (error) {
        console.error("Supabase error fetching fetal size data:", error);
        throw new Error(`Error fetching fetal size data: ${error.message}`);
      }

      if (data && data.length > 0) {
        console.log(
          "Received",
          data.length,
          "fetal size records from Supabase"
        );
        // Cache the data
        try {
          await AsyncStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              data,
              timestamp: Date.now(),
            })
          );
        } catch (error) {
          console.error("Error writing to cache:", error);
        }
        return data as FetalSizeComparison[];
      } else {
        console.warn("No fetal size data found in database");
        return [];
      }
    } catch (supabaseError) {
      console.error("Error in Supabase query:", supabaseError);
      return [];
    }
  },

  async getByWeek(week: number): Promise<FetalSizeComparison | null> {
    console.log(`Fetching fetal size data for week ${week}`);
    // Try to get from cache first
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          const weekData = data.find(
            (item: FetalSizeComparison) => item.week === week
          );
          if (weekData) {
            console.log(
              `Found week ${week} data in cache with name '${weekData.name}'`,
              weekData
            );
            return weekData;
          }
          console.log(`Week ${week} not found in cache`);
        }
      }
    } catch (error) {
      console.error("Error reading from cache:", error);
    }

    // Fetch fresh data
    try {
      const { data, error } = await supabase
        .from("fetal_size_comparisons")
        .select("*")
        .eq("week", week)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          console.log(`No data found for week ${week}`);
          return null; // No data for this week
        }
        console.error(`Error fetching data for week ${week}:`, error);
        throw new Error(
          `Error fetching fetal size data for week ${week}: ${error.message}`
        );
      }

      if (data) {
        console.log(
          `Fetched data for week ${week} from Supabase with name '${data.name}':`,
          data
        );
        return data as FetalSizeComparison;
      }

      return null;
    } catch (supabaseError) {
      console.error("Error in Supabase query:", supabaseError);
      return null;
    }
  },

  async getTranslations(
    languages: string[] = ["en"]
  ): Promise<Record<string, FetalSizeTranslation[]>> {
    // Check translations cache first
    try {
      const cachedData = await AsyncStorage.getItem(TRANSLATIONS_CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(
          cachedData
        ) as FetalSizeTranslationsCacheData;
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          // Check if we have all requested languages
          const hasAllLanguages = languages.every((lang) =>
            Object.keys(data).includes(lang)
          );
          if (hasAllLanguages) {
            console.log(
              `Using cached fetal size translations for languages: ${languages.join(
                ", "
              )}`
            );
            return data;
          }
        }
      }
    } catch (error) {
      console.error("Error reading translations from cache:", error);
    }

    // Fetch translations
    console.log(
      `Fetching fetal size translations for languages: ${languages.join(", ")}`
    );
    try {
      const { data, error } = await supabase
        .from("fetal_size_translations")
        .select("*")
        .in("language", languages);

      if (error) {
        console.error("Error fetching fetal size translations:", error);
        throw new Error(
          `Error fetching fetal size translations: ${error.message}`
        );
      }

      // Organize translations by language
      const translationsByLanguage: Record<string, FetalSizeTranslation[]> = {};

      languages.forEach((lang) => {
        translationsByLanguage[lang] = [];
      });

      if (data && data.length > 0) {
        data.forEach((item: FetalSizeTranslation) => {
          if (!translationsByLanguage[item.language]) {
            translationsByLanguage[item.language] = [];
          }
          translationsByLanguage[item.language].push(item);
        });

        // Cache the data
        try {
          await AsyncStorage.setItem(
            TRANSLATIONS_CACHE_KEY,
            JSON.stringify({
              data: translationsByLanguage,
              timestamp: Date.now(),
            })
          );
        } catch (error) {
          console.error("Error writing translations to cache:", error);
        }
      }

      return translationsByLanguage;
    } catch (error) {
      console.error("Error in fetching translations:", error);
      return languages.reduce((acc, lang) => {
        acc[lang] = [];
        return acc;
      }, {} as Record<string, FetalSizeTranslation[]>);
    }
  },

  async getByWeekWithTranslations(
    week: number,
    languages: string[] = ["en"]
  ): Promise<FetalSizeComparisonWithTranslations | null> {
    // Get base data
    const baseData = await this.getByWeek(week);
    if (!baseData) return null;

    // Get translations
    const translations = await this.getTranslations(languages);

    // Find the translations for this week
    const weekTranslations = languages.reduce((acc, lang) => {
      const foundTranslation = translations[lang]?.find((t) => t.week === week);
      if (foundTranslation) {
        acc[lang] = foundTranslation.translations;
      }
      return acc;
    }, {} as Record<string, FetalSizeTranslation["translations"]>);

    // Return combined data
    return {
      ...baseData,
      availableLanguages: Object.keys(weekTranslations),
      translatedContent: weekTranslations,
    };
  },

  async getAllWithTranslations(
    languages: string[] = ["en"]
  ): Promise<FetalSizeComparisonWithTranslations[]> {
    // Get all base data
    const allData = await this.getAll();

    // Get translations for all requested languages
    const translations = await this.getTranslations(languages);

    // Combine data with translations
    return allData.map((item) => {
      const weekTranslations = languages.reduce((acc, lang) => {
        const foundTranslation = translations[lang]?.find(
          (t) => t.week === item.week
        );
        if (foundTranslation) {
          acc[lang] = foundTranslation.translations;
        }
        return acc;
      }, {} as Record<string, FetalSizeTranslation["translations"]>);

      return {
        ...item,
        availableLanguages: Object.keys(weekTranslations),
        translatedContent: weekTranslations,
      };
    });
  },

  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      await AsyncStorage.removeItem(TRANSLATIONS_CACHE_KEY);
      console.log("Fetal size cache cleared");
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  },
};
