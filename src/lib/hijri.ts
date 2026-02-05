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
  const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: timezone,
  });

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
  
  // If after Maghrib, we need to add 1 day to get the "Islamic day"
  let dateForConversion = currentTime;
  if (afterMaghrib) {
    dateForConversion = new Date(currentTime);
    dateForConversion.setDate(dateForConversion.getDate() + 1);
  }
  
  const hijri = gregorianToHijri(dateForConversion, timezone);
  
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
