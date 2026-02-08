import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCalendar } from '@/contexts/CalendarContext';
import type { GoalCompletion } from '@/types/goals';

interface UseGoalCompletionsOptions {
  /** If provided, only fetch completions for this specific Hijri date (YYYY-MM-DD format) */
  forDate?: string;
}

export function useGoalCompletions(options: UseGoalCompletionsOptions = {}) {
  const { user } = useAuth();
  const { currentDate } = useCalendar();
  const queryClient = useQueryClient();

  const hijriDate = currentDate?.preMaghribHijri ?? currentDate?.hijri;
  const gregorianDate = currentDate?.gregorian;

  // Format pre-Maghrib Hijri date as YYYY-MM-DD for database (canonical for goals)
  const currentHijriDateStr = hijriDate
    ? `${hijriDate.year}-${String(hijriDate.month).padStart(2, '0')}-${String(hijriDate.day).padStart(2, '0')}`
    : null;

  const dateToFetch = options.forDate || currentHijriDateStr;

  // Fetch completions for the specified date
  const { data: completions = [], isLoading } = useQuery({
    queryKey: ['goal-completions', user?.id, dateToFetch],
    queryFn: async () => {
      if (!user || !dateToFetch) return [];

      const { data, error } = await supabase
        .from('goal_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completion_date', dateToFetch);

      if (error) {
        console.error('Error fetching goal completions:', error);
        throw error;
      }

      return data as GoalCompletion[];
    },
    enabled: !!user && !!dateToFetch,
  });

  // Create a map of goalId -> completion for quick lookup
  const completionMap = new Map<string, GoalCompletion>(
    completions.map(c => [c.goal_id, c])
  );

  // Check if a goal is completed for the current date
  const isCompleted = (goalId: string): boolean => {
    return completionMap.has(goalId);
  };

  // Get completion for a specific goal
  const getCompletion = (goalId: string): GoalCompletion | undefined => {
    return completionMap.get(goalId);
  };

  // Toggle completion status for a goal
  const toggleCompletionMutation = useMutation({
    mutationFn: async (goalId: string) => {
      if (!user || !currentHijriDateStr || !gregorianDate) {
        throw new Error('Not authenticated or date not available');
      }

      const existingCompletion = completionMap.get(goalId);

      if (existingCompletion) {
        // Remove completion
        const { error } = await supabase
          .from('goal_completions')
          .delete()
          .eq('id', existingCompletion.id)
          .eq('user_id', user.id);

        if (error) throw error;
        return { action: 'removed' as const };
      } else {
        // Add completion
        const gregorianDateStr = gregorianDate.toISOString().split('T')[0];

        const { error } = await supabase
          .from('goal_completions')
          .insert({
            user_id: user.id,
            goal_id: goalId,
            completion_date: currentHijriDateStr,
            gregorian_date: gregorianDateStr,
          });

        if (error) throw error;
        return { action: 'added' as const };
      }
    },
    onSuccess: () => {
      // Invalidate completions for the current date
      queryClient.invalidateQueries({ 
        queryKey: ['goal-completions', user?.id, currentHijriDateStr] 
      });
      // Also invalidate today's progress if it exists
      queryClient.invalidateQueries({ 
        queryKey: ['today-progress'] 
      });
    },
    onError: (error) => {
      console.error('Error toggling goal completion:', error);
    },
  });

  return {
    completions,
    completionMap,
    isLoading,
    isCompleted,
    getCompletion,
    toggleCompletion: toggleCompletionMutation.mutateAsync,
    isToggling: toggleCompletionMutation.isPending,
  };
}
