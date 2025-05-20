import AsyncStorage from "@react-native-async-storage/async-storage";
import supabase from "../config/supabaseConfig";
import { FetalSizeComparison } from "../types/fetalSize";

const FETAL_SIZE_CACHE_KEY = "fetalsize_data";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Service for handling fetal size comparison data
 * Provides methods for fetching, caching, and retrieving size comparison information
 */
export const fetalSizeService = {
  /**
   * Fetches all size comparisons from the database or cache
   */
  async getAllSizeComparisons(): Promise<FetalSizeComparison[]> {
    try {
      // Check cache first
      const cachedData = await this.getCachedData();
      if (cachedData) {
        return cachedData;
      }

      // Fetch from database
      const { data, error } = await supabase
        .from("fetal_size_comparisons")
        .select("*")
        .order("week");

      if (error) {
        throw new Error(`Error fetching fetal size data: ${error.message}`);
      }

      // Transform to match interface
      const sizeData: FetalSizeComparison[] = data.map((item: any) => ({
        week: item.week,
        fruitName: item.fruit_name,
        sizeCm: item.size_cm,
        sizeInches: item.size_inches,
        weightG: item.weight_g,
        weightOz: item.weight_oz,
        imageUrl: item.image_url,
        description: item.description,
      }));

      // Cache the data
      await this.cacheData(sizeData);

      return sizeData;
    } catch (error) {
      console.error("Error in getAllSizeComparisons:", error);
      throw error;
    }
  },

  /**
   * Fetches a specific week's size comparison data
   * @param week The pregnancy week number (5-40)
   */
  async getSizeComparisonByWeek(
    week: number
  ): Promise<FetalSizeComparison | null> {
    try {
      // Check cache first
      const cachedData = await this.getCachedData();
      if (cachedData) {
        const weekData = cachedData.find((item) => item.week === week);
        if (weekData) return weekData;
      }

      // Fetch from database
      const { data, error } = await supabase
        .from("fetal_size_comparisons")
        .select("*")
        .eq("week", week)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // No data found
        }
        throw new Error(`Error fetching fetal size data: ${error.message}`);
      }

      // Transform to match interface
      const sizeData: FetalSizeComparison = {
        week: data.week,
        fruitName: data.fruit_name,
        sizeCm: data.size_cm,
        sizeInches: data.size_inches,
        weightG: data.weight_g,
        weightOz: data.weight_oz,
        imageUrl: data.image_url,
        description: data.description,
      };

      return sizeData;
    } catch (error) {
      console.error("Error in getSizeComparisonByWeek:", error);
      throw error;
    }
  },

  /**
   * Clears the cached size comparison data
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FETAL_SIZE_CACHE_KEY);
    } catch (error) {
      console.error("Error clearing fetal size cache:", error);
    }
  },

  /**
   * Retrieves cached size comparison data if available and not expired
   * @private
   */
  async getCachedData(): Promise<FetalSizeComparison[] | null> {
    try {
      const cachedString = await AsyncStorage.getItem(FETAL_SIZE_CACHE_KEY);
      if (!cachedString) return null;

      const { data, timestamp } = JSON.parse(cachedString);

      // Check if cache is expired
      if (Date.now() - timestamp > CACHE_EXPIRY) {
        await this.clearCache();
        return null;
      }

      return data as FetalSizeComparison[];
    } catch (error) {
      console.error("Error reading from cache:", error);
      return null;
    }
  },

  /**
   * Stores size comparison data in the cache
   * @param data The data to be cached
   * @private
   */
  async cacheData(data: FetalSizeComparison[]): Promise<void> {
    try {
      const cacheData = {
        timestamp: Date.now(),
        data,
      };
      await AsyncStorage.setItem(
        FETAL_SIZE_CACHE_KEY,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error("Error writing to cache:", error);
    }
  },
};
