import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCalendar } from '@/contexts/CalendarContext';
import { useGoals } from './useGoals';
import { findOverdueGoals, findAllMissedDatesForGoal, getOverdueDateLabel } from '@/lib/recurrence';
import { gregorianToBohra, formatHijriDateKey } from '@/lib/hijri';
import type { OverdueGoal } from '@/types/goals';

const LOOKBACK_DAYS = 7;

export function useOverdueGoals() {
  const { user } = useAuth();
  const { currentDate, location } = useCalendar();
  const { goals } = useGoals();
  const queryClient = useQueryClient();

  const today = currentDate?.gregorian ?? null;
  const todayHijri = currentDate?.preMaghribHijri ?? currentDate?.hijri ?? null;

  // Build the list of past Hijri date strings to query completions for
  const pastHijriDates = useMemo(() => {
    if (!today || !location) return [];
    const dates: string[] = [];
    for (let i = 1; i <= LOOKBACK_DAYS; i++) {
      const pastDate = new Date(today);
      pastDate.setDate(pastDate.getDate() - i);
      const hijri = gregorianToBohra(pastDate, location.timezone);
      dates.push(formatHijriDateKey(hijri));
    }
    return dates;
  }, [today, location]);

  // Fetch completions for all past dates in one query
  const { data: pastCompletions = [], isLoading } = useQuery({
    queryKey: ['goal-completions-past', user?.id, pastHijriDates],
    queryFn: async () => {
      if (!user || pastHijriDates.length === 0) return [];
      const { data, error } = await supabase
        .from('goal_completions')
        .select('goal_id, completion_date')
        .eq('user_id', user.id)
        .in('completion_date', pastHijriDates);
      if (error) throw error;
      return data as Array<{ goal_id: string; completion_date: string }>;
    },
    enabled: !!user && pastHijriDates.length > 0,
  });

  // Build a Set of "goalId:hijriDate" keys for quick lookup
  const completionKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const c of pastCompletions) {
      keys.add(`${c.goal_id}:${c.completion_date}`);
    }
    return keys;
  }, [pastCompletions]);

  // Compute overdue goals
  const overdueGoals: OverdueGoal[] = useMemo(() => {
    if (!today || !todayHijri || !location) return [];

    const activeGoals = goals.filter(g => g.is_active);
    const getHijri = (date: Date) => gregorianToBohra(date, location.timezone);

    const raw = findOverdueGoals(activeGoals, today, todayHijri, completionKeys, LOOKBACK_DAYS, getHijri);

    return raw.map(({ goal, overdueDate, overdueHijriDate }) => ({
      goal,
      overdueDate,
      overdueDateLabel: getOverdueDateLabel(overdueDate, today),
      overdueHijriDate: formatHijriDateKey(overdueHijriDate),
      overdueGregorianDate: overdueDate.toISOString().split('T')[0],
    }));
  }, [goals, today, todayHijri, location, completionKeys]);

  // Mutation to complete an overdue goal (batch-clears all missed dates)
  const completeOverdueMutation = useMutation({
    mutationFn: async (goalId: string) => {
      if (!user || !today || !location) throw new Error('Not authenticated or missing context');

      const goal = goals.find(g => g.id === goalId);
      if (!goal) throw new Error('Goal not found');

      const getHijri = (date: Date) => gregorianToBohra(date, location.timezone);
      const allMissed = findAllMissedDatesForGoal(goal, today, completionKeys, LOOKBACK_DAYS, getHijri);

      if (allMissed.length === 0) return;

      const rows = allMissed.map(({ gregorianDate, hijriDate }) => ({
        user_id: user.id,
        goal_id: goalId,
        completion_date: formatHijriDateKey(hijriDate),
        gregorian_date: gregorianDate.toISOString().split('T')[0],
      }));

      const { error } = await supabase
        .from('goal_completions')
        .insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-completions-past', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['goal-completions', user?.id] });
    },
  });

  const completeOverdue = (goalId: string) => {
    const overdue = overdueGoals.find(o => o.goal.id === goalId);
    if (!overdue) return;
    completeOverdueMutation.mutate(goalId);
  };

  return {
    overdueGoals,
    isLoading,
    completeOverdue,
    isCompletingOverdue: completeOverdueMutation.isPending,
  };
}
