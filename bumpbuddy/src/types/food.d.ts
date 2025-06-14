declare module 'food-types' {
  export type SafetyRating = 'safe' | 'caution' | 'avoid';

  export interface FoodCategory {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    created_at: string;
    updated_at: string;
  }

  export interface Food {
    id: string;
    category_id: string | null;
    name: string;
    safety_rating: SafetyRating;
    description: string | null;
    alternatives: string | null;
    nutritional_info: {
      [key: string]: string | string[] | null;
    } | null;
    image_url: string | null;
    created_at: string;
    updated_at: string;
  }

  export interface FoodWithCategory extends Food {
    category?: FoodCategory;
  }

  export interface FoodFilter {
    category_id?: string;
    safety_rating?: SafetyRating;
    searchTerm?: string;
  }

  export interface FoodService {
    getCategories(language?: string): Promise<FoodCategory[]>;
    getAllFoods(language?: string): Promise<Food[]>;
    getFoodsByCategory(categoryId: string, language?: string): Promise<Food[]>;
    searchFoods(query: string, language?: string): Promise<Food[]>;
    getFoodsBySafety(safety: SafetyRating, language?: string): Promise<Food[]>;
    getFoodsWithCategory(language?: string): Promise<FoodWithCategory[]>;
    filterFoods(filter: FoodFilter, language?: string): Promise<Food[]>;
    subscribeToFoods(callback: (payload: any) => void): any;
    unsubscribe(subscription: any): void;
  }
}
