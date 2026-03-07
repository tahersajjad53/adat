/**
 * Hook to fetch prayer times + prayer logs for an arbitrary Gregorian date.
 * Unlike usePrayerLog (today-only), this works for any date.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCalendar } from '@/contexts/CalendarContext';
import { supabase } from '@/integrations/supabase/client';
import { HijriDate, gregorianToBohra, advanceHijriDay, formatHijriDateKey } from '@/lib/hijri';
import { fetchPrayerTimes } from '@/lib/prayerTimes';
import {
  PrayerName, AllPrayerName, ALL_PRAYER_ORDER, OPTIONAL_PRAYERS,
  PRAYER_DISPLAY_NAMES, PRAYER_ORDER, parseTimeToMinutes,
} from './usePrayerTimes';

export interface CalendarDayPrayer {
  name: AllPrayerName;
  displayName: string;
  time: string;
  timeMinutes: number;
  isCompleted: boolean;
  status: 'upcoming' | 'current' | 'completed' | 'missed';
  isOptional: boolean;
  hijriDate: HijriDate;
  /** For past missed prayers — the prayer_logs row id (if exists) */
  logId: string | null;
  /** For past missed prayers — whether qaza was fulfilled */
  isQazaFulfilled: boolean;
}

const POST_MAGHRIB_PRAYERS: AllPrayerName[] = ['maghrib', 'isha', 'nisfulLayl'];

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function useCalendarDay(selectedDate: Date) {
  const { user } = useAuth();
  const { location } = useCalendar();
  const [prayerTimes, setPrayerTimes] = useState<Record<AllPrayerName, string> | null>(null);
  const [completedPrayers, setCompletedPrayers] = useState<Map<string, { completedAt: Date | null; qazaAt: Date | null; id: string }>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const dateKey = formatDateKey(selectedDate);
  const isToday = formatDateKey(new Date()) === dateKey;
  const isFuture = selectedDate > new Date() && !isToday;
  const isPast = !isToday && !isFuture;

  const preMaghribHijri = useMemo(() => gregorianToBohra(selectedDate, location?.timezone), [selectedDate, location?.timezone]);
  const postMaghribHijri = useMemo(() => advanceHijriDay(preMaghribHijri), [preMaghribHijri]);

  // Fetch prayer times for the selected date
  useEffect(() => {
    if (!location) return;
    let cancelled = false;
    const load = async () => {
      try {
        const times = await fetchPrayerTimes(selectedDate, location);
        if (cancelled) return;
        const cleaned: Record<PrayerName, string> = {
          fajr: times.Fajr.split(' ')[0],
          dhuhr: times.Dhuhr.split(' ')[0],
          asr: times.Asr.split(' ')[0],
          maghrib: times.Maghrib.split(' ')[0],
          isha: times.Isha.split(' ')[0],
        };
        setPrayerTimes({
          ...cleaned,
          nisfulLayl: times.Midnight.split(' ')[0],
        });
      } catch (err) {
        console.error('Failed to fetch prayer times for date:', err);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [selectedDate, location]);

  // Fetch prayer logs for the selected date
  useEffect(() => {
    if (!user) { setIsLoading(false); return; }
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('prayer_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('gregorian_date', dateKey);
        if (error) throw error;
        if (cancelled) return;
        const map = new Map<string, { completedAt: Date | null; qazaAt: Date | null; id: string }>();
        data?.forEach((log) => {
          map.set(log.prayer, {
            completedAt: log.completed_at ? new Date(log.completed_at) : null,
            qazaAt: log.qaza_completed_at ? new Date(log.qaza_completed_at) : null,
            id: log.id,
          });
        });
        setCompletedPrayers(map);
      } catch (err) {
        console.error('Error fetching prayer logs:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user, dateKey]);

  // Toggle prayer (only for today)
  const togglePrayer = useCallback(async (prayer: AllPrayerName) => {
    if (!user || !isToday) return;
    const hijriForPrayer = POST_MAGHRIB_PRAYERS.includes(prayer) ? postMaghribHijri : preMaghribHijri;
    const prayerDateKey = formatHijriDateKey(hijriForPrayer);
    const existing = completedPrayers.get(prayer);
    const isCurrentlyCompleted = !!existing?.completedAt;

    try {
      if (isCurrentlyCompleted) {
        await supabase.from('prayer_logs').delete()
          .eq('user_id', user.id).eq('gregorian_date', dateKey).eq('prayer', prayer);
        setCompletedPrayers(prev => {
          const next = new Map(prev);
          next.delete(prayer);
          return next;
        });
      } else {
        const now = new Date();
        await supabase.from('prayer_logs').upsert({
          user_id: user.id,
          prayer_date: prayerDateKey,
          prayer,
          completed_at: now.toISOString(),
          gregorian_date: dateKey,
        }, { onConflict: 'user_id,prayer_date,prayer' });
        setCompletedPrayers(prev => {
          const next = new Map(prev);
          next.set(prayer, { completedAt: now, qazaAt: null, id: '' });
          return next;
        });
      }
    } catch (err) {
      console.error('Error toggling prayer:', err);
    }
  }, [user, isToday, dateKey, preMaghribHijri, postMaghribHijri, completedPrayers]);

  // Fulfill qaza (for past missed prayers)
  const fulfillQaza = useCallback(async (prayer: AllPrayerName) => {
    if (!user || !isPast) return;
    const hijriForPrayer = POST_MAGHRIB_PRAYERS.includes(prayer) ? postMaghribHijri : preMaghribHijri;
    const prayerDateKey = formatHijriDateKey(hijriForPrayer);
    const now = new Date();

    try {
      await supabase.from('prayer_logs').upsert({
        user_id: user.id,
        prayer_date: prayerDateKey,
        prayer,
        gregorian_date: dateKey,
        qaza_completed_at: now.toISOString(),
      }, { onConflict: 'user_id,prayer_date,prayer' });
      setCompletedPrayers(prev => {
        const next = new Map(prev);
        const existing = next.get(prayer);
        next.set(prayer, { completedAt: existing?.completedAt || null, qazaAt: now, id: existing?.id || '' });
        return next;
      });
    } catch (err) {
      console.error('Error fulfilling qaza:', err);
    }
  }, [user, isPast, dateKey, preMaghribHijri, postMaghribHijri]);

  // Build prayer statuses
  const prayers: CalendarDayPrayer[] = useMemo(() => {
    if (!prayerTimes) return [];
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return ALL_PRAYER_ORDER.map((name) => {
      const time = prayerTimes[name] || '--:--';
      const timeMinutes = parseTimeToMinutes(time);
      const isOptional = OPTIONAL_PRAYERS.includes(name as any);
      const logEntry = completedPrayers.get(name);
      const isCompleted = !!logEntry?.completedAt;
      const hijriDate = POST_MAGHRIB_PRAYERS.includes(name) ? postMaghribHijri : preMaghribHijri;

      let status: CalendarDayPrayer['status'];
      if (isCompleted) {
        status = 'completed';
      } else if (isFuture) {
        status = 'upcoming';
      } else if (isToday) {
        if (isOptional) {
          status = 'upcoming';
        } else {
          const prayerIdx = PRAYER_ORDER.indexOf(name as PrayerName);
          if (currentMinutes < timeMinutes) {
            status = 'upcoming';
          } else {
            const nextPrayer = PRAYER_ORDER[prayerIdx + 1];
            if (nextPrayer) {
              const nextMinutes = parseTimeToMinutes(prayerTimes[nextPrayer]);
              status = currentMinutes < nextMinutes ? 'current' : 'missed';
            } else {
              status = 'current'; // Isha
            }
          }
        }
      } else {
        // Past day
        status = isOptional ? 'upcoming' : 'missed';
      }

      return {
        name,
        displayName: PRAYER_DISPLAY_NAMES[name],
        time,
        timeMinutes,
        isCompleted,
        status,
        isOptional,
        hijriDate,
        logId: logEntry?.id || null,
        isQazaFulfilled: !!logEntry?.qazaAt,
      };
    });
  }, [prayerTimes, completedPrayers, isToday, isFuture, isPast, preMaghribHijri, postMaghribHijri]);

  return {
    prayers,
    prayerTimes,
    togglePrayer,
    fulfillQaza,
    isLoading: isLoading || !prayerTimes,
    isToday,
    isPast,
    isFuture,
    preMaghribHijri,
    postMaghribHijri,
    dateKey,
  };
}
