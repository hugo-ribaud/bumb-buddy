import AsyncStorage from "@react-native-async-storage/async-storage";
import supabase from "../config/supabaseConfig";
import { FetalSizeComparison } from "../types/fetalSize";

const CACHE_KEY = "fetal_size_data";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const fetalSizeService = {
  async getAll(): Promise<FetalSizeComparison[]> {
    // Check cache first
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          return data as FetalSizeComparison[];
        }
      }
    } catch (error) {
      console.error("Error reading from cache:", error);
    }

    // Fetch fresh data
    const { data, error } = await supabase
      .from("fetal_size_comparisons")
      .select("*")
      .order("week");

    if (error) {
      throw new Error(`Error fetching fetal size data: ${error.message}`);
    }

    if (data) {
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
    }

    return [];
  },

  async getByWeek(week: number): Promise<FetalSizeComparison | null> {
    // Try to get from cache first
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          const weekData = data.find(
            (item: FetalSizeComparison) => item.week === week
          );
          if (weekData) return weekData;
        }
      }
    } catch (error) {
      console.error("Error reading from cache:", error);
    }

    // Fetch fresh data
    const { data, error } = await supabase
      .from("fetal_size_comparisons")
      .select("*")
      .eq("week", week)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // No data for this week
      }
      throw new Error(
        `Error fetching fetal size data for week ${week}: ${error.message}`
      );
    }

    return data as FetalSizeComparison;
  },

  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  },
};
