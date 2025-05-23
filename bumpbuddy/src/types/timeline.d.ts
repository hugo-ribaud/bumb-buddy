declare module "timeline-types" {
  export interface PregnancyWeek {
    week: number;
    fetal_development: string;
    maternal_changes: string;
    tips: string;
    nutrition_advice: string;
    common_symptoms: string;
    medical_checkups: string;
    image_url: string;
  }

  export interface TimelineService {
    getWeekInfo(
      weekNumber: number,
      language?: string
    ): Promise<PregnancyWeek | null>;
    getAllWeeks(language?: string): Promise<PregnancyWeek[]>;
    getTrimesterWeeks(
      trimester: 1 | 2 | 3,
      language?: string
    ): Promise<PregnancyWeek[]>;
    calculateCurrentWeek(dueDate: string | null): number;
    getCurrentWeekInfo(
      dueDate: string | null,
      language?: string
    ): Promise<PregnancyWeek | null>;
    clearCache(): Promise<void>;
  }
}
