export interface PregnancyWeek {
  week: number;
  fetal_development: string;
  maternal_changes: string;
  tips: string;
  nutrition_advice: string;
  common_symptoms: string;
  medical_checkups: string;
  image_url?: string;
}

export interface PregnancyWeekTranslation {
  week: number;
  language: string;
  translations: {
    fetal_development: string;
    maternal_changes: string;
    tips: string;
    nutrition_advice: string;
    common_symptoms: string;
    medical_checkups: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface PregnancyWeekWithTranslations extends PregnancyWeek {
  availableLanguages: string[];
  translatedContent?: Record<string, PregnancyWeekTranslation["translations"]>;
}

export type TrimesterType = 1 | 2 | 3;

export interface TimelineCacheData {
  data: PregnancyWeek[];
  timestamp: number;
  expiration: number;
}

export interface TranslationsCacheData {
  data: Record<string, PregnancyWeekTranslation[]>;
  timestamp: number;
  expiration: number;
}
