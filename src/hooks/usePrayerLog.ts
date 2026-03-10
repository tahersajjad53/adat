import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCalendar } from '@/contexts/CalendarContext';
import { supabase } from '@/integrations/supabase/client';
import { HijriDate, formatHijriDateKey } from '@/lib/hijri';
import { usePrayerTimes, PrayerName, AllPrayerName, ALL_PRAYER_ORDER, PRAYER_ORDER, OPTIONAL_PRAYERS, getPrayerStatus, PRAYER_DISPLAY_NAMES } from './usePrayerTimes';

/**
 * Get the prayer time window (start/end) for a given prayer.
 */
function getPrayerWindow(prayer: AllPrayerName, times: Record<AllPrayerName, string>): { start: string; end: string } {
  if (prayer === 'nisfulLayl') return { start: times.nisfulLayl, end: times.fajr };
  const idx = PRAYER_ORDER.indexOf(prayer as PrayerName);
  const start = times[prayer];
  const end = idx < PRAYER_ORDER.length - 1 ? times[PRAYER_ORDER[idx + 1]] : '23:59';
  return { start, end };
}

export interface PrayerStatus {
  name: AllPrayerName;
  displayName: string;
  time: string;
  isCompleted: boolean;
  completedAt: Date | null;
  status: 'upcoming' | 'current' | 'completed' | 'missed';
  isOptional: boolean;
  /** The Hijri date this prayer belongs to */
  hijriDate: HijriDate | null;
}

interface UsePrayerLogReturn {
  prayers: PrayerStatus[];
  togglePrayer: (prayer: AllPrayerName) => Promise<void>;
  completedCount: number;
  totalCount: number;
  percentage: number;
  isLoading: boolean;
  currentPrayer: PrayerStatus | null;
  nextPrayer: PrayerStatus | null;
}

/**
 * Prayers that belong to the post-Maghrib Hijri date.
 * All others belong to the pre-Maghrib Hijri date.
 */
const POST_MAGHRIB_PRAYERS: AllPrayerName[] = ['maghrib', 'isha'];

/**
 * Get the correct Hijri date for a specific prayer.
 */
function getHijriDateForPrayer(
  prayer: AllPrayerName,
  preMaghrib: HijriDate,
  postMaghrib: HijriDate
): HijriDate {
  return POST_MAGHRIB_PRAYERS.includes(prayer) ? postMaghrib : preMaghrib;
}

/**
 * Hook to manage prayer completion state for today.
 * 
 * Each prayer is tracked against the Gregorian day (primary key for fetching)
 * and stored with its correct per-prayer Hijri date:
 * - Fajr, Zuhr, Asr → preMaghribHijri
 * - Maghrib, Isha, Nisful Layl → postMaghribHijri
 */
export function usePrayerLog(): UsePrayerLogReturn {
  const { user } = useAuth();
  const { currentDate } = useCalendar();
  const { location } = useCalendar();
  const { prayerTimes, allPrayerTimes, isLoading: timesLoading } = usePrayerTimes();
  
  const [completedPrayers, setCompletedPrayers] = useState<Map<AllPrayerName, Date>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Compute effective Gregorian date: if after midnight but before 4 AM,
  // we're still in the previous evening's "day" for prayer tracking.
  const gregorianDate = useMemo(() => {
    if (!currentDate) return null;
    const greg = currentDate.gregorian;

    // Format as YYYY-MM-DD in local timezone (not UTC)
    const tz = location?.timezone;
    if (tz) {
      const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz }); // en-CA gives YYYY-MM-DD
      return fmt.format(greg);
    }
    // Fallback: local timezone
    const y = greg.getFullYear();
    const m = String(greg.getMonth() + 1).padStart(2, '0');
    const d = String(greg.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [currentDate, location?.timezone]);

  // Fetch today's prayer logs by Gregorian date
  useEffect(() => {
    const fetchTodaysPrayers = async () => {
      if (!user || !gregorianDate) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('prayer_logs')
          .select('prayer, completed_at')
          .eq('user_id', user.id)
          .eq('gregorian_date', gregorianDate)
          .not('completed_at', 'is', null);

        if (error) throw error;

        const completed = new Map<AllPrayerName, Date>();
        data?.forEach((log) => {
          if (log.completed_at) {
            completed.set(log.prayer as AllPrayerName, new Date(log.completed_at));
          }
        });
        setCompletedPrayers(completed);
      } catch (err) {
        console.error('Error fetching prayer logs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodaysPrayers();
  }, [user, gregorianDate]);

  // Toggle prayer completion
  const togglePrayer = useCallback(async (prayer: AllPrayerName) => {
    if (!user || !gregorianDate || !currentDate) return;

    const hijriForPrayer = getHijriDateForPrayer(
      prayer,
      currentDate.preMaghribHijri,
      currentDate.postMaghribHijri
    );
    const prayerDateKey = formatHijriDateKey(hijriForPrayer);
    const isCurrentlyCompleted = completedPrayers.has(prayer);

    try {
      if (isCurrentlyCompleted) {
        // Remove completion - match by gregorian_date + prayer (unique per Gregorian day)
        await supabase
          .from('prayer_logs')
          .delete()
          .eq('user_id', user.id)
          .eq('gregorian_date', gregorianDate)
          .eq('prayer', prayer);

        setCompletedPrayers((prev) => {
          const next = new Map(prev);
          next.delete(prayer);
          return next;
        });
      } else {
        // Mark as completed with per-prayer Hijri date and time window
        const now = new Date();
        const window = allPrayerTimes ? getPrayerWindow(prayer, allPrayerTimes) : null;
        await supabase
          .from('prayer_logs')
          .upsert({
            user_id: user.id,
            prayer_date: prayerDateKey,
            prayer,
            completed_at: now.toISOString(),
            gregorian_date: gregorianDate,
            ...(window && {
              prayer_window_start: window.start,
              prayer_window_end: window.end,
            }),
          }, {
            onConflict: 'user_id,prayer_date,prayer',
          });

        setCompletedPrayers((prev) => {
          const next = new Map(prev);
          next.set(prayer, now);
          return next;
        });
      }
    } catch (err) {
      console.error('Error toggling prayer:', err);
    }
  }, [user, gregorianDate, currentDate, completedPrayers]);

  // Build prayers list with status
  const prayers: PrayerStatus[] = ALL_PRAYER_ORDER.map((name) => {
    const isCompleted = completedPrayers.has(name);
    const time = allPrayerTimes?.[name] || '--:--';
    const isOptional = OPTIONAL_PRAYERS.includes(name as any);
    
    let status: PrayerStatus['status'];
    if (isOptional) {
      status = isCompleted ? 'completed' : 'upcoming';
    } else {
      status = prayerTimes 
        ? getPrayerStatus(name as PrayerName, prayerTimes, isCompleted)
        : 'upcoming';
    }

    const hijriDate = currentDate
      ? getHijriDateForPrayer(name, currentDate.preMaghribHijri, currentDate.postMaghribHijri)
      : null;

    return {
      name,
      displayName: PRAYER_DISPLAY_NAMES[name],
      time,
      isCompleted,
      completedAt: completedPrayers.get(name) || null,
      status,
      isOptional,
      hijriDate,
    };
  });

  // Find current and next prayer (only from required prayers)
  const requiredPrayers = prayers.filter(p => !p.isOptional);
  const currentPrayer = requiredPrayers.find((p) => p.status === 'current') || null;
  const nextPrayer = requiredPrayers.find((p) => p.status === 'upcoming') || null;

  // Only count required prayers for percentage
  const completedRequired = prayers.filter(p => !p.isOptional && p.isCompleted).length;
  const totalCount = 5;
  const percentage = Math.round((completedRequired / totalCount) * 100);

  return {
    prayers,
    togglePrayer,
    completedCount: completedRequired,
    totalCount,
    percentage,
    isLoading: isLoading || timesLoading,
    currentPrayer,
    nextPrayer,
  };
}
