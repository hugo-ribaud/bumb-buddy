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

export interface FetalSizeTranslation {
  week: number;
  language: string;
  translations: {
    name: string;
    description?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface FetalSizeComparisonWithTranslations
  extends FetalSizeComparison {
  availableLanguages: string[];
  translatedContent?: Record<string, FetalSizeTranslation["translations"]>;
}

export interface FetalSizeCacheData {
  data: FetalSizeComparison[];
  timestamp: number;
  expiration: number;
}

export interface FetalSizeTranslationsCacheData {
  data: Record<string, FetalSizeTranslation[]>;
  timestamp: number;
  expiration: number;
}
