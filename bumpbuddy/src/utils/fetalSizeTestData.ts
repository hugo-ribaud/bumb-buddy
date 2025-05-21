import supabase from "../config/supabaseConfig";
import { FetalSizeComparison } from "../types/fetalSize";

// Sample test data for common pregnancy weeks
export const sampleFetalSizeData: FetalSizeComparison[] = [
  {
    id: "week-5",
    week: 5,
    name: "sesame seed",
    size_mm: 1.5,
    size_in: 0.06,
    weight_g: 0.1,
    weight_oz: 0.004,
    description: "Your baby is about the size of a sesame seed.",
    image_url: "https://source.unsplash.com/random/500x500/?sesame",
  },
  {
    id: "week-6",
    week: 6,
    name: "lentil",
    size_mm: 6,
    size_in: 0.25,
    weight_g: 0.3,
    weight_oz: 0.01,
    description: "Your baby is about the size of a lentil.",
    image_url: "https://source.unsplash.com/random/500x500/?lentil",
  },
  {
    id: "week-7",
    week: 7,
    name: "blueberry",
    size_mm: 13,
    size_in: 0.5,
    weight_g: 1,
    weight_oz: 0.04,
    description: "Your baby is about the size of a blueberry.",
    image_url: "https://source.unsplash.com/random/500x500/?blueberry",
  },
  {
    id: "week-8",
    week: 8,
    name: "kidney bean",
    size_mm: 16,
    size_in: 0.63,
    weight_g: 1.5,
    weight_oz: 0.05,
    description: "Your baby is about the size of a kidney bean.",
    image_url: "https://source.unsplash.com/random/500x500/?bean",
  },
  {
    id: "week-9",
    week: 9,
    name: "grape",
    size_mm: 22,
    size_in: 0.9,
    weight_g: 2,
    weight_oz: 0.07,
    description: "Your baby is about the size of a grape.",
    image_url: "https://source.unsplash.com/random/500x500/?grape",
  },
  {
    id: "week-10",
    week: 10,
    name: "strawberry",
    size_mm: 30,
    size_in: 1.2,
    weight_g: 4,
    weight_oz: 0.14,
    description: "Your baby is about the size of a strawberry.",
    image_url: "https://source.unsplash.com/random/500x500/?strawberry",
  },
  {
    id: "week-11",
    week: 11,
    name: "lime",
    size_mm: 41,
    size_in: 1.6,
    weight_g: 7,
    weight_oz: 0.25,
    description: "Your baby is about the size of a lime.",
    image_url: "https://source.unsplash.com/random/500x500/?lime",
  },
  {
    id: "week-12",
    week: 12,
    name: "plum",
    size_mm: 55,
    size_in: 2.2,
    weight_g: 14,
    weight_oz: 0.5,
    description: "Your baby is about the size of a plum.",
    image_url: "https://source.unsplash.com/random/500x500/?plum",
  },
];

// Function to check if we have data and populate with sample data if needed
export const checkAndPopulateFetalSizeData = async (): Promise<void> => {
  try {
    // Check if there's any data in the fetal_size_comparisons table
    const { data, error, count } = await supabase
      .from("fetal_size_comparisons")
      .select("*", { count: "exact" });

    if (error) {
      console.error("Error checking fetal size data:", error);
      return;
    }

    // If there's no data, insert the sample data
    if (!count || count === 0) {
      console.log("No fetal size data found. Adding sample data...");
      const { data: insertData, error: insertError } = await supabase
        .from("fetal_size_comparisons")
        .insert(sampleFetalSizeData);

      if (insertError) {
        console.error("Error inserting sample fetal size data:", insertError);
      } else {
        console.log("Successfully added sample fetal size data");
      }
    } else {
      console.log(
        `Found ${count} existing fetal size records, no need to populate`
      );
    }
  } catch (error) {
    console.error("Error in checkAndPopulateFetalSizeData:", error);
  }
};
