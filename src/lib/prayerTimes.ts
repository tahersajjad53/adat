/**
 * Prayer Times API Integration
 * 
 * Uses the Aladhan API to fetch accurate prayer times
 * with local caching for performance
 */

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
}

export interface PrayerTimesResponse {
  timings: PrayerTimes;
  date: {
    readable: string;
    timestamp: string;
    gregorian: {
      date: string;
      day: string;
      month: { number: number; en: string };
      year: string;
    };
    hijri: {
      date: string;
      day: string;
      month: { number: number; en: string; ar: string };
      year: string;
    };
  };
}

export interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  timezone?: string;
}

interface CachedPrayerTimes {
  date: string; // YYYY-MM-DD format
  location: { latitude: number; longitude: number };
  timings: PrayerTimes;
  fetchedAt: number;
}

const CACHE_KEY = 'adat_prayer_times_cache';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get cached prayer times from localStorage
 */
function getCachedPrayerTimes(date: string, location: Location): PrayerTimes | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CachedPrayerTimes = JSON.parse(cached);
    
    // Check if cache is valid
    const isSameDate = data.date === date;
    const isSameLocation = 
      Math.abs(data.location.latitude - location.latitude) < 0.01 &&
      Math.abs(data.location.longitude - location.longitude) < 0.01;
    const isNotExpired = Date.now() - data.fetchedAt < CACHE_DURATION_MS;

    if (isSameDate && isSameLocation && isNotExpired) {
      return data.timings;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Cache prayer times to localStorage
 */
function cachePrayerTimes(date: string, location: Location, timings: PrayerTimes): void {
  try {
    const data: CachedPrayerTimes = {
      date,
      location: { latitude: location.latitude, longitude: location.longitude },
      timings,
      fetchedAt: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

/**
 * Format date as DD-MM-YYYY for Aladhan API
 */
function formatDateForApi(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Format date as YYYY-MM-DD for cache key
 */
function formatDateForCache(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Fetch prayer times from Aladhan API
 * 
 * @param date - The date to fetch prayer times for
 * @param location - User's location (latitude, longitude)
 * @param method - Calculation method (default: 1 = Shia Ithna-Ashari)
 */
export async function fetchPrayerTimes(
  date: Date,
  location: Location,
  method: number = 1
): Promise<PrayerTimes> {
  const dateStr = formatDateForApi(date);
  const cacheKey = formatDateForCache(date);

  // Check cache first
  const cached = getCachedPrayerTimes(cacheKey, location);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const url = new URL('https://api.aladhan.com/v1/timings/' + dateStr);
  url.searchParams.set('latitude', location.latitude.toString());
  url.searchParams.set('longitude', location.longitude.toString());
  url.searchParams.set('method', method.toString());

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Failed to fetch prayer times: ${response.statusText}`);
  }

  const data = await response.json();
  const timings = data.data.timings as PrayerTimes;

  // Cache the result
  cachePrayerTimes(cacheKey, location, timings);

  return timings;
}

/**
 * Get just the Maghrib time for a given date and location
 */
export async function fetchMaghribTime(date: Date, location: Location): Promise<string> {
  const timings = await fetchPrayerTimes(date, location);
  // Remove any timezone info from the time string (e.g., "18:30 (PKT)" -> "18:30")
  return timings.Maghrib.split(' ')[0];
}

/**
 * Get the user's current location using browser geolocation
 */
export function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`Failed to get location: ${error.message}`));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  });
}

/**
 * Default location (Mecca) as fallback
 */
export const DEFAULT_LOCATION: Location = {
  latitude: 21.4225,
  longitude: 39.8262,
  city: 'Mecca',
  timezone: 'Asia/Riyadh',
};

/**
 * Clear the prayer times cache
 */
export function clearPrayerTimesCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // Silently fail
  }
}
