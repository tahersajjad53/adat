/**
 * Bohra/Misri Tabular Hijri Calendar Engine
 * 
 * Deterministic conversion between Gregorian and Dawoodi Bohra Hijri calendar
 * using Julian Day Number (JDN) as intermediary. Implements the Misri/Fatimid
 * calendar with Bohra-specific leap year cycle and Maghrib-based day transitions.
 */

// ─── Types ───────────────────────────────────────────────────────────

export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
  monthNameArabic: string;
}

export interface DualDate {
  gregorian: Date;
  hijri: HijriDate;              // The "current" Hijri (post-Maghrib if applicable)
  preMaghribHijri: HijriDate;    // Hijri date for daytime (Fajr/Zuhr/Asr)
  postMaghribHijri: HijriDate;   // Hijri date for evening (Maghrib/Isha/Nisful Layl)
  isAfterMaghrib: boolean;
}

// ─── Month Data ──────────────────────────────────────────────────────

const HIJRI_MONTHS = [
  { name: 'Moharram', arabic: 'محرم' },
  { name: 'Safar', arabic: 'صفر' },
  { name: 'Rabiul Awwal', arabic: 'ربيع الأول' },
  { name: 'Rabiul Akhar', arabic: 'ربيع الآخر' },
  { name: 'Jamadal Ula', arabic: 'جمادى الأولى' },
  { name: 'Jamadal Ukra', arabic: 'جمادى الآخرة' },
  { name: 'Rajab', arabic: 'رجب' },
  { name: 'Shaban Karim', arabic: 'شعبان' },
  { name: 'Ramadan', arabic: 'رمضان' },
  { name: 'Shawwal Mukarram', arabic: 'شوال' },
  { name: 'Zilqad', arabic: 'ذو القعدة' },
  { name: 'Zilhaj', arabic: 'ذو الحجة' },
] as const;

// Base month lengths: odd = 30, even = 29
const BASE_MONTH_DAYS = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29] as const;

// Bohra leap year positions within a 30-year cycle
const LEAP_YEAR_POSITIONS = [2, 5, 8, 10, 13, 16, 19, 21, 24, 27, 29] as const;

// Epoch: JDN for 1 Moharram 1 AH (evening of July 15, 622 CE Julian)
const HIJRI_EPOCH_JDN = 1948439;

// A 30-year Hijri cycle has exactly 10631 days (19 × 354 + 11 × 355)
const CYCLE_DAYS = 10631;
const CYCLE_YEARS = 30;
const NORMAL_YEAR_DAYS = 354;

// ─── Leap Year ───────────────────────────────────────────────────────

/**
 * Check if a Bohra Hijri year is a leap year.
 * Leap year formula: year mod 30, check against known positions.
 */
export function isBohraLeapYear(year: number): boolean {
  // Use the user's formula: remainder = year - round(year/30) * 30
  // This is equivalent to a signed modulo; normalize to 0..29
  const remainder = year - Math.round(year / 30) * 30;
  const normalized = ((remainder % 30) + 30) % 30;
  return (LEAP_YEAR_POSITIONS as readonly number[]).includes(normalized);
}

/**
 * Get the number of days in a Bohra Hijri month (1-indexed).
 * Zilhaj (month 12) has 30 days in leap years.
 */
export function getDaysInBohraMonth(month: number, year: number): number {
  if (month === 12 && isBohraLeapYear(year)) return 30;
  return BASE_MONTH_DAYS[month - 1];
}

/**
 * Get total days in a Bohra Hijri year.
 */
function getDaysInBohraYear(year: number): number {
  return isBohraLeapYear(year) ? 355 : 354;
}

// ─── JDN Conversion ──────────────────────────────────────────────────

/**
 * Convert Gregorian date to Julian Day Number.
 */
export function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/**
 * Convert Julian Day Number to Gregorian date components.
 */
export function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor(146097 * b / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor(1461 * d / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

/**
 * Convert a Bohra Hijri date to JDN.
 */
export function bohraToJDN(hijri: { year: number; month: number; day: number }): number {
  const { year, month, day } = hijri;

  // Count complete 30-year cycles
  const cycles = Math.floor((year - 1) / CYCLE_YEARS);
  const remainingYears = (year - 1) % CYCLE_YEARS;

  let jdn = HIJRI_EPOCH_JDN + cycles * CYCLE_DAYS;

  // Add days for each remaining complete year
  for (let y = 1; y <= remainingYears; y++) {
    const actualYear = cycles * CYCLE_YEARS + y;
    jdn += getDaysInBohraYear(actualYear);
  }

  // Add days for complete months in current year
  for (let m = 1; m < month; m++) {
    jdn += getDaysInBohraMonth(m, year);
  }

  // Add remaining days (day 1 = epoch day, so subtract 1)
  jdn += day - 1;

  return jdn;
}

/**
 * Convert JDN to Bohra Hijri date.
 */
export function jdnToBohra(jdn: number): HijriDate {
  // Days since epoch
  let remaining = jdn - HIJRI_EPOCH_JDN;

  if (remaining < 0) {
    // Before epoch - return 1/1/1 as fallback
    return makeHijriDate(1, 1, 1);
  }

  // Count complete 30-year cycles
  const cycles = Math.floor(remaining / CYCLE_DAYS);
  remaining -= cycles * CYCLE_DAYS;

  // Find year within cycle
  let year = cycles * CYCLE_YEARS + 1;
  while (remaining >= getDaysInBohraYear(year)) {
    remaining -= getDaysInBohraYear(year);
    year++;
  }

  // Find month
  let month = 1;
  while (month < 12 && remaining >= getDaysInBohraMonth(month, year)) {
    remaining -= getDaysInBohraMonth(month, year);
    month++;
  }

  const day = remaining + 1;

  return makeHijriDate(day, month, year);
}

// ─── Gregorian ↔ Bohra Hijri ─────────────────────────────────────────

/**
 * Convert a Gregorian Date to Bohra Hijri date.
 * This is the PRIMARY conversion function used throughout the app.
 * 
 * @param date - Gregorian Date object
 * @param timezone - Optional IANA timezone string (used to determine the correct Gregorian day)
 */
export function gregorianToBohra(date: Date, timezone?: string): HijriDate {
  let year: number, month: number, day: number;

  if (timezone) {
    // Extract date components in user's timezone
    const fmt = new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'numeric', day: 'numeric',
      timeZone: timezone,
    });
    const parts = fmt.formatToParts(date);
    year = parseInt(parts.find(p => p.type === 'year')!.value);
    month = parseInt(parts.find(p => p.type === 'month')!.value);
    day = parseInt(parts.find(p => p.type === 'day')!.value);
  } else {
    year = date.getFullYear();
    month = date.getMonth() + 1;
    day = date.getDate();
  }

  const jdn = gregorianToJDN(year, month, day);
  return jdnToBohra(jdn);
}

// ─── Day Advancement (leap-year aware) ───────────────────────────────

/**
 * Advance a Hijri date by 1 day, handling month/year rollovers.
 * Correctly handles leap years (Zilhaj 30 only exists in leap years).
 */
export function advanceHijriDay(hijri: HijriDate): HijriDate {
  const daysInMonth = getDaysInBohraMonth(hijri.month, hijri.year);

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

  return makeHijriDate(newDay, newMonth, newYear);
}

// ─── Maghrib Time Check ──────────────────────────────────────────────

/**
 * Check if current time is after Maghrib.
 */
export function isAfterMaghrib(
  currentTime: Date,
  maghribTime: string,
  timezone?: string
): boolean {
  const [hours, minutes] = maghribTime.split(':').map(Number);

  let currentHours: number;
  let currentMinutes: number;

  if (timezone) {
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
    currentHours = currentTime.getHours();
    currentMinutes = currentTime.getMinutes();
  }

  const currentTotalMinutes = currentHours * 60 + currentMinutes;

  // After Maghrib on the same evening
  if (currentTotalMinutes >= hours * 60 + minutes) return true;

  // Past midnight but before day reset (4 AM) -- still "after Maghrib"
  if (currentHours < 4) return true;

  return false;
}

// ─── Adjusted Date (with Maghrib rule) ───────────────────────────────

/**
 * Get the adjusted Hijri date based on Maghrib time.
 * Returns both pre-Maghrib and post-Maghrib Hijri dates.
 */
export function getAdjustedHijriDate(
  currentTime: Date,
  maghribTime: string | null,
  timezone?: string
): DualDate {
  const afterMaghrib = maghribTime
    ? isAfterMaghrib(currentTime, maghribTime, timezone)
    : false;

  // If past midnight but still "after Maghrib", use previous Gregorian day
  let baseDate = currentTime;
  if (afterMaghrib) {
    let currentHour: number;
    if (timezone) {
      const fmt = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric', hour12: false, timeZone: timezone,
      });
      const parts = fmt.formatToParts(currentTime);
      currentHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
    } else {
      currentHour = currentTime.getHours();
    }
    if (currentHour < 4) {
      baseDate = new Date(currentTime);
      baseDate.setDate(baseDate.getDate() - 1);
    }
  }

  const preMaghribHijri = gregorianToBohra(baseDate, timezone);
  const postMaghribHijri = advanceHijriDay(preMaghribHijri);

  return {
    gregorian: currentTime,
    hijri: afterMaghrib ? postMaghribHijri : preMaghribHijri,
    preMaghribHijri,
    postMaghribHijri,
    isAfterMaghrib: afterMaghrib,
  };
}

// ─── Helper: build HijriDate with month names ───────────────────────

function makeHijriDate(day: number, month: number, year: number): HijriDate {
  return {
    day,
    month,
    year,
    monthName: HIJRI_MONTHS[month - 1]?.name || '',
    monthNameArabic: HIJRI_MONTHS[month - 1]?.arabic || '',
  };
}

// ─── Formatting ──────────────────────────────────────────────────────

/**
 * Format a Hijri date as a string.
 */
export function formatHijriDate(
  hijriDate: HijriDate,
  format: 'short' | 'long' | 'arabic' = 'long'
): string {
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
 * Format a Hijri date as YYYY-MM-DD storage key.
 */
export function formatHijriDateKey(hijri: HijriDate): string {
  return `${hijri.year}-${String(hijri.month).padStart(2, '0')}-${String(hijri.day).padStart(2, '0')}`;
}

/**
 * Format a Gregorian date nicely.
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

// ─── Month Utilities ─────────────────────────────────────────────────

/**
 * Get the Hijri month name by number (1-12).
 */
export function getHijriMonthName(month: number, arabic: boolean = false): string {
  const monthData = HIJRI_MONTHS[month - 1];
  return arabic ? monthData?.arabic || '' : monthData?.name || '';
}

/**
 * Get all Hijri month names.
 */
export function getAllHijriMonths(): typeof HIJRI_MONTHS {
  return HIJRI_MONTHS;
}
