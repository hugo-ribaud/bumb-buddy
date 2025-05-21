export interface FetalSizeComparison {
  id: string;
  week: number;
  name: string;
  size_mm?: number;
  size_in?: number;
  weight_g?: number;
  weight_oz?: number;
  description?: string;
  image_url: string;
}
