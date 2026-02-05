import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCalendar } from '@/contexts/CalendarContext';
import { supabase } from '@/integrations/supabase/client';
import { usePrayerTimes, PrayerName, AllPrayerName, PRAYER_ORDER, ALL_PRAYER_ORDER, OPTIONAL_PRAYERS, getPrayerStatus, PRAYER_DISPLAY_NAMES } from './usePrayerTimes';

export interface PrayerStatus {
  name: AllPrayerName;
  displayName: string;
  time: string;
  isCompleted: boolean;
  completedAt: Date | null;
  status: 'upcoming' | 'current' | 'completed' | 'missed';
  isOptional: boolean;
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
  const { prayerTimes, allPrayerTimes, isLoading: timesLoading } = usePrayerTimes();
  
  const [completedPrayers, setCompletedPrayers] = useState<Map<AllPrayerName, Date>>(new Map());
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
  }, [user, dateKey]);

  // Toggle prayer completion
  const togglePrayer = useCallback(async (prayer: AllPrayerName) => {
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

  // Build prayers list with status (all prayers including optional)
  const prayers: PrayerStatus[] = ALL_PRAYER_ORDER.map((name) => {
    const isCompleted = completedPrayers.has(name);
    const time = allPrayerTimes?.[name] || '--:--';
    const isOptional = OPTIONAL_PRAYERS.includes(name as any);
    
    // For optional prayers, use a simpler status calculation
    let status: PrayerStatus['status'];
    if (isOptional) {
      status = isCompleted ? 'completed' : 'upcoming';
    } else {
      status = prayerTimes 
        ? getPrayerStatus(name as PrayerName, prayerTimes, isCompleted)
        : 'upcoming';
    }

    return {
      name,
      displayName: PRAYER_DISPLAY_NAMES[name],
      time,
      isCompleted,
      completedAt: completedPrayers.get(name) || null,
      status,
      isOptional,
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
