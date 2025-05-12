/**
 * Number formatting utilities with locale support
 * Provides locale-aware formatting for weights, measurements, and currencies
 */

import i18next from "i18next";

/**
 * Format a number according to the current locale
 * @param value The number to format
 * @param options Intl.NumberFormat options
 * @returns Formatted number string
 */
export const formatNumber = (
  value: number,
  options: Intl.NumberFormatOptions = {}
): string => {
  const locale = i18next.language || "en";
  return new Intl.NumberFormat(locale, options).format(value);
};

/**
 * Format a number with a specific number of decimal places
 * @param value The number to format
 * @param decimals Number of decimal places
 * @returns Formatted number string
 */
export const formatDecimal = (value: number, decimals: number = 2): string => {
  return formatNumber(value, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format a weight value based on user's preferred units
 * @param value The weight in kilograms
 * @param useImperial Whether to use imperial units (pounds)
 * @returns Formatted weight string with unit
 */
export const formatWeight = (
  value: number,
  useImperial: boolean = false
): string => {
  if (useImperial) {
    // Convert kg to lbs (1 kg = 2.20462 lbs)
    const lbs = value * 2.20462;
    return `${formatDecimal(lbs)} lbs`;
  }

  return `${formatDecimal(value)} kg`;
};

/**
 * Format a length value based on user's preferred units
 * @param value The length in centimeters
 * @param useImperial Whether to use imperial units (inches)
 * @returns Formatted length string with unit
 */
export const formatLength = (
  value: number,
  useImperial: boolean = false
): string => {
  if (useImperial) {
    // Convert cm to inches (1 cm = 0.393701 inches)
    const inches = value * 0.393701;
    return `${formatDecimal(inches)} in`;
  }

  return `${formatDecimal(value)} cm`;
};

/**
 * Convert between metric and imperial weight units
 * @param value The weight value
 * @param toImperial Whether to convert to imperial (true) or metric (false)
 * @returns Converted weight value
 */
export const convertWeight = (value: number, toImperial: boolean): number => {
  if (toImperial) {
    // Convert kg to lbs
    return value * 2.20462;
  } else {
    // Convert lbs to kg
    return value / 2.20462;
  }
};

/**
 * Convert between metric and imperial length units
 * @param value The length value
 * @param toImperial Whether to convert to imperial (true) or metric (false)
 * @returns Converted length value
 */
export const convertLength = (value: number, toImperial: boolean): number => {
  if (toImperial) {
    // Convert cm to inches
    return value * 0.393701;
  } else {
    // Convert inches to cm
    return value / 0.393701;
  }
};

/**
 * Format a percentage
 * @param value The value as a decimal (e.g., 0.75 for 75%)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  return formatNumber(value * 100, {
    style: "percent",
    maximumFractionDigits: 0,
  });
};

/**
 * Format a currency amount
 * @param value The amount
 * @param currency The currency code (ISO 4217, e.g. 'USD', 'EUR')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number,
  currency: string = "USD"
): string => {
  return formatNumber(value, { style: "currency", currency });
};

export default {
  formatNumber,
  formatDecimal,
  formatWeight,
  formatLength,
  convertWeight,
  convertLength,
  formatPercentage,
  formatCurrency,
};
