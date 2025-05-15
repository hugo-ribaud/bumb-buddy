import {
  Food,
  FoodCategory,
  FoodFilter,
  FoodService,
  FoodWithCategory,
  SafetyRating,
} from "food-types";

import supabase from "../config/supabaseConfig";

// Food service for the food safety database
const foodService: FoodService = {
  // Get all food categories
  getCategories: async (): Promise<FoodCategory[]> => {
    try {
      const { data, error } = await supabase
        .from("food_categories")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching food categories:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Unexpected error fetching food categories:", error);
      return [];
    }
  },

  // Get all foods
  getAllFoods: async (): Promise<Food[]> => {
    try {
      const { data, error } = await supabase
        .from("foods")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching foods:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Unexpected error fetching foods:", error);
      return [];
    }
  },

  // Get foods by category
  getFoodsByCategory: async (categoryId: string): Promise<Food[]> => {
    try {
      const { data, error } = await supabase
        .from("foods")
        .select("*")
        .eq("category_id", categoryId)
        .order("name");

      if (error) {
        console.error("Error fetching foods by category:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Unexpected error fetching foods by category:", error);
      return [];
    }
  },

  // Search foods by name
  searchFoods: async (query: string): Promise<Food[]> => {
    try {
      const { data, error } = await supabase
        .from("foods")
        .select("*")
        .ilike("name", `%${query}%`)
        .order("name");

      if (error) {
        console.error("Error searching foods:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Unexpected error searching foods:", error);
      return [];
    }
  },

  // Get foods by safety rating
  getFoodsBySafety: async (safety: SafetyRating): Promise<Food[]> => {
    try {
      const { data, error } = await supabase
        .from("foods")
        .select("*")
        .eq("safety_rating", safety)
        .order("name");

      if (error) {
        console.error("Error fetching foods by safety:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Unexpected error fetching foods by safety:", error);
      return [];
    }
  },

  // Get foods with their categories
  getFoodsWithCategory: async (): Promise<FoodWithCategory[]> => {
    try {
      const { data, error } = await supabase
        .from("foods")
        .select(
          `
          *,
          category:food_categories(*)
        `
        )
        .order("name");

      if (error) {
        console.error("Error fetching foods with categories:", error);
        return [];
      }

      return (data as FoodWithCategory[]) || [];
    } catch (error) {
      console.error("Unexpected error fetching foods with categories:", error);
      return [];
    }
  },

  // Filter foods with multiple criteria
  filterFoods: async (filter: FoodFilter): Promise<Food[]> => {
    try {
      let query = supabase.from("foods").select("*").order("name");

      // Apply category filter if provided
      if (filter.category_id) {
        query = query.eq("category_id", filter.category_id);
      }

      // Apply safety rating filter if provided
      if (filter.safety_rating) {
        query = query.eq("safety_rating", filter.safety_rating);
      }

      // Apply search term filter if provided
      if (filter.searchTerm && filter.searchTerm.trim() !== "") {
        query = query.ilike("name", `%${filter.searchTerm.trim()}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error filtering foods:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Unexpected error filtering foods:", error);
      return [];
    }
  },

  // Set up realtime subscription for foods table
  subscribeToFoods: (callback: (payload: any) => void) => {
    try {
      console.log("Setting up Foods table subscription...");

      const subscription = supabase
        .channel("public:foods")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "foods" },
          (payload) => {
            console.log("Food change event:", payload);
            callback(payload);
          }
        )
        .subscribe((status) => {
          console.log("Foods subscription status:", status);
        });

      return subscription;
    } catch (error) {
      console.error("Error setting up Foods subscription:", error);
      return null;
    }
  },

  // Unsubscribe from foods changes
  unsubscribe: (subscription: any) => {
    if (subscription) {
      try {
        supabase.removeChannel(subscription);
        console.log("Unsubscribed from foods channel");
      } catch (error) {
        console.error("Error unsubscribing from foods channel:", error);
      }
    }
  },
};

export default foodService;
