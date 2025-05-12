/**
 * Date formatting utilities with locale support
 * Uses date-fns for handling locale-specific date formatting
 */

import {
    format,
    formatDistance,
    formatRelative,
    isToday,
    isTomorrow,
    isYesterday,
    Locale,
} from "date-fns";
import { enUS, es, fr } from "date-fns/locale";
import i18next from "i18next";
mport i18next from "i18next";

// Map of supported locales
const locales: { [key: string]: Locale } = {
  en: enUS,
  es: es,
  fr: fr,
};

// Get current locale from i18next
const getCurrentLocale = (): Locale => {
  const language = i18next.language || "en";
  return locales[language.split("-")[0]] || enUS;
};

/**
 * Format a date with the specified format string
 * @param date The date to format
 * @param formatStr The format string (date-fns format)
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | number,
  formatStr: string = "PPP"
): string => {
  const locale = getCurrentLocale();
  return format(date, formatStr, { locale });
};

/**
 * Format a date as a short date (MM/DD/YYYY or equivalent in locale)
 * @param date The date to format
 * @returns Formatted date string
 */
export const formatShortDate = (date: Date | number): string => {
  return formatDate(date, "P");
};

/**
 * Format a date as a long date (Month DD, YYYY or equivalent in locale)
 * @param date The date to format
 * @returns Formatted date string
 */
export const formatLongDate = (date: Date | number): string => {
  return formatDate(date, "PPP");
};

/**
 * Format a time (HH:MM or equivalent in locale)
 * @param date The date to format
 * @returns Formatted time string
 */
export const formatTime = (date: Date | number): string => {
  return formatDate(date, "p");
};

/**
 * Format a date and time (Month DD, YYYY HH:MM or equivalent in locale)
 * @param date The date to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date | number): string => {
  return formatDate(date, "PPp");
};

/**
 * Format a relative time (e.g., "2 days ago", "in 3 hours")
 * @param date The date to format
 * @param baseDate The base date to compare against (defaults to now)
 * @returns Formatted relative time string
 */
export const formatRelativeTime = (
  date: Date | number,
  baseDate: Date | number = new Date()
): string => {
  const locale = getCurrentLocale();
  return formatDistance(date, baseDate, { locale, addSuffix: true });
};

/**
 * Format a date with contextual awareness (today, yesterday, tomorrow, etc.)
 * @param date The date to format
 * @returns Formatted date string with context
 */
export const formatContextualDate = (date: Date | number): string => {
  const t = i18next.t;

  if (isToday(date)) return t("common.labels.today");
  if (isYesterday(date)) return t("common.labels.yesterday");
  if (isTomorrow(date)) return t("common.labels.tomorrow");

  const locale = getCurrentLocale();
  return formatRelative(date, new Date(), { locale });
};

/**
 * Format a date range
 * @param startDate The start date
 * @param endDate The end date
 * @returns Formatted date range string
 */
export const formatDateRange = (
  startDate: Date | number,
  endDate: Date | number
): string => {
  return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`;
};

export default {
  formatDate,
  formatShortDate,
  formatLongDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatContextualDate,
  formatDateRange,
};
