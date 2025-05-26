import {
  Food,
  FoodCategory,
  FoodFilter,
  FoodService,
  FoodWithCategory,
  SafetyRating,
} from "food-types";

import supabase from "../config/supabaseConfig";

// Enhanced food service with translation support
const foodService: FoodService = {
  // Get all food categories with translations
  getCategories: async (language: string = "en"): Promise<FoodCategory[]> => {
    try {
      const { data, error } = await supabase
        .from("food_categories")
        .select(
          `
          id,
          name,
          description,
          icon,
          created_at,
          updated_at,
          translations:food_categories_translations!inner(translations)
        `
        )
        .eq("food_categories_translations.language", language)
        .order("name");

      if (error) {
        console.error("Error fetching food categories:", error);
        // Fallback to English if translation fails
        if (language !== "en") {
          return foodService.getCategories("en");
        }
        return [];
      }

      // Transform data to use translated content
      const transformedData =
        data?.map((category) => ({
          ...category,
          name: category.translations?.[0]?.translations?.name || category.name,
          description:
            category.translations?.[0]?.translations?.description ||
            category.description,
          translations: undefined, // Remove translations array from final result
        })) || [];

      return transformedData;
    } catch (error) {
      console.error("Unexpected error fetching food categories:", error);
      // Fallback to English if translation fails
      if (language !== "en") {
        return foodService.getCategories("en");
      }
      return [];
    }
  },

  // Get all foods with translations
  getAllFoods: async (language: string = "en"): Promise<Food[]> => {
    try {
      const { data, error } = await supabase
        .from("foods")
        .select(
          `
          id,
          category_id,
          name,
          safety_rating,
          description,
          alternatives,
          nutritional_info,
          image_url,
          created_at,
          updated_at,
          translations:foods_translations!inner(translations)
        `
        )
        .eq("foods_translations.language", language)
        .order("name");

      if (error) {
        console.error("Error fetching foods:", error);
        // Fallback to English if translation fails
        if (language !== "en") {
          return foodService.getAllFoods("en");
        }
        return [];
      }

      // Transform data to use translated content
      const transformedData =
        data?.map((food) => ({
          ...food,
          name: food.translations?.[0]?.translations?.name || food.name,
          description:
            food.translations?.[0]?.translations?.description ||
            food.description,
          alternatives:
            food.translations?.[0]?.translations?.alternatives ||
            food.alternatives,
          translations: undefined, // Remove translations array from final result
        })) || [];

      return transformedData;
    } catch (error) {
      console.error("Unexpected error fetching foods:", error);
      // Fallback to English if translation fails
      if (language !== "en") {
        return foodService.getAllFoods("en");
      }
      return [];
    }
  },

  // Get foods by category with translations
  getFoodsByCategory: async (
    categoryId: string,
    language: string = "en"
  ): Promise<Food[]> => {
    try {
      const { data, error } = await supabase
        .from("foods")
        .select(
          `
          id,
          category_id,
          name,
          safety_rating,
          description,
          alternatives,
          nutritional_info,
          image_url,
          created_at,
          updated_at,
          translations:foods_translations!inner(translations)
        `
        )
        .eq("category_id", categoryId)
        .eq("foods_translations.language", language)
        .order("name");

      if (error) {
        console.error("Error fetching foods by category:", error);
        // Fallback to English if translation fails
        if (language !== "en") {
          return foodService.getFoodsByCategory(categoryId, "en");
        }
        return [];
      }

      // Transform data to use translated content
      const transformedData =
        data?.map((food) => ({
          ...food,
          name: food.translations?.[0]?.translations?.name || food.name,
          description:
            food.translations?.[0]?.translations?.description ||
            food.description,
          alternatives:
            food.translations?.[0]?.translations?.alternatives ||
            food.alternatives,
          translations: undefined, // Remove translations array from final result
        })) || [];

      return transformedData;
    } catch (error) {
      console.error("Unexpected error fetching foods by category:", error);
      // Fallback to English if translation fails
      if (language !== "en") {
        return foodService.getFoodsByCategory(categoryId, "en");
      }
      return [];
    }
  },

  // Search foods by name with translations
  searchFoods: async (
    query: string,
    language: string = "en"
  ): Promise<Food[]> => {
    try {
      const { data, error } = await supabase
        .from("foods")
        .select(
          `
          id,
          category_id,
          name,
          safety_rating,
          description,
          alternatives,
          nutritional_info,
          image_url,
          created_at,
          updated_at,
          translations:foods_translations!inner(translations)
        `
        )
        .eq("foods_translations.language", language)
        .or(
          `name.ilike.%${query}%,foods_translations.translations->>name.ilike.%${query}%`
        )
        .order("name");

      if (error) {
        console.error("Error searching foods:", error);
        // Fallback to English if translation fails
        if (language !== "en") {
          return foodService.searchFoods(query, "en");
        }
        return [];
      }

      // Transform data to use translated content
      const transformedData =
        data?.map((food) => ({
          ...food,
          name: food.translations?.[0]?.translations?.name || food.name,
          description:
            food.translations?.[0]?.translations?.description ||
            food.description,
          alternatives:
            food.translations?.[0]?.translations?.alternatives ||
            food.alternatives,
          translations: undefined, // Remove translations array from final result
        })) || [];

      return transformedData;
    } catch (error) {
      console.error("Unexpected error searching foods:", error);
      // Fallback to English if translation fails
      if (language !== "en") {
        return foodService.searchFoods(query, "en");
      }
      return [];
    }
  },

  // Get foods by safety rating with translations
  getFoodsBySafety: async (
    safety: SafetyRating,
    language: string = "en"
  ): Promise<Food[]> => {
    try {
      const { data, error } = await supabase
        .from("foods")
        .select(
          `
          id,
          category_id,
          name,
          safety_rating,
          description,
          alternatives,
          nutritional_info,
          image_url,
          created_at,
          updated_at,
          translations:foods_translations!inner(translations)
        `
        )
        .eq("safety_rating", safety)
        .eq("foods_translations.language", language)
        .order("name");

      if (error) {
        console.error("Error fetching foods by safety:", error);
        // Fallback to English if translation fails
        if (language !== "en") {
          return foodService.getFoodsBySafety(safety, "en");
        }
        return [];
      }

      // Transform data to use translated content
      const transformedData =
        data?.map((food) => ({
          ...food,
          name: food.translations?.[0]?.translations?.name || food.name,
          description:
            food.translations?.[0]?.translations?.description ||
            food.description,
          alternatives:
            food.translations?.[0]?.translations?.alternatives ||
            food.alternatives,
          translations: undefined, // Remove translations array from final result
        })) || [];

      return transformedData;
    } catch (error) {
      console.error("Unexpected error fetching foods by safety:", error);
      // Fallback to English if translation fails
      if (language !== "en") {
        return foodService.getFoodsBySafety(safety, "en");
      }
      return [];
    }
  },

  // Get foods with their categories (both translated)
  getFoodsWithCategory: async (
    language: string = "en"
  ): Promise<FoodWithCategory[]> => {
    try {
      const { data, error } = await supabase
        .from("foods")
        .select(
          `
          id,
          category_id,
          name,
          safety_rating,
          description,
          alternatives,
          nutritional_info,
          image_url,
          created_at,
          updated_at,
          translations:foods_translations!inner(translations),
          category:food_categories!inner(
            id,
            name,
            description,
            icon,
            created_at,
            updated_at,
            translations:food_categories_translations!inner(translations)
          )
        `
        )
        .eq("foods_translations.language", language)
        .eq("food_categories.food_categories_translations.language", language)
        .order("name");

      if (error) {
        console.error("Error fetching foods with categories:", error);
        // Fallback to English if translation fails
        if (language !== "en") {
          return foodService.getFoodsWithCategory("en");
        }
        return [];
      }

      // Transform data to use translated content
      const transformedData =
        data?.map((food) => ({
          ...food,
          name: food.translations?.[0]?.translations?.name || food.name,
          description:
            food.translations?.[0]?.translations?.description ||
            food.description,
          alternatives:
            food.translations?.[0]?.translations?.alternatives ||
            food.alternatives,
          category:
            food.category && food.category[0]
              ? {
                  id: food.category[0].id,
                  name:
                    food.category[0].translations?.[0]?.translations?.name ||
                    food.category[0].name,
                  description:
                    food.category[0].translations?.[0]?.translations
                      ?.description || food.category[0].description,
                  icon: food.category[0].icon,
                  created_at: food.category[0].created_at,
                  updated_at: food.category[0].updated_at,
                }
              : undefined,
          translations: undefined, // Remove translations array from final result
        })) || [];

      return transformedData as FoodWithCategory[];
    } catch (error) {
      console.error("Unexpected error fetching foods with categories:", error);
      // Fallback to English if translation fails
      if (language !== "en") {
        return foodService.getFoodsWithCategory("en");
      }
      return [];
    }
  },

  // Filter foods with multiple criteria and translations
  filterFoods: async (
    filter: FoodFilter,
    language: string = "en"
  ): Promise<Food[]> => {
    try {
      let query = supabase
        .from("foods")
        .select(
          `
          id,
          category_id,
          name,
          safety_rating,
          description,
          alternatives,
          nutritional_info,
          image_url,
          created_at,
          updated_at,
          translations:foods_translations!inner(translations)
        `
        )
        .eq("foods_translations.language", language)
        .order("name");

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
        const searchTerm = filter.searchTerm.trim();
        query = query.or(
          `name.ilike.%${searchTerm}%,foods_translations.translations->>name.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error filtering foods:", error);
        // Fallback to English if translation fails
        if (language !== "en") {
          return foodService.filterFoods(filter, "en");
        }
        return [];
      }

      // Transform data to use translated content
      const transformedData =
        data?.map((food) => ({
          ...food,
          name: food.translations?.[0]?.translations?.name || food.name,
          description:
            food.translations?.[0]?.translations?.description ||
            food.description,
          alternatives:
            food.translations?.[0]?.translations?.alternatives ||
            food.alternatives,
          translations: undefined, // Remove translations array from final result
        })) || [];

      return transformedData;
    } catch (error) {
      console.error("Unexpected error filtering foods:", error);
      // Fallback to English if translation fails
      if (language !== "en") {
        return foodService.filterFoods(filter, "en");
      }
      return [];
    }
  },

  // Set up realtime subscription for foods table
  subscribeToFoods: (callback: (payload: any) => void) => {
    try {
      const subscription = supabase
        .channel("public:foods")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "foods" },
          (payload) => {
            callback(payload);
          }
        )
        .subscribe();

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
      } catch (error) {
        console.error("Error unsubscribing from foods channel:", error);
      }
    }
  },
};

export default foodService;
