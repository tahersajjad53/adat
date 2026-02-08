/**
 * Calendar Utilities for Dues Module
 * 
 * Provides dual calendar support (Hijri and Gregorian) for reminder calculations
 */

import { HijriDate, getHijriMonthName, getDaysInBohraMonth } from './hijri';
import type { CalendarType, ReminderType } from '@/types/dues';

// Gregorian month names
const GREGORIAN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const;

/**
 * Get the number of days in a Hijri month (Bohra calendar, leap-year aware).
 * @param month - 1-indexed Hijri month
 * @param year - Hijri year (needed for Zilhaj leap year check)
 */
export function getDaysInHijriMonth(month: number, year: number = 1446): number {
  return getDaysInBohraMonth(month, year);
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
  const totalDays = getDaysInHijriMonth(currentHijri.month, currentHijri.year);
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
    const totalDays = getDaysInHijriMonth(currentHijri.month, currentHijri.year);
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
      { value: 1, label: 'Moharram' },
      { value: 2, label: 'Safar' },
      { value: 3, label: 'Rabiul Awwal' },
      { value: 4, label: 'Rabiul Akhar' },
      { value: 5, label: 'Jamadal Ula' },
      { value: 6, label: 'Jamadal Ukra' },
      { value: 7, label: 'Rajab' },
      { value: 8, label: 'Shaban Karim' },
      { value: 9, label: 'Ramadan' },
      { value: 10, label: 'Shawwal Mukarram' },
      { value: 11, label: 'Zilqad' },
      { value: 12, label: 'Zilhaj' },
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
    maxDays = month ? getDaysInHijriMonth(month) : 30; // year unknown here, default OK
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

/**
 * Get the current period (month/year) based on calendar type
 */
export function getCurrentPeriod(
  calendarType: CalendarType,
  currentHijri: HijriDate,
  currentGregorian: Date
): { month: number; year: number } {
  if (calendarType === 'hijri') {
    return { month: currentHijri.month, year: currentHijri.year };
  }
  return { 
    month: currentGregorian.getMonth() + 1, 
    year: currentGregorian.getFullYear() 
  };
}

/**
 * Format due date with Hijri context for Gregorian calendar types
 * Hijri: "30 Shaban"
 * Gregorian: "Feb 25 (7 Shaban)"
 */
export function formatDueDateWithContext(
  calendarType: CalendarType,
  dueDay: number,
  currentHijri: HijriDate,
  currentGregorian: Date
): string {
  if (calendarType === 'hijri') {
    return `${dueDay} ${getHijriMonthName(currentHijri.month)}`;
  }
  // Gregorian with Hijri context
  const gregorianMonth = GREGORIAN_MONTHS[currentGregorian.getMonth()];
  const hijriContext = `${currentHijri.day} ${getHijriMonthName(currentHijri.month)}`;
  return `${gregorianMonth} ${dueDay} (${hijriContext})`;
}

/**
 * Check if a due is within its active date range
 */
export function isDueInActiveRange(
  calendarType: CalendarType,
  startMonth: number,
  startYear: number,
  endMonth: number | null | undefined,
  endYear: number | null | undefined,
  currentHijri: HijriDate,
  currentGregorian: Date
): boolean {
  const { month: currentMonth, year: currentYear } = getCurrentPeriod(
    calendarType,
    currentHijri,
    currentGregorian
  );

  // Check if current is after or at start
  const afterStart = 
    currentYear > startYear || 
    (currentYear === startYear && currentMonth >= startMonth);

  // If no end date, always active after start
  if (!endMonth || !endYear) {
    return afterStart;
  }

  // Check if current is before or at end
  const beforeEnd = 
    currentYear < endYear || 
    (currentYear === endYear && currentMonth <= endMonth);

  return afterStart && beforeEnd;
}
