/**
 * Hijri Calendar Utilities
 * 
 * Provides conversion between Gregorian and Hijri calendars
 * with special handling for Maghrib-based day transitions
 * (used by Dawoodi Bohra community)
 */

export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
  monthNameArabic: string;
}

export interface DualDate {
  gregorian: Date;
  hijri: HijriDate;
  isAfterMaghrib: boolean;
}

// Hijri month names - transliterated and Arabic
const HIJRI_MONTHS = [
  { name: 'Muharram', arabic: 'محرم' },
  { name: 'Safar', arabic: 'صفر' },
  { name: 'Rabi al-Awwal', arabic: 'ربيع الأول' },
  { name: 'Rabi al-Thani', arabic: 'ربيع الآخر' },
  { name: 'Jumada al-Awwal', arabic: 'جمادى الأولى' },
  { name: 'Jumada al-Thani', arabic: 'جمادى الآخرة' },
  { name: 'Rajab', arabic: 'رجب' },
  { name: 'Shaban', arabic: 'شعبان' },
  { name: 'Ramadan', arabic: 'رمضان' },
  { name: 'Shawwal', arabic: 'شوال' },
  { name: 'Dhul Qadah', arabic: 'ذو القعدة' },
  { name: 'Dhul Hijjah', arabic: 'ذو الحجة' },
] as const;

/**
 * Convert a Gregorian date to Hijri using the native Intl API
 * @param date - The Gregorian date to convert
 * @param timezone - Optional IANA timezone for accurate date interpretation
 */
export function gregorianToHijri(date: Date, timezone?: string): HijriDate {
  // Use Intl.DateTimeFormat with islamic-umalqura calendar for accurate conversion
  // Only pass timeZone if it's a valid, non-empty string
  const formatOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  };
  
  if (timezone && timezone.trim()) {
    formatOptions.timeZone = timezone.trim();
  }
  
  const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', formatOptions);

  const parts = formatter.formatToParts(date);
  
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '1', 10);
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10);
  const year = parseInt(parts.find(p => p.type === 'year')?.value || '1446', 10);

  return {
    day,
    month,
    year,
    monthName: HIJRI_MONTHS[month - 1]?.name || '',
    monthNameArabic: HIJRI_MONTHS[month - 1]?.arabic || '',
  };
}

/**
 * Advance a Hijri date by 1 day, handling month/year rollovers
 * Used for Bohra sunset rule: Islamic day begins at Maghrib
 */
function advanceHijriDay(hijri: HijriDate): HijriDate {
  // Hijri months alternate between 30 and 29 days
  // Odd months (1,3,5,7,9,11) = 30 days
  // Even months (2,4,6,8,10,12) = 29 days (Dhul Hijjah can be 30 in leap years)
  const daysInMonth = hijri.month % 2 === 1 ? 30 : 29;
  
  let newDay = hijri.day + 1;
  let newMonth = hijri.month;
  let newYear = hijri.year;
  
  if (newDay > daysInMonth) {
    newDay = 1;
    newMonth += 1;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
  }
  
  return {
    day: newDay,
    month: newMonth,
    year: newYear,
    monthName: HIJRI_MONTHS[newMonth - 1]?.name || '',
    monthNameArabic: HIJRI_MONTHS[newMonth - 1]?.arabic || '',
  };
}

/**
 * Check if current time is after Maghrib
 * @param currentTime - Current time as Date
 * @param maghribTime - Maghrib time as "HH:MM" string (24-hour format)
 * @param timezone - Optional IANA timezone string (e.g., "Asia/Colombo")
 */
export function isAfterMaghrib(
  currentTime: Date, 
  maghribTime: string,
  timezone?: string
): boolean {
  const [hours, minutes] = maghribTime.split(':').map(Number);
  
  // Get current time in user's timezone
  let currentHours: number;
  let currentMinutes: number;
  
  if (timezone) {
    // Use Intl to get time in user's timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      timeZone: timezone,
    });
    const parts = formatter.formatToParts(currentTime);
    currentHours = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
    currentMinutes = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
  } else {
    // Fallback to browser's local time
    currentHours = currentTime.getHours();
    currentMinutes = currentTime.getMinutes();
  }
  
  const currentTotalMinutes = currentHours * 60 + currentMinutes;
  const maghribTotalMinutes = hours * 60 + minutes;
  
  return currentTotalMinutes >= maghribTotalMinutes;
}

/**
 * Get the adjusted Hijri date based on Maghrib time
 * If current time is after Maghrib, the Hijri date advances by 1 day
 * 
 * This implements the Bohra sunset rule: the Islamic day begins at Maghrib,
 * not at midnight. Instead of relying on Intl's calendar for +1 day,
 * we manually increment the Hijri date to ensure consistent advancement.
 * 
 * @param currentTime - Current local time
 * @param maghribTime - Maghrib time as "HH:MM" string (24-hour format)
 * @param timezone - Optional IANA timezone string for accurate comparison
 */
export function getAdjustedHijriDate(
  currentTime: Date, 
  maghribTime: string | null,
  timezone?: string
): DualDate {
  const afterMaghrib = maghribTime 
    ? isAfterMaghrib(currentTime, maghribTime, timezone) 
    : false;
  
  // Get base Hijri date for the current moment (no +24h adjustment)
  let hijri = gregorianToHijri(currentTime, timezone);
  
  // Bohra sunset rule: If after Maghrib, the Islamic day advances
  // Manually increment the Hijri day by 1 (handles month/year rollovers)
  if (afterMaghrib) {
    hijri = advanceHijriDay(hijri);
  }
  
  return {
    gregorian: currentTime,
    hijri,
    isAfterMaghrib: afterMaghrib,
  };
}

/**
 * Format a Hijri date as a string
 * @param hijriDate - The Hijri date object
 * @param format - 'short' | 'long' | 'arabic'
 */
export function formatHijriDate(hijriDate: HijriDate, format: 'short' | 'long' | 'arabic' = 'long'): string {
  switch (format) {
    case 'short':
      return `${hijriDate.day}/${hijriDate.month}/${hijriDate.year}`;
    case 'arabic':
      return `${hijriDate.day} ${hijriDate.monthNameArabic} ${hijriDate.year}`;
    case 'long':
    default:
      return `${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year}`;
  }
}

/**
 * Format a Gregorian date nicely
 */
export function formatGregorianDate(date: Date, format: 'short' | 'long' = 'long'): string {
  if (format === 'short') {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get the Hijri month name by number (1-12)
 */
export function getHijriMonthName(month: number, arabic: boolean = false): string {
  const monthData = HIJRI_MONTHS[month - 1];
  return arabic ? monthData?.arabic || '' : monthData?.name || '';
}

/**
 * Get all Hijri month names
 */
export function getAllHijriMonths(): typeof HIJRI_MONTHS {
  return HIJRI_MONTHS;
}
