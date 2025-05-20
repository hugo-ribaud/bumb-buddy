# Fetal Size Comparison - Database Implementation

## Database Schema

```sql
-- Create the table to store fetal size comparisons
CREATE TABLE fetal_size_comparisons (
  week INTEGER PRIMARY KEY,
  fruit_name TEXT NOT NULL,
  size_cm NUMERIC(5,2) NOT NULL,
  size_inches NUMERIC(5,2) NOT NULL,
  weight_g NUMERIC(7,2),
  weight_oz NUMERIC(7,2),
  image_url TEXT,
  description TEXT
);

-- Row Level Security - Allow read-only access to all authenticated users
ALTER TABLE fetal_size_comparisons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access for all authenticated users"
  ON fetal_size_comparisons FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create the initial seed data
INSERT INTO fetal_size_comparisons (week, fruit_name, size_cm, size_inches, weight_g, weight_oz, description) VALUES
(5, 'Sesame Seed', 0.1, 0.04, 0.1, 0.004, 'Your baby is the size of a tiny sesame seed.'),
(6, 'Lentil', 0.3, 0.12, 0.3, 0.01, 'Your baby is about the size of a lentil.'),
(7, 'Blueberry', 1.0, 0.39, 1.0, 0.04, 'Your baby is roughly the size of a blueberry.'),
(8, 'Kidney Bean', 1.6, 0.63, 1.5, 0.05, 'Your baby is about the size of a kidney bean.'),
(9, 'Grape', 2.3, 0.9, 2.8, 0.1, 'Your baby is approximately the size of a grape.'),
(10, 'Kumquat', 3.1, 1.22, 5.7, 0.2, 'Your baby is the size of a kumquat.'),
(11, 'Fig', 4.1, 1.61, 9.0, 0.3, 'Your baby is about the size of a fig.'),
(12, 'Lime', 5.4, 2.13, 14.0, 0.5, 'Your baby is roughly the size of a lime.'),
(13, 'Lemon', 7.3, 2.87, 23.0, 0.8, 'Your baby is approximately the size of a lemon.'),
(14, 'Peach', 8.7, 3.42, 43.0, 1.5, 'Your baby is about the size of a peach.'),
(15, 'Apple', 10.1, 3.98, 70.0, 2.5, 'Your baby is roughly the size of an apple.'),
(16, 'Avocado', 11.6, 4.57, 100.0, 3.5, 'Your baby is about the size of an avocado.'),
(17, 'Pear', 13.0, 5.12, 140.0, 4.9, 'Your baby is approximately the size of a pear.'),
(18, 'Bell Pepper', 14.2, 5.59, 190.0, 6.7, 'Your baby is about the size of a bell pepper.'),
(19, 'Mango', 15.3, 6.02, 240.0, 8.5, 'Your baby is roughly the size of a mango.'),
(20, 'Banana', 16.4, 6.46, 300.0, 10.6, 'Your baby is about the size of a banana.'),
(21, 'Carrot', 26.7, 10.51, 360.0, 12.7, 'Your baby is approximately the size of a carrot.'),
(22, 'Corn Cob', 27.8, 10.94, 430.0, 15.2, 'Your baby is about the size of a corn cob.'),
(23, 'Grapefruit', 28.9, 11.38, 500.0, 17.6, 'Your baby is roughly the size of a grapefruit.'),
(24, 'Cantaloupe', 30.0, 11.81, 600.0, 21.2, 'Your baby is approximately the size of a cantaloupe.'),
(25, 'Cauliflower', 34.6, 13.62, 660.0, 23.3, 'Your baby is about the size of a cauliflower.'),
(26, 'Lettuce', 35.6, 14.02, 760.0, 26.8, 'Your baby is roughly the size of a head of lettuce.'),
(27, 'Cabbage', 36.6, 14.41, 875.0, 30.9, 'Your baby is approximately the size of a cabbage.'),
(28, 'Eggplant', 37.6, 14.8, 1000.0, 35.3, 'Your baby is about the size of an eggplant.'),
(29, 'Butternut Squash', 38.6, 15.2, 1150.0, 40.6, 'Your baby is roughly the size of a butternut squash.'),
(30, 'Cucumber', 39.9, 15.71, 1320.0, 46.6, 'Your baby is approximately the size of a cucumber.'),
(31, 'Coconut', 41.1, 16.18, 1500.0, 52.9, 'Your baby is about the size of a coconut.'),
(32, 'Pineapple', 42.4, 16.69, 1700.0, 60.0, 'Your baby is roughly the size of a pineapple.'),
(33, 'Honeydew Melon', 43.7, 17.2, 1900.0, 67.1, 'Your baby is approximately the size of a honeydew melon.'),
(34, 'Cantaloupe', 45.0, 17.72, 2100.0, 74.1, 'Your baby is about the size of a cantaloupe.'),
(35, 'Honeydew Melon', 46.2, 18.19, 2350.0, 82.9, 'Your baby is roughly the size of a honeydew melon.'),
(36, 'Romaine Lettuce', 47.4, 18.66, 2600.0, 91.7, 'Your baby is approximately the size of a head of romaine lettuce.'),
(37, 'Swiss Chard', 48.6, 19.13, 2900.0, 102.3, 'Your baby is about the size of a bunch of swiss chard.'),
(38, 'Leek', 49.8, 19.61, 3100.0, 109.3, 'Your baby is roughly the size of a leek.'),
(39, 'Watermelon', 50.7, 19.96, 3300.0, 116.4, 'Your baby is approximately the size of a mini watermelon.'),
(40, 'Pumpkin', 51.2, 20.16, 3500.0, 123.5, 'Your baby is about the size of a small pumpkin.');

-- Note: After generating images with DALL-E, update the image_url field for each week
-- Example:
-- UPDATE fetal_size_comparisons SET image_url = 'https://supabase-bucket-url/fetal_size/week_05_sesame_seed.png' WHERE week = 5;
```

## TypeScript Interface

```typescript
// src/types/fetalSize.ts
export interface FetalSizeComparison {
  week: number;
  fruitName: string;
  sizeCm: number;
  sizeInches: number;
  weightG: number | null;
  weightOz: number | null;
  imageUrl: string | null;
  description: string;
}
```

## Implementation Steps

1. **Create Migration**

   - Save the schema SQL to a migration file
   - Apply the migration to the Supabase project

2. **Generate Images**

   - Use DALL-E to generate all images using provided prompts
   - Process images for transparency and consistency
   - Upload images to Supabase Storage

3. **Update Database**

   - Update the `image_url` field with the Supabase Storage URLs

4. **Create Service**

   - Create a `fetalSizeService.ts` to handle fetching and caching

5. **Create Redux Slice**

   - Create a new `fetalSizeSlice.ts` for state management

6. **Create UI Components**
   - Create a `FetalSizeComparison` component
   - Integrate it into the Timeline screens

## Service Implementation

```typescript
// src/services/fetalSizeService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../config/supabaseConfig";
import { FetalSizeComparison } from "../types/fetalSize";

const FETAL_SIZE_CACHE_KEY = "fetalsize_data";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const fetalSizeService = {
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
      const sizeData: FetalSizeComparison[] = data.map((item) => ({
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

  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FETAL_SIZE_CACHE_KEY);
    } catch (error) {
      console.error("Error clearing fetal size cache:", error);
    }
  },

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
```

## Integration Plan

1. Update the existing `pregnancy_weeks` table to include a relationship to fetal_size_comparisons
2. Enhance the TimelineScreen to show the fruit comparison
3. Add a detailed view to WeekDetailScreen with the fruit comparison
4. Ensure the UI respects the user's unit preference (metric/imperial)

This implementation will provide a visually appealing and informative addition to the pregnancy timeline feature.
