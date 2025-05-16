import AsyncStorage from "@react-native-async-storage/async-storage";
import { PregnancyWeek, TimelineService } from "timeline-types";
import supabase from "../config/supabaseConfig";

// Keys for AsyncStorage
const TIMELINE_DATA_KEY = "timeline_data";
const TIMELINE_LAST_UPDATED_KEY = "timeline_last_updated";

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

const timelineService: TimelineService = {
  // Get pregnancy week information by week number
  getWeekInfo: async (weekNumber: number): Promise<PregnancyWeek | null> => {
    try {
      // Try to get from cache first
      const cachedData = await AsyncStorage.getItem(TIMELINE_DATA_KEY);
      if (cachedData) {
        const pregnancyWeeks = JSON.parse(cachedData) as PregnancyWeek[];
        const weekInfo = pregnancyWeeks.find(
          (week) => week.week === weekNumber
        );

        if (weekInfo) {
          console.log(`Week ${weekNumber} found in cache`);
          return weekInfo;
        }
      }

      // If not in cache or not found, fetch from Supabase
      console.log(`Fetching week ${weekNumber} from Supabase`);
      const { data, error } = await supabase
        .from("pregnancy_weeks")
        .select("*")
        .eq("week", weekNumber)
        .single();

      if (error) {
        console.error("Error fetching week info:", error);
        return null;
      }

      console.log(`Week ${weekNumber} data from Supabase:`, data);
      return data;
    } catch (error) {
      console.error("Unexpected error fetching week info:", error);
      return null;
    }
  },

  // Get all pregnancy weeks
  getAllWeeks: async (): Promise<PregnancyWeek[]> => {
    try {
      // Check if we have cached data and it's still valid
      const lastUpdatedStr = await AsyncStorage.getItem(
        TIMELINE_LAST_UPDATED_KEY
      );
      const cachedData = await AsyncStorage.getItem(TIMELINE_DATA_KEY);

      if (lastUpdatedStr && cachedData) {
        const lastUpdated = parseInt(lastUpdatedStr, 10);
        const now = Date.now();

        console.log("Cache last updated:", new Date(lastUpdated).toISOString());
        console.log(
          "Cache age (hours):",
          (now - lastUpdated) / (1000 * 60 * 60)
        );

        // If cache is still valid, use it
        if (now - lastUpdated < CACHE_EXPIRATION) {
          const parsedData = JSON.parse(cachedData) as PregnancyWeek[];
          console.log(`Using cached data with ${parsedData.length} weeks`);
          return parsedData;
        } else {
          console.log("Cache expired, fetching fresh data");
        }
      } else {
        console.log("No cache found, fetching fresh data");
      }

      // Otherwise fetch from Supabase
      console.log("Fetching all weeks from Supabase");
      const { data, error } = await supabase
        .from("pregnancy_weeks")
        .select("*")
        .order("week");

      if (error) {
        console.error("Error fetching pregnancy weeks:", error);
        if (cachedData) {
          const parsedData = JSON.parse(cachedData) as PregnancyWeek[];
          console.log(
            `Falling back to cache with ${parsedData.length} weeks due to error`
          );
          return parsedData;
        }
        return [];
      }

      // Cache the fresh data
      if (data) {
        console.log(
          `Fetched ${data.length} weeks from Supabase, storing in cache`
        );
        await AsyncStorage.setItem(TIMELINE_DATA_KEY, JSON.stringify(data));
        await AsyncStorage.setItem(
          TIMELINE_LAST_UPDATED_KEY,
          Date.now().toString()
        );
      } else {
        console.log("No data returned from Supabase");
      }

      return data || [];
    } catch (error) {
      console.error("Unexpected error fetching pregnancy weeks:", error);
      const cachedData = await AsyncStorage.getItem(TIMELINE_DATA_KEY);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData) as PregnancyWeek[];
        console.log(`Using cache with ${parsedData.length} weeks due to error`);
        return parsedData;
      }
      return [];
    }
  },

  // Get trimester information
  getTrimesterWeeks: async (trimester: 1 | 2 | 3): Promise<PregnancyWeek[]> => {
    try {
      const allWeeks = await timelineService.getAllWeeks();
      console.log(
        `Filtering for trimester ${trimester} from ${allWeeks.length} weeks`
      );

      // Filter weeks by trimester
      if (trimester === 1) {
        const filtered = allWeeks.filter(
          (week: PregnancyWeek) => week.week >= 1 && week.week <= 13
        );
        console.log(`Found ${filtered.length} weeks in trimester 1`);
        return filtered;
      } else if (trimester === 2) {
        const filtered = allWeeks.filter(
          (week: PregnancyWeek) => week.week >= 14 && week.week <= 26
        );
        console.log(`Found ${filtered.length} weeks in trimester 2`);
        return filtered;
      } else {
        const filtered = allWeeks.filter(
          (week: PregnancyWeek) => week.week >= 27 && week.week <= 40
        );
        console.log(`Found ${filtered.length} weeks in trimester 3`);
        return filtered;
      }
    } catch (error) {
      console.error("Error fetching trimester weeks:", error);
      return [];
    }
  },

  // Calculate current week based on due date
  calculateCurrentWeek: (dueDate: string | null): number => {
    if (!dueDate) {
      return 0;
    }

    try {
      const due = new Date(dueDate);
      const today = new Date();

      // Invalid due date (in the past)
      if (due < today) {
        return 0;
      }

      // Calculate weeks difference
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // A full-term pregnancy is about 40 weeks
      const weeksLeft = Math.round(diffDays / 7);
      const currentWeek = 40 - weeksLeft;

      console.log(
        `Calculated current week: ${currentWeek} (due date: ${dueDate})`
      );

      // Return valid week range (1-40)
      return Math.max(1, Math.min(currentWeek, 40));
    } catch (error) {
      console.error("Error calculating current week:", error);
      return 0;
    }
  },

  // Get current week information based on user's due date
  getCurrentWeekInfo: async (
    dueDate: string | null
  ): Promise<PregnancyWeek | null> => {
    const currentWeek = timelineService.calculateCurrentWeek(dueDate);

    if (currentWeek > 0) {
      return await timelineService.getWeekInfo(currentWeek);
    }

    return null;
  },

  // Clear the cached timeline data
  clearCache: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(TIMELINE_DATA_KEY);
      await AsyncStorage.removeItem(TIMELINE_LAST_UPDATED_KEY);
      console.log("Timeline cache cleared successfully");
    } catch (error) {
      console.error("Error clearing timeline cache:", error);
    }
  },
};

export default timelineService;
