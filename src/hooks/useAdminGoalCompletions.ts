import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCalendar } from '@/contexts/CalendarContext';
import type { AdminGoalCompletion } from '@/types/adminGoals';

export function useAdminGoalCompletions() {
  const { user } = useAuth();
  const { currentDate } = useCalendar();
  const queryClient = useQueryClient();

  const hijriDate = currentDate?.preMaghribHijri ?? currentDate?.hijri;
  const gregorianDate = currentDate?.gregorian;

  const currentHijriDateStr = hijriDate
    ? `${hijriDate.year}-${String(hijriDate.month).padStart(2, '0')}-${String(hijriDate.day).padStart(2, '0')}`
    : null;

  const { data: completions = [], isLoading } = useQuery({
    queryKey: ['admin-goal-completions', user?.id, currentHijriDateStr],
    queryFn: async () => {
      if (!user || !currentHijriDateStr) return [];
      const { data, error } = await (supabase as any)
        .from('admin_goal_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completion_date', currentHijriDateStr);
      if (error) throw error;
      return data as AdminGoalCompletion[];
    },
    enabled: !!user && !!currentHijriDateStr,
  });

  const completionMap = new Map<string, AdminGoalCompletion>(
    completions.map((c: AdminGoalCompletion) => [c.admin_goal_id, c])
  );

  const isCompleted = (adminGoalId: string) => completionMap.has(adminGoalId);

  const toggleMutation = useMutation({
    mutationFn: async (adminGoalId: string) => {
      if (!user || !currentHijriDateStr || !gregorianDate) {
        throw new Error('Missing context');
      }
      const existing = completionMap.get(adminGoalId);
      if (existing) {
        const { error } = await (supabase as any)
          .from('admin_goal_completions')
          .delete()
          .eq('id', existing.id)
          .eq('user_id', user.id);
        if (error) throw error;
        return { action: 'removed' as const };
      } else {
        const { error } = await (supabase as any)
          .from('admin_goal_completions')
          .insert({
            user_id: user.id,
            admin_goal_id: adminGoalId,
            completion_date: currentHijriDateStr,
            gregorian_date: gregorianDate.toISOString().split('T')[0],
          });
        if (error) throw error;
        return { action: 'added' as const };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-goal-completions', user?.id, currentHijriDateStr],
      });
    },
  });

  return {
    isCompleted,
    toggleCompletion: toggleMutation.mutateAsync,
    isToggling: toggleMutation.isPending,
  };
}
