/**
 * Hook to compute which goals are due on a given date and fetch their completions.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useGoals } from '@/hooks/useGoals';
import { isGoalDueOnDate } from '@/lib/recurrence';
import { HijriDate, formatHijriDateKey } from '@/lib/hijri';
import type { Goal, GoalWithStatus, GoalCompletion } from '@/types/goals';

export function useCalendarDayGoals(
  selectedDate: Date,
  preMaghribHijri: HijriDate,
) {
  const { user } = useAuth();
  const { goals, isLoading: goalsLoading } = useGoals();

  const hijriDateStr = formatHijriDateKey(preMaghribHijri);

  // Fetch completions for this date
  const { data: completions = [], isLoading: completionsLoading } = useQuery({
    queryKey: ['goal-completions', user?.id, hijriDateStr],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('goal_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completion_date', hijriDateStr);
      if (error) throw error;
      return data as GoalCompletion[];
    },
    enabled: !!user,
  });

  const completionMap = useMemo(
    () => new Map(completions.map(c => [c.goal_id, c])),
    [completions],
  );

  // Filter goals due on this date
  const goalsDueOnDate: GoalWithStatus[] = useMemo(() => {
    if (!goals.length) return [];
    return goals
      .filter(g => isGoalDueOnDate(g, preMaghribHijri, selectedDate))
      .map(g => ({
        ...g,
        isCompleted: completionMap.has(g.id),
        completionId: completionMap.get(g.id)?.id,
      }));
  }, [goals, preMaghribHijri, selectedDate, completionMap]);

  // Split into all-day (no time) and timed goals
  const allDayGoals = useMemo(
    () => goalsDueOnDate.filter(g => !g.preferred_time),
    [goalsDueOnDate],
  );

  const timedGoals = useMemo(
    () => goalsDueOnDate
      .filter(g => !!g.preferred_time)
      .sort((a, b) => (a.preferred_time || '').localeCompare(b.preferred_time || '')),
    [goalsDueOnDate],
  );

  return {
    goalsDueOnDate,
    allDayGoals,
    timedGoals,
    completionMap,
    isLoading: goalsLoading || completionsLoading,
  };
}
