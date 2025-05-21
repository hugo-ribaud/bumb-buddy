export interface FetalSizeComparison {
  id: string;
  week: number;
  name: string;
  size_cm?: number;
  size_inches?: number;
  weight_g?: number;
  weight_oz?: number;
  description?: string;
  image_url: string;
}
