import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserPreferencesData {
  dynamic_goals_enabled: boolean;
  goal_sort_order: string[] | null;
}

export function useUserPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await (supabase as any)
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as UserPreferencesData | null;
    },
    enabled: !!user,
  });

  const dynamicGoalsEnabled = data?.dynamic_goals_enabled ?? false;
  const goalSortOrder: string[] = (data?.goal_sort_order as string[] | null) ?? [];

  const toggleMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await (supabase as any)
        .from('user_preferences')
        .upsert(
          { user_id: user.id, dynamic_goals_enabled: enabled },
          { onConflict: 'user_id' }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
      queryClient.invalidateQueries({ queryKey: ['admin-goals-published'] });
    },
  });

  const sortOrderMutation = useMutation({
    mutationFn: async (order: string[]) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await (supabase as any)
        .from('user_preferences')
        .upsert(
          { user_id: user.id, goal_sort_order: order },
          { onConflict: 'user_id' }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
    },
  });

  return {
    dynamicGoalsEnabled,
    goalSortOrder,
    isLoading,
    setDynamicGoalsEnabled: toggleMutation.mutateAsync,
    setGoalSortOrder: sortOrderMutation.mutateAsync,
    isToggling: toggleMutation.isPending,
  };
}
