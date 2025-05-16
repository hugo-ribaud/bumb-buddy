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
    getWeekInfo(weekNumber: number): Promise<PregnancyWeek | null>;
    getAllWeeks(): Promise<PregnancyWeek[]>;
    getTrimesterWeeks(trimester: 1 | 2 | 3): Promise<PregnancyWeek[]>;
    calculateCurrentWeek(dueDate: string | null): number;
    getCurrentWeekInfo(dueDate: string | null): Promise<PregnancyWeek | null>;
    clearCache(): Promise<void>;
  }
}
