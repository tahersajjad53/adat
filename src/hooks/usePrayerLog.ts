import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCalendar } from '@/contexts/CalendarContext';
import { supabase } from '@/integrations/supabase/client';
import { usePrayerTimes, PrayerName, PRAYER_ORDER, getPrayerStatus, PRAYER_DISPLAY_NAMES } from './usePrayerTimes';

export interface PrayerStatus {
  name: PrayerName;
  displayName: string;
  time: string;
  isCompleted: boolean;
  completedAt: Date | null;
  status: 'upcoming' | 'current' | 'completed' | 'missed';
}

interface UsePrayerLogReturn {
  prayers: PrayerStatus[];
  togglePrayer: (prayer: PrayerName) => Promise<void>;
  completedCount: number;
  totalCount: number;
  percentage: number;
  isLoading: boolean;
  currentPrayer: PrayerStatus | null;
  nextPrayer: PrayerStatus | null;
}

/**
 * Format Hijri date as storage key (YYYY-MM-DD)
 */
function getHijriDateKey(hijri: { year: number; month: number; day: number }): string {
  return `${hijri.year}-${String(hijri.month).padStart(2, '0')}-${String(hijri.day).padStart(2, '0')}`;
}

/**
 * Hook to manage prayer completion state for today
 */
export function usePrayerLog(): UsePrayerLogReturn {
  const { user } = useAuth();
  const { currentDate } = useCalendar();
  const { prayerTimes, isLoading: timesLoading } = usePrayerTimes();
  
  const [completedPrayers, setCompletedPrayers] = useState<Map<PrayerName, Date>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Get the Hijri date key for today
  const dateKey = currentDate ? getHijriDateKey(currentDate.hijri) : null;
  const gregorianDate = currentDate?.gregorian ? currentDate.gregorian.toISOString().split('T')[0] : null;

  // Fetch today's prayer logs
  useEffect(() => {
    const fetchTodaysPrayers = async () => {
      if (!user || !dateKey) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('prayer_logs')
          .select('prayer, completed_at')
          .eq('user_id', user.id)
          .eq('prayer_date', dateKey)
          .not('completed_at', 'is', null);

        if (error) throw error;

        const completed = new Map<PrayerName, Date>();
        data?.forEach((log) => {
          if (log.completed_at) {
            completed.set(log.prayer as PrayerName, new Date(log.completed_at));
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
  }, [user, dateKey]);

  // Toggle prayer completion
  const togglePrayer = useCallback(async (prayer: PrayerName) => {
    if (!user || !dateKey || !gregorianDate) return;

    const isCurrentlyCompleted = completedPrayers.has(prayer);

    try {
      if (isCurrentlyCompleted) {
        // Remove completion
        await supabase
          .from('prayer_logs')
          .delete()
          .eq('user_id', user.id)
          .eq('prayer_date', dateKey)
          .eq('prayer', prayer);

        setCompletedPrayers((prev) => {
          const next = new Map(prev);
          next.delete(prayer);
          return next;
        });
      } else {
        // Mark as completed
        const now = new Date();
        await supabase
          .from('prayer_logs')
          .upsert({
            user_id: user.id,
            prayer_date: dateKey,
            prayer,
            completed_at: now.toISOString(),
            gregorian_date: gregorianDate,
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
  }, [user, dateKey, gregorianDate, completedPrayers]);

  // Build prayers list with status
  const prayers: PrayerStatus[] = PRAYER_ORDER.map((name) => {
    const isCompleted = completedPrayers.has(name);
    const time = prayerTimes?.[name] || '--:--';
    const status = prayerTimes 
      ? getPrayerStatus(name, prayerTimes, isCompleted)
      : 'upcoming';

    return {
      name,
      displayName: PRAYER_DISPLAY_NAMES[name],
      time,
      isCompleted,
      completedAt: completedPrayers.get(name) || null,
      status,
    };
  });

  // Find current and next prayer
  const currentPrayer = prayers.find((p) => p.status === 'current') || null;
  const nextPrayer = prayers.find((p) => p.status === 'upcoming') || null;

  const completedCount = completedPrayers.size;
  const totalCount = 5;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return {
    prayers,
    togglePrayer,
    completedCount,
    totalCount,
    percentage,
    isLoading: isLoading || timesLoading,
    currentPrayer,
    nextPrayer,
  };
}
