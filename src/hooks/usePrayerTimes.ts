import { useState, useEffect } from 'react';
import { useCalendar } from '@/contexts/CalendarContext';
import { fetchPrayerTimes, PrayerTimes } from '@/lib/prayerTimes';

export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export type OptionalPrayerName = 'nisfulLayl';
export type AllPrayerName = PrayerName | OptionalPrayerName;

export const PRAYER_DISPLAY_NAMES: Record<AllPrayerName, string> = {
  fajr: 'Fajr',
  dhuhr: 'Zuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
  nisfulLayl: 'Nisful Layl',
};

export const PRAYER_ORDER: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
export const OPTIONAL_PRAYERS: OptionalPrayerName[] = ['nisfulLayl'];
export const ALL_PRAYER_ORDER: AllPrayerName[] = [...PRAYER_ORDER, ...OPTIONAL_PRAYERS];

interface UsePrayerTimesReturn {
  prayerTimes: Record<PrayerName, string> | null;
  allPrayerTimes: Record<AllPrayerName, string> | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Parse time string "HH:MM" to minutes since midnight
 */
export function parseTimeToMinutes(timeStr: string): number {
  const cleanTime = timeStr.split(' ')[0]; // Remove timezone info like "(PKT)"
  const [hours, minutes] = cleanTime.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Get the current prayer window based on time
 */
export function getCurrentPrayerWindow(
  times: Record<PrayerName, string>
): { current: PrayerName | null; next: PrayerName | null } {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Find which prayer window we're in
  for (let i = PRAYER_ORDER.length - 1; i >= 0; i--) {
    const prayer = PRAYER_ORDER[i];
    const prayerMinutes = parseTimeToMinutes(times[prayer]);
    
    if (currentMinutes >= prayerMinutes) {
      const next = i < PRAYER_ORDER.length - 1 ? PRAYER_ORDER[i + 1] : null;
      return { current: prayer, next };
    }
  }

  // Before Fajr
  return { current: null, next: 'fajr' };
}

/**
 * Get the status of a prayer based on current time
 */
export function getPrayerStatus(
  prayer: PrayerName,
  times: Record<PrayerName, string>,
  isCompleted: boolean
): 'upcoming' | 'current' | 'completed' | 'missed' {
  if (isCompleted) return 'completed';

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const prayerIndex = PRAYER_ORDER.indexOf(prayer);
  const prayerMinutes = parseTimeToMinutes(times[prayer]);

  // Before this prayer's time
  if (currentMinutes < prayerMinutes) return 'upcoming';

  // Check if we're in this prayer's window (before next prayer)
  const nextPrayer = PRAYER_ORDER[prayerIndex + 1];
  if (nextPrayer) {
    const nextMinutes = parseTimeToMinutes(times[nextPrayer]);
    if (currentMinutes < nextMinutes) return 'current';
  } else {
    // Isha - current until midnight (or next Fajr)
    return 'current';
  }

  return 'missed';
}

/**
 * Hook to fetch prayer times for today based on user's location
 */
export function usePrayerTimes(): UsePrayerTimesReturn {
  const { location } = useCalendar();
  const [prayerTimes, setPrayerTimes] = useState<Record<PrayerName, string> | null>(null);
  const [allPrayerTimes, setAllPrayerTimes] = useState<Record<AllPrayerName, string> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadPrayerTimes = async () => {
      if (!location) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const times = await fetchPrayerTimes(new Date(), location);
        
        // Extract just the 5 daily prayers and clean up time strings
        const requiredTimes: Record<PrayerName, string> = {
          fajr: times.Fajr.split(' ')[0],
          dhuhr: times.Dhuhr.split(' ')[0],
          asr: times.Asr.split(' ')[0],
          maghrib: times.Maghrib.split(' ')[0],
          isha: times.Isha.split(' ')[0],
        };
        setPrayerTimes(requiredTimes);
        
        // Include optional prayers (Nisful Layl uses Midnight from API)
        setAllPrayerTimes({
          ...requiredTimes,
          nisfulLayl: times.Midnight.split(' ')[0],
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch prayer times'));
      } finally {
        setIsLoading(false);
      }
    };

    loadPrayerTimes();
  }, [location, refreshKey]);

  const refetch = () => setRefreshKey((k) => k + 1);

  return { prayerTimes, allPrayerTimes, isLoading, error, refetch };
}
