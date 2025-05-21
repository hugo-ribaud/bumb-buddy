import AsyncStorage from "@react-native-async-storage/async-storage";
import supabase from "../config/supabaseConfig";
import { FetalSizeComparison } from "../types/fetalSize";

const CACHE_KEY = "fetal_size_data";
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

  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      console.log("Fetal size cache cleared");
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  },
};
