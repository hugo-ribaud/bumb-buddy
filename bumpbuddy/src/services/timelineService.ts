import { PregnancyWeek, TimelineService } from 'timeline-types';

import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase from '../config/supabaseConfig';
import { calculatePregnancyWeek } from '../utils/pregnancyCalculations';

// Keys for AsyncStorage (now include language)
const TIMELINE_DATA_KEY = 'timeline_data';
const TIMELINE_LAST_UPDATED_KEY = 'timeline_last_updated';

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

const timelineService: TimelineService = {
  // Get specific week information with translations
  getWeekInfo: async (
    weekNumber: number,
    language: string = 'en'
  ): Promise<PregnancyWeek | null> => {
    try {
      // First, get the base week data
      const { data: weekData, error: weekError } = await supabase
        .from('pregnancy_weeks')
        .select('*')
        .eq('week', weekNumber)
        .single();

      if (weekError || !weekData) {
        console.error(`Error fetching week ${weekNumber}:`, weekError);
        return null;
      }

      // If requesting English, return the base data
      if (language === 'en') {
        return weekData as PregnancyWeek;
      }

      // Try to get translation for the requested language
      const { data: translationData, error: translationError } = await supabase
        .from('pregnancy_week_translations')
        .select('translations')
        .eq('week', weekNumber)
        .eq('language', language)
        .single();

      if (translationError || !translationData) {
        return weekData as PregnancyWeek;
      }

      // Merge translation with base data
      const transformedData = {
        ...weekData,
        fetal_development:
          translationData.translations?.fetal_development ||
          weekData.fetal_development,
        maternal_changes:
          translationData.translations?.maternal_changes ||
          weekData.maternal_changes,
        tips: translationData.translations?.tips || weekData.tips,
        nutrition_advice:
          translationData.translations?.nutrition_advice ||
          weekData.nutrition_advice,
        common_symptoms:
          translationData.translations?.common_symptoms ||
          weekData.common_symptoms,
        medical_checkups:
          translationData.translations?.medical_checkups ||
          weekData.medical_checkups,
      };

      return transformedData as PregnancyWeek;
    } catch (error) {
      console.error('Unexpected error fetching week info:', error);
      return null;
    }
  },

  // Get all pregnancy weeks with translations
  getAllWeeks: async (language: string = 'en'): Promise<PregnancyWeek[]> => {
    try {
      // Check if we have cached data and it's still valid (cache by language)
      const cacheKey = `${TIMELINE_DATA_KEY}_${language}`;
      const lastUpdatedKey = `${TIMELINE_LAST_UPDATED_KEY}_${language}`;

      const lastUpdatedStr = await AsyncStorage.getItem(lastUpdatedKey);
      const cachedData = await AsyncStorage.getItem(cacheKey);

      if (lastUpdatedStr && cachedData) {
        const lastUpdated = parseInt(lastUpdatedStr, 10);
        const now = Date.now();

        // If cache is still valid, use it
        if (now - lastUpdated < CACHE_EXPIRATION) {
          const parsedData = JSON.parse(cachedData) as PregnancyWeek[];
          return parsedData;
        }
      }

      // Otherwise fetch from Supabase with translations
      // First, get all base week data
      const { data: allWeeksData, error: weeksError } = await supabase
        .from('pregnancy_weeks')
        .select('*')
        .order('week');

      if (weeksError || !allWeeksData) {
        console.error(`Error fetching pregnancy weeks:`, weeksError);
        // If we have cached data, use it as fallback
        if (cachedData) {
          const parsedData = JSON.parse(cachedData) as PregnancyWeek[];
          return parsedData;
        }
        return [];
      }

      // If requesting English, return the base data
      if (language === 'en') {
        await AsyncStorage.setItem(cacheKey, JSON.stringify(allWeeksData));
        await AsyncStorage.setItem(lastUpdatedKey, Date.now().toString());
        return allWeeksData as PregnancyWeek[];
      }

      // Get all available translations for the requested language
      const { data: translationsData, error: translationsError } =
        await supabase
          .from('pregnancy_week_translations')
          .select('week, translations')
          .eq('language', language);

      if (translationsError) {
        await AsyncStorage.setItem(cacheKey, JSON.stringify(allWeeksData));
        await AsyncStorage.setItem(lastUpdatedKey, Date.now().toString());
        return allWeeksData as PregnancyWeek[];
      }

      // Create a map of translations for quick lookup
      const translationsMap = new Map();
      if (translationsData) {
        translationsData.forEach(translation => {
          translationsMap.set(translation.week, translation.translations);
        });
      }

      // Transform data to use translated content where available
      const transformedData = allWeeksData.map(week => {
        const translation = translationsMap.get(week.week);

        if (!translation) {
          // No translation available, use English content
          return week;
        }

        // Merge translation with base data
        return {
          ...week,
          fetal_development:
            translation.fetal_development || week.fetal_development,
          maternal_changes:
            translation.maternal_changes || week.maternal_changes,
          tips: translation.tips || week.tips,
          nutrition_advice:
            translation.nutrition_advice || week.nutrition_advice,
          common_symptoms: translation.common_symptoms || week.common_symptoms,
          medical_checkups:
            translation.medical_checkups || week.medical_checkups,
        };
      });

      await AsyncStorage.setItem(cacheKey, JSON.stringify(transformedData));
      await AsyncStorage.setItem(lastUpdatedKey, Date.now().toString());

      return transformedData as PregnancyWeek[];
    } catch (error) {
      console.error(
        `Unexpected error fetching pregnancy weeks for ${language}:`,
        error
      );
      // Fallback to English if translation fails
      if (language !== 'en') {
        return timelineService.getAllWeeks('en');
      }
      // Use cached data as last resort
      const cacheKey = `${TIMELINE_DATA_KEY}_${language}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData) as PregnancyWeek[];
        return parsedData;
      }
      return [];
    }
  },

  // Get trimester information with translations
  getTrimesterWeeks: async (
    trimester: 1 | 2 | 3,
    language: string = 'en'
  ): Promise<PregnancyWeek[]> => {
    try {
      const allWeeks = await timelineService.getAllWeeks(language);

      // Filter weeks by trimester
      if (trimester === 1) {
        return allWeeks.filter(
          (week: PregnancyWeek) => week.week >= 1 && week.week <= 13
        );
      } else if (trimester === 2) {
        return allWeeks.filter(
          (week: PregnancyWeek) => week.week >= 14 && week.week <= 26
        );
      } else {
        return allWeeks.filter(
          (week: PregnancyWeek) => week.week >= 27 && week.week <= 40
        );
      }
    } catch (error) {
      console.error('Error fetching trimester weeks:', error);
      return [];
    }
  },

  // Calculate current week based on due date (no translation needed)
  calculateCurrentWeek: (dueDate: string | null): number => {
    return calculatePregnancyWeek(dueDate);
  },

  // Get current week information based on user's due date with translations
  getCurrentWeekInfo: async (
    dueDate: string | null,
    language: string = 'en'
  ): Promise<PregnancyWeek | null> => {
    const currentWeek = timelineService.calculateCurrentWeek(dueDate);
    if (currentWeek === 0) {
      return null;
    }
    return timelineService.getWeekInfo(currentWeek, language);
  },

  // Clear the cached timeline data
  clearCache: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(TIMELINE_DATA_KEY);
      await AsyncStorage.removeItem(TIMELINE_LAST_UPDATED_KEY);
    } catch (error) {
      console.error('Error clearing timeline cache:', error);
    }
  },
};

export default timelineService;
