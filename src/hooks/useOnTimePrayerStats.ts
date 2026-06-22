import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface OnTimePrayerStats {
  percentage: number;
  onTimeCount: number;
  totalTracked: number;
  loading: boolean;
}

const WINDOW_DAYS = 30;

export const useOnTimePrayerStats = (): OnTimePrayerStats => {
  const { user } = useAuth();
  const [stats, setStats] = useState<OnTimePrayerStats>({
    percentage: 0,
    onTimeCount: 0,
    totalTracked: 0,
    loading: true,
  });

  const fetchStats = useCallback(async () => {
    if (!user) return;

    const since = new Date();
    since.setDate(since.getDate() - (WINDOW_DAYS - 1));
    const sinceDate = since.toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from('prayer_logs')
      .select('completed_at, prayer_window_start, prayer_window_end, prayer_date')
      .eq('user_id', user.id)
      .gte('prayer_date', sinceDate)
      .not('prayer_window_start', 'is', null)
      .not('prayer_window_end', 'is', null)
      .not('completed_at', 'is', null);

    if (error) {
      console.error('Error fetching on-time stats:', error);
      setStats(s => ({ ...s, loading: false }));
      return;
    }

    if (!data || data.length === 0) {
      setStats({ percentage: 0, onTimeCount: 0, totalTracked: 0, loading: false });
      return;
    }

    let onTime = 0;
    for (const log of data) {
      const completedDate = new Date(log.completed_at!);
      const hours = completedDate.getHours().toString().padStart(2, '0');
      const minutes = completedDate.getMinutes().toString().padStart(2, '0');
      const seconds = completedDate.getSeconds().toString().padStart(2, '0');
      const completedTime = `${hours}:${minutes}:${seconds}`;

      const start = log.prayer_window_start as string;
      const end = log.prayer_window_end as string;

      if (start <= end) {
        if (completedTime >= start && completedTime <= end) onTime++;
      } else {
        if (completedTime >= start || completedTime <= end) onTime++;
      }
    }

    setStats({
      percentage: Math.round((onTime / data.length) * 100),
      onTimeCount: onTime,
      totalTracked: data.length,
      loading: false,
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchStats();

    const handler = () => fetchStats();
    window.addEventListener('prayer-log:changed', handler);
    window.addEventListener('focus', handler);
    return () => {
      window.removeEventListener('prayer-log:changed', handler);
      window.removeEventListener('focus', handler);
    };
  }, [user, fetchStats]);

  return stats;
};
