import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase from '../config/supabaseConfig';
import { FetalSizeComparison } from '../types/fetalSize';

const CACHE_KEY = 'fetal_size_data';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const fetalSizeService = {
  async getAll(language: string = 'en'): Promise<FetalSizeComparison[]> {
    // Try to get from cache first (cache by language)
    const cacheKey = `${CACHE_KEY}_${language}`;
    try {
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          return data as FetalSizeComparison[];
        }
      }
    } catch (error) {
      console.error('Error reading from cache:', error);
    }

    try {
      // First, get all base fetal size data
      const { data: allFetalData, error: fetalError } = await supabase
        .from('fetal_size_comparisons')
        .select('*')
        .order('week');

      if (fetalError || !allFetalData) {
        console.error('Error fetching fetal size data:', fetalError);
        throw new Error(
          `Error fetching fetal size data: ${fetalError?.message}`
        );
      }

      // If requesting English, return the base data
      if (language === 'en') {
        // Cache the data
        try {
          await AsyncStorage.setItem(
            cacheKey,
            JSON.stringify({
              data: allFetalData,
              timestamp: Date.now(),
            })
          );
        } catch (error) {
          console.error('Error writing to cache:', error);
        }
        return allFetalData as FetalSizeComparison[];
      }

      // Get all available translations for the requested language
      const { data: translationsData, error: translationsError } =
        await supabase
          .from('fetal_size_translations')
          .select('week, translations')
          .eq('language', language);

      if (translationsError) {
        // Cache the English data
        try {
          await AsyncStorage.setItem(
            cacheKey,
            JSON.stringify({
              data: allFetalData,
              timestamp: Date.now(),
            })
          );
        } catch (error) {
          console.error('Error writing to cache:', error);
        }
        return allFetalData as FetalSizeComparison[];
      }

      // Create a map of translations for quick lookup
      const translationsMap = new Map();
      if (translationsData) {
        translationsData.forEach(translation => {
          translationsMap.set(translation.week, translation.translations);
        });
      }

      // Transform data to use translated content where available
      const transformedData = allFetalData.map(item => {
        const translation = translationsMap.get(item.week);

        if (!translation) {
          // No translation available, use English content
          return item;
        }

        // Merge translation with base data (preserve image_url!)
        return {
          ...item,
          name: translation.name || item.name,
          description: translation.description || item.description,
          // image_url is NOT translated - keep original
        };
      });

      // Cache the transformed data
      try {
        await AsyncStorage.setItem(
          cacheKey,
          JSON.stringify({
            data: transformedData,
            timestamp: Date.now(),
          })
        );
      } catch (error) {
        console.error('Error writing to cache:', error);
      }

      return transformedData as FetalSizeComparison[];
    } catch (supabaseError) {
      console.error('Error in Supabase query:', supabaseError);
      // Fallback to English if translation fails
      if (language !== 'en') {
        return fetalSizeService.getAll('en');
      }
      return [];
    }
  },

  async getByWeek(
    week: number,
    language: string = 'en'
  ): Promise<FetalSizeComparison | null> {
    // Try to get from cache first (cache by language)
    const cacheKey = `${CACHE_KEY}_${language}`;
    try {
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          const weekData = data.find(
            (item: FetalSizeComparison) => item.week === week
          );
          if (weekData) {
            return weekData;
          }
        }
      }
    } catch (error) {
      console.error('Error reading from cache:', error);
    }

    try {
      // First, get the base fetal size data for this week
      const { data: fetalData, error: fetalError } = await supabase
        .from('fetal_size_comparisons')
        .select('*')
        .eq('week', week)
        .single();

      if (fetalError || !fetalData) {
        console.error(
          `Error fetching fetal size for week ${week}:`,
          fetalError
        );
        return null;
      }

      // If requesting English, return the base data
      if (language === 'en') {
        return fetalData as FetalSizeComparison;
      }

      // Try to get translation for the requested language
      const { data: translationData, error: translationError } = await supabase
        .from('fetal_size_translations')
        .select('translations')
        .eq('week', week)
        .eq('language', language)
        .single();

      if (translationError || !translationData) {
        return fetalData as FetalSizeComparison;
      }

      // Merge translation with base data (preserve image_url!)
      const transformedData = {
        ...fetalData,
        name: translationData.translations?.name || fetalData.name,
        description:
          translationData.translations?.description || fetalData.description,
        // image_url is NOT translated - keep original
      };

      return transformedData as FetalSizeComparison;
    } catch (supabaseError) {
      console.error('Error in Supabase query:', supabaseError);
      return null;
    }
  },

  async clearCache(): Promise<void> {
    try {
      // Clear cache for all languages
      const languages = ['en', 'es', 'fr'];
      for (const lang of languages) {
        await AsyncStorage.removeItem(`${CACHE_KEY}_${lang}`);
      }
      // Also clear the old cache key for backward compatibility
      await AsyncStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },
};
