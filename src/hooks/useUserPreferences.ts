import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
      return data as { dynamic_goals_enabled: boolean } | null;
    },
    enabled: !!user,
  });

  const dynamicGoalsEnabled = data?.dynamic_goals_enabled ?? false;

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

  return {
    dynamicGoalsEnabled,
    isLoading,
    setDynamicGoalsEnabled: toggleMutation.mutateAsync,
    isToggling: toggleMutation.isPending,
  };
}
