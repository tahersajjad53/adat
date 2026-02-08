import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { HijriDate, gregorianToBohra, advanceHijriDay, formatHijriDate, formatHijriDateKey } from '@/lib/hijri';
import { PrayerName, PRAYER_DISPLAY_NAMES } from './usePrayerTimes';

export interface MissedPrayer {
  id: string;
  prayer: PrayerName;
  prayerDate: string; // Hijri date key YYYY-MM-DD
  gregorianDate: Date;
  hijriDate: HijriDate;
  hijriDisplay: string;
  gregorianDisplay: string;
  displayName: string;
  qazaCompletedAt: Date | null;
  isFulfilled: boolean;
}

interface UseMissedPrayersReturn {
  missedPrayers: MissedPrayer[];
  unfulfilledCount: number;
  fulfillPrayer: (prayerId: string) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch and manage missed prayers (prayers not completed on time)
 */
export function useMissedPrayers(): UseMissedPrayersReturn {
  const { user } = useAuth();
  const [missedPrayers, setMissedPrayers] = useState<MissedPrayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch missed prayers from database
  useEffect(() => {
    const fetchMissedPrayers = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // First get user's profile created_at date
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('created_at')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        // If no profile or no created_at, user just joined - no missed prayers yet
        if (!profile?.created_at) {
          setMissedPrayers([]);
          setIsLoading(false);
          return;
        }

        const startDate = new Date(profile.created_at);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(23, 59, 59, 999);

        // Get all prayer logs (including qaza completed ones) for the date range
        const { data: prayerLogs, error: logsError } = await supabase
          .from('prayer_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('gregorian_date', startDate.toISOString().split('T')[0])
          .lte('gregorian_date', yesterday.toISOString().split('T')[0]);

        if (logsError) throw logsError;

        // Build a map of completed prayers
        const completedMap = new Map<string, { completedAt: Date | null; qazaAt: Date | null; id: string }>();
        prayerLogs?.forEach((log) => {
          const key = `${log.prayer_date}-${log.prayer}`;
          completedMap.set(key, {
            completedAt: log.completed_at ? new Date(log.completed_at) : null,
            qazaAt: log.qaza_completed_at ? new Date(log.qaza_completed_at) : null,
            id: log.id,
          });
        });

        // Generate all expected prayers from start date to yesterday
        const missed: MissedPrayer[] = [];
        const prayers: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        const POST_MAGHRIB: PrayerName[] = ['maghrib', 'isha'];
        
        const currentDate = new Date(startDate);
        currentDate.setHours(12, 0, 0, 0); // Noon to avoid timezone issues

        while (currentDate <= yesterday) {
          const preMaghribHijri = gregorianToBohra(currentDate);
          const postMaghribHijri = advanceHijriDay(preMaghribHijri);

          for (const prayer of prayers) {
            const isPostMaghrib = POST_MAGHRIB.includes(prayer);
            const hijri = isPostMaghrib ? postMaghribHijri : preMaghribHijri;
            const hijriKey = formatHijriDateKey(hijri);
            const key = `${hijriKey}-${prayer}`;
            const logEntry = completedMap.get(key);

            // If completed_at is null, it's a missed prayer
            if (!logEntry?.completedAt) {
              missed.push({
                id: logEntry?.id || `${hijriKey}-${prayer}`,
                prayer,
                prayerDate: hijriKey,
                gregorianDate: new Date(currentDate),
                hijriDate: hijri,
                hijriDisplay: formatHijriDate(hijri, 'long'),
                gregorianDisplay: currentDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }),
                displayName: PRAYER_DISPLAY_NAMES[prayer],
                qazaCompletedAt: logEntry?.qazaAt || null,
                isFulfilled: !!logEntry?.qazaAt,
              });
            }
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Sort by date descending (most recent first), then by prayer order
        const prayerOrder: Record<PrayerName, number> = {
          fajr: 1, dhuhr: 2, asr: 3, maghrib: 4, isha: 5
        };
        missed.sort((a, b) => {
          const dateCompare = b.gregorianDate.getTime() - a.gregorianDate.getTime();
          if (dateCompare !== 0) return dateCompare;
          return prayerOrder[a.prayer] - prayerOrder[b.prayer];
        });

        setMissedPrayers(missed);
      } catch (err) {
        console.error('Error fetching missed prayers:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch missed prayers'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMissedPrayers();
  }, [user]);

  // Mark a missed prayer as fulfilled (qaza)
  const fulfillPrayer = useCallback(async (prayerId: string) => {
    if (!user) return;

    const missedPrayer = missedPrayers.find((p) => p.id === prayerId);
    if (!missedPrayer || missedPrayer.isFulfilled) return;

    try {
      const now = new Date();
      
      // Upsert the prayer log with qaza_completed_at
      await supabase
        .from('prayer_logs')
        .upsert({
          user_id: user.id,
          prayer_date: missedPrayer.prayerDate,
          prayer: missedPrayer.prayer,
          gregorian_date: missedPrayer.gregorianDate.toISOString().split('T')[0],
          qaza_completed_at: now.toISOString(),
          // completed_at stays null - this is intentional
        }, {
          onConflict: 'user_id,prayer_date,prayer',
        });

      // Update local state
      setMissedPrayers((prev) =>
        prev.map((p) =>
          p.id === prayerId
            ? { ...p, qazaCompletedAt: now, isFulfilled: true }
            : p
        )
      );
    } catch (err) {
      console.error('Error fulfilling prayer:', err);
    }
  }, [user, missedPrayers]);

  const unfulfilledCount = missedPrayers.filter((p) => !p.isFulfilled).length;

  return {
    missedPrayers,
    unfulfilledCount,
    fulfillPrayer,
    isLoading,
    error,
  };
}
