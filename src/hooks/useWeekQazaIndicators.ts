/**
 * Hook to detect which days in a week range have unfulfilled qaza prayers.
 * Returns a Set of YYYY-MM-DD date strings that have missed prayers.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const REQUIRED_PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function useWeekQazaIndicators(weekDates: Date[]) {
  const { user } = useAuth();

  const startDate = weekDates.length > 0 ? formatDateKey(weekDates[0]) : '';
  const endDate = weekDates.length > 0 ? formatDateKey(weekDates[weekDates.length - 1]) : '';
  const today = formatDateKey(new Date());

  // Fetch user's signup date
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

  const { data: logs } = useQuery({
    queryKey: ['week-prayer-logs', user?.id, startDate, endDate],
    queryFn: async () => {
      if (!user || !startDate) return [];
      const { data, error } = await supabase
        .from('prayer_logs')
        .select('gregorian_date, prayer, completed_at')
        .eq('user_id', user.id)
        .gte('gregorian_date', startDate)
        .lte('gregorian_date', endDate);
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!startDate,
    staleTime: 30000,
  });

  const signupDateKey = useMemo(() => {
    if (!profile?.created_at) return '';
    return formatDateKey(new Date(profile.created_at));
  }, [profile]);

  const qazaDays = useMemo(() => {
    const result = new Set<string>();
    // Only check past days that are strictly after signup date
    const pastDates = weekDates.filter(d => {
      const dk = formatDateKey(d);
      return dk < today && (!signupDateKey || dk > signupDateKey);
    });

    for (const date of pastDates) {
      const dk = formatDateKey(date);
      const dayLogs = logs?.filter(l => l.gregorian_date === dk) || [];
      const completedPrayers = new Set(
        dayLogs.filter(l => l.completed_at).map(l => l.prayer)
      );
      const hasMissed = REQUIRED_PRAYERS.some(p => !completedPrayers.has(p));
      if (hasMissed) result.add(dk);
    }
    return result;
  }, [logs, weekDates, today, signupDateKey]);

  return qazaDays;
}
