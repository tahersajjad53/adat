/**
 * Hook to fetch all unfulfilled (qaza) prayers from the day after signup
 * through yesterday. Provides actions to fulfill individually or clear all.
 */
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { gregorianToBohra, advanceHijriDay, formatHijriDateKey, HijriDate } from '@/lib/hijri';
import { PrayerName, PRAYER_ORDER, PRAYER_DISPLAY_NAMES } from './usePrayerTimes';

const POST_MAGHRIB: PrayerName[] = ['maghrib', 'isha'];

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface MissedPrayerItem {
  prayer: PrayerName;
  displayName: string;
  gregorianDate: string; // YYYY-MM-DD
  hijri: HijriDate;
}

export interface MissedPrayerGroup {
  gregorianDate: string;
  dateLabel: string;
  preMaghribHijri: HijriDate;
  postMaghribHijri: HijriDate;
  prayers: MissedPrayerItem[];
}

export function useMissedPrayers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile-created', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
    staleTime: Infinity,
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['missed-prayers-logs', user?.id, profile?.created_at],
    queryFn: async () => {
      if (!user || !profile?.created_at) return [];
      const start = new Date(profile.created_at);
      start.setDate(start.getDate() + 1); // strictly after signup
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (start > yesterday) return [];
      const { data, error } = await supabase
        .from('prayer_logs')
        .select('gregorian_date, prayer, completed_at, qaza_completed_at')
        .eq('user_id', user.id)
        .gte('gregorian_date', formatDateKey(start))
        .lte('gregorian_date', formatDateKey(yesterday));
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!profile?.created_at,
    staleTime: 30000,
  });

  const groups = useMemo<MissedPrayerGroup[]>(() => {
    if (!profile?.created_at) return [];
    const start = new Date(profile.created_at);
    start.setDate(start.getDate() + 1);
    start.setHours(0, 0, 0, 0);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    if (start > yesterday) return [];

    // Index logs by `${date}|${prayer}`
    const logIdx = new Map<string, { completed: boolean; qaza: boolean }>();
    (logs || []).forEach((l) => {
      logIdx.set(`${l.gregorian_date}|${l.prayer}`, {
        completed: !!l.completed_at,
        qaza: !!l.qaza_completed_at,
      });
    });

    const result: MissedPrayerGroup[] = [];
    const cursor = new Date(yesterday);
    while (cursor >= start) {
      const dk = formatDateKey(cursor);
      const preMaghribHijri = gregorianToBohra(cursor);
      const postMaghribHijri = advanceHijriDay(preMaghribHijri);
      const missed: MissedPrayerItem[] = [];
      for (const p of PRAYER_ORDER) {
        const entry = logIdx.get(`${dk}|${p}`);
        if (!entry || (!entry.completed && !entry.qaza)) {
          missed.push({
            prayer: p,
            displayName: PRAYER_DISPLAY_NAMES[p],
            gregorianDate: dk,
            hijri: POST_MAGHRIB.includes(p) ? postMaghribHijri : preMaghribHijri,
          });
        }
      }
      if (missed.length > 0) {
        const dateLabel = cursor.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        result.push({
          gregorianDate: dk,
          dateLabel,
          preMaghribHijri,
          postMaghribHijri,
          prayers: missed,
        });
      }
      cursor.setDate(cursor.getDate() - 1);
    }
    return result;
  }, [logs, profile?.created_at]);

  const unfulfilledCount = useMemo(
    () => groups.reduce((sum, g) => sum + g.prayers.length, 0),
    [groups]
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['missed-prayers-logs'] });
    queryClient.invalidateQueries({ queryKey: ['week-prayer-logs'] });
    queryClient.invalidateQueries({ queryKey: ['month-prayer-logs'] });
  };




  const fulfillQaza = async (item: MissedPrayerItem) => {
    if (!user) return;
    const prayerDateKey = formatHijriDateKey(item.hijri);
    const now = new Date();
    const { error } = await supabase.from('prayer_logs').upsert({
      user_id: user.id,
      prayer_date: prayerDateKey,
      prayer: item.prayer,
      gregorian_date: item.gregorianDate,
      qaza_completed_at: now.toISOString(),
    }, { onConflict: 'user_id,prayer_date,prayer' });
    if (error) throw error;
    invalidate();
  };

  const clearAll = async () => {
    if (!user) return;
    const rows = groups.flatMap(g =>
      g.prayers.map(p => ({
        user_id: user.id,
        prayer_date: formatHijriDateKey(p.hijri),
        prayer: p.prayer,
        gregorian_date: p.gregorianDate,
        qaza_completed_at: new Date().toISOString(),
      }))
    );
    if (rows.length === 0) return;
    const { error } = await supabase
      .from('prayer_logs')
      .upsert(rows, { onConflict: 'user_id,prayer_date,prayer' });
    if (error) throw error;
    invalidate();
  };

  return {
    groups,
    unfulfilledCount,
    isLoading: logsLoading,
    fulfillQaza,
    clearAll,
  };
}
