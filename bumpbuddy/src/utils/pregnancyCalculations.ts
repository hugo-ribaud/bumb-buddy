/**
 * Utility functions for pregnancy-related calculations
 */

/**
 * Calculate current pregnancy week based on due date
 * Uses consistent logic across the entire application
 * @param dueDate - The due date as a string (ISO format) or null
 * @returns The current pregnancy week (1-40) or 0 if invalid
 */
export const calculatePregnancyWeek = (dueDate: string | null): number => {
  if (!dueDate) {
    return 0;
  }

  try {
    const due = new Date(dueDate);
    const today = new Date();

    // Invalid due date (in the past)
    if (due < today) {
      return 0;
    }

    // Calculate weeks difference
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // A full-term pregnancy is about 40 weeks
    const weeksLeft = Math.round(diffDays / 7);
    const currentWeek = 40 - weeksLeft;

    // Return valid week range (1-40)
    return Math.max(1, Math.min(currentWeek, 40));
  } catch (error) {
    console.error('Error calculating pregnancy week:', error);
    return 0;
  }
};

/**
 * Calculate which trimester a given week falls into
 * @param week - The pregnancy week (1-40)
 * @returns The trimester number (1, 2, or 3)
 */
export const calculateTrimester = (week: number): 1 | 2 | 3 => {
  if (week <= 13) return 1;
  if (week <= 26) return 2;
  return 3;
};

/**
 * Calculate progress percentage for a given week
 * @param week - The pregnancy week (1-40)
 * @returns Progress percentage (0-100)
 */
export const calculateProgressPercentage = (week: number): number => {
  return Math.min((week / 40) * 100, 100);
};
