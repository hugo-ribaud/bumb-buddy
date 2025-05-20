/**
 * TypeScript interface for fetal size comparison data
 * This maps to the fetal_size_comparisons table in the database
 */
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
