/**
 * Calendar Utilities for Dues Module
 * 
 * Provides dual calendar support (Hijri and Gregorian) for reminder calculations
 */

import { HijriDate, getHijriMonthName } from './hijri';
import type { CalendarType, ReminderType } from '@/types/dues';

// Gregorian month names
const GREGORIAN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

/**
 * Get the number of days in a Hijri month
 * Hijri months alternate between 30 and 29 days
 * Odd months (1,3,5,7,9,11) = 30 days
 * Even months (2,4,6,8,10,12) = 29 days
 */
export function getDaysInHijriMonth(month: number): number {
  return month % 2 === 1 ? 30 : 29;
}

/**
 * Get the number of days in a Gregorian month
 */
export function getDaysInGregorianMonth(month: number, year: number): number {
  // month is 1-indexed (1 = January)
  return new Date(year, month, 0).getDate();
}

/**
 * Calculate days remaining in the current Hijri month
 */
export function daysRemainingHijri(currentHijri: HijriDate): number {
  const totalDays = getDaysInHijriMonth(currentHijri.month);
  return Math.max(0, totalDays - currentHijri.day);
}

/**
 * Calculate days remaining in the current Gregorian month
 */
export function daysRemainingGregorian(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-indexed
  const day = date.getDate();
  const totalDays = getDaysInGregorianMonth(month, year);
  return Math.max(0, totalDays - day);
}

/**
 * Check if a reminder should be shown based on the reminder configuration
 */
export function shouldShowReminder(
  reminderType: ReminderType,
  reminderDay: number | null | undefined,
  calendarType: CalendarType,
  currentHijri: HijriDate,
  currentGregorian: Date
): boolean {
  if (calendarType === 'hijri') {
    const daysLeft = daysRemainingHijri(currentHijri);
    
    switch (reminderType) {
      case 'before_7_days':
        return daysLeft <= 7;
      case 'last_day':
        return daysLeft === 0;
      case 'custom':
        return reminderDay != null && currentHijri.day >= reminderDay;
      default:
        return false;
    }
  } else {
    const daysLeft = daysRemainingGregorian(currentGregorian);
    const currentDay = currentGregorian.getDate();
    
    switch (reminderType) {
      case 'before_7_days':
        return daysLeft <= 7;
      case 'last_day':
        return daysLeft === 0;
      case 'custom':
        return reminderDay != null && currentDay >= reminderDay;
      default:
        return false;
    }
  }
}

/**
 * Calculate the urgency level for a reminder
 */
export function calculateUrgency(
  calendarType: CalendarType,
  currentHijri: HijriDate,
  currentGregorian: Date
): 'upcoming' | 'due_today' | 'overdue' {
  const daysLeft = calendarType === 'hijri' 
    ? daysRemainingHijri(currentHijri)
    : daysRemainingGregorian(currentGregorian);
  
  if (daysLeft === 0) return 'due_today';
  if (daysLeft < 0) return 'overdue';
  return 'upcoming';
}

/**
 * Get days remaining based on calendar type
 */
export function getDaysRemaining(
  calendarType: CalendarType,
  currentHijri: HijriDate,
  currentGregorian: Date
): number {
  return calendarType === 'hijri'
    ? daysRemainingHijri(currentHijri)
    : daysRemainingGregorian(currentGregorian);
}

/**
 * Format the due date based on calendar type
 */
export function formatDueDate(
  calendarType: CalendarType,
  reminderType: ReminderType,
  reminderDay: number | null | undefined,
  currentHijri: HijriDate,
  currentGregorian: Date
): string {
  if (calendarType === 'hijri') {
    const totalDays = getDaysInHijriMonth(currentHijri.month);
    const dueDay = reminderType === 'custom' && reminderDay ? reminderDay : totalDays;
    return `${dueDay} ${getHijriMonthName(currentHijri.month)}`;
  } else {
    const year = currentGregorian.getFullYear();
    const month = currentGregorian.getMonth(); // 0-indexed
    const totalDays = getDaysInGregorianMonth(month + 1, year);
    const dueDay = reminderType === 'custom' && reminderDay ? reminderDay : totalDays;
    return `${GREGORIAN_MONTHS[month]} ${dueDay}`;
  }
}

/**
 * Get month name based on calendar type
 */
export function getMonthName(
  month: number,
  calendarType: CalendarType
): string {
  if (calendarType === 'hijri') {
    return getHijriMonthName(month);
  }
  return GREGORIAN_MONTHS[month - 1] || '';
}

/**
 * Get all month options for a given calendar type
 */
export function getMonthOptions(calendarType: CalendarType): Array<{ value: number; label: string }> {
  if (calendarType === 'hijri') {
    return [
      { value: 1, label: 'Muharram' },
      { value: 2, label: 'Safar' },
      { value: 3, label: 'Rabi al-Awwal' },
      { value: 4, label: 'Rabi al-Thani' },
      { value: 5, label: 'Jumada al-Awwal' },
      { value: 6, label: 'Jumada al-Thani' },
      { value: 7, label: 'Rajab' },
      { value: 8, label: 'Shaban' },
      { value: 9, label: 'Ramadan' },
      { value: 10, label: 'Shawwal' },
      { value: 11, label: 'Dhul Qadah' },
      { value: 12, label: 'Dhul Hijjah' },
    ];
  }
  return GREGORIAN_MONTHS.map((name, index) => ({
    value: index + 1,
    label: name,
  }));
}

/**
 * Get day options for custom reminder based on calendar type
 */
export function getDayOptions(calendarType: CalendarType, month?: number): Array<{ value: number; label: string }> {
  let maxDays: number;
  
  if (calendarType === 'hijri') {
    maxDays = month ? getDaysInHijriMonth(month) : 30;
  } else {
    // For Gregorian, use 31 as default (actual validation happens elsewhere)
    maxDays = 31;
  }
  
  return Array.from({ length: maxDays }, (_, i) => ({
    value: i + 1,
    label: String(i + 1),
  }));
}

/**
 * Get year options for a given calendar type
 * Returns a range of years centered around the current year
 */
export function getYearOptions(
  calendarType: CalendarType,
  currentHijri: HijriDate,
  currentGregorian: Date,
  range: number = 10
): Array<{ value: number; label: string }> {
  const currentYear = calendarType === 'hijri' 
    ? currentHijri.year 
    : currentGregorian.getFullYear();
  
  const startYear = currentYear - 2;
  const endYear = currentYear + range;
  
  return Array.from({ length: endYear - startYear + 1 }, (_, i) => ({
    value: startYear + i,
    label: String(startYear + i),
  }));
}

/**
 * Format a month/year pair for display
 */
export function formatMonthYear(
  month: number,
  year: number,
  calendarType: CalendarType
): string {
  const monthName = getMonthName(month, calendarType);
  return `${monthName} ${year}`;
}
