/**
 * Hook to compute qaza (missed prayer) days and goal days for an entire month.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useGoals } from '@/hooks/useGoals';
import { isGoalDueOnDate } from '@/lib/recurrence';
import { gregorianToBohra } from '@/lib/hijri';

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const REQUIRED_PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

/**
 * Get all dates in a given month (year, month are 0-indexed JS month).
 */
function getMonthDates(year: number, month: number): Date[] {
  const dates: Date[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

export function useMonthIndicators(displayYear: number, displayMonth: number) {
  const { user } = useAuth();
  const { goals } = useGoals();

  const monthDates = useMemo(() => getMonthDates(displayYear, displayMonth), [displayYear, displayMonth]);

  const startDate = monthDates.length > 0 ? formatDateKey(monthDates[0]) : '';
  const endDate = monthDates.length > 0 ? formatDateKey(monthDates[monthDates.length - 1]) : '';
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

  // Fetch prayer logs for the month
  const { data: logs } = useQuery({
    queryKey: ['month-prayer-logs', user?.id, startDate, endDate],
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

  // Qaza days: past days with missed prayers, only after signup
  const qazaDays = useMemo(() => {
    const result = new Set<string>();
    const pastDates = monthDates.filter(d => {
      const dk = formatDateKey(d);
      return dk < today && (!signupDateKey || dk > signupDateKey);
    });
    for (const date of pastDates) {
      const dk = formatDateKey(date);
      const dayLogs = logs?.filter(l => l.gregorian_date === dk) || [];
      const completedPrayers = new Set(
        dayLogs.filter(l => l.completed_at).map(l => l.prayer)
      );
      if (REQUIRED_PRAYERS.some(p => !completedPrayers.has(p))) {
        result.add(dk);
      }
    }
    return result;
  }, [logs, monthDates, today, signupDateKey]);

  // Goal days: days that have at least one goal due
  const goalDays = useMemo(() => {
    const result = new Set<string>();
    if (!goals.length) return result;
    for (const date of monthDates) {
      const hijri = gregorianToBohra(date);
      const hasDue = goals.some(g => isGoalDueOnDate(g, hijri, date));
      if (hasDue) result.add(formatDateKey(date));
    }
    return result;
  }, [goals, monthDates]);

  return { qazaDays, goalDays, monthDates };
}
