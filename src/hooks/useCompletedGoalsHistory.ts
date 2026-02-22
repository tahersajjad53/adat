import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CompletedGoalEntry {
  id: string;
  goal_id: string;
  completion_date: string;
  gregorian_date: string;
  completed_at: string;
  goal_title: string;
  goal_recurrence_type: string;
  goal_description: string | null;
}

export function useCompletedGoalsHistory() {
  const { user } = useAuth();

  const { data: completions = [], isLoading } = useQuery({
    queryKey: ['completed-goals-history', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goal_completions')
        .select('*, goals(title, recurrence_type, description)')
        .eq('user_id', user!.id)
        .order('completed_at', { ascending: false })
        .limit(200);

      if (error) throw error;

      return (data ?? []).map((row: any) => ({
        id: row.id,
        goal_id: row.goal_id,
        completion_date: row.completion_date,
        gregorian_date: row.gregorian_date,
        completed_at: row.completed_at,
        goal_title: row.goals?.title ?? 'Deleted Goal',
        goal_recurrence_type: row.goals?.recurrence_type ?? 'unknown',
        goal_description: row.goals?.description ?? null,
      })) as CompletedGoalEntry[];
    },
  });

  return { completions, isLoading };
}
