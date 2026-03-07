import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface OnTimePrayerStats {
  percentage: number;
  onTimeCount: number;
  totalTracked: number;
  loading: boolean;
}

export const useOnTimePrayerStats = (): OnTimePrayerStats => {
  const { user } = useAuth();
  const [stats, setStats] = useState<OnTimePrayerStats>({
    percentage: 0,
    onTimeCount: 0,
    totalTracked: 0,
    loading: true,
  });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('prayer_logs')
        .select('completed_at, prayer_window_start, prayer_window_end')
        .eq('user_id', user.id)
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
          // Normal window (e.g., 12:00 - 15:30)
          if (completedTime >= start && completedTime <= end) onTime++;
        } else {
          // Midnight-crossing window (e.g., 23:00 - 05:00)
          if (completedTime >= start || completedTime <= end) onTime++;
        }
      }

      setStats({
        percentage: Math.round((onTime / data.length) * 100),
        onTimeCount: onTime,
        totalTracked: data.length,
        loading: false,
      });
    };

    fetchStats();
  }, [user]);

  return stats;
};
