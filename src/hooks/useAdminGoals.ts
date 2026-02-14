import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { AdminGoal, AdminGoalInput } from '@/types/adminGoals';

export function useAdminGoals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['admin-goals'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('admin_goals')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data || []) as AdminGoal[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (input: AdminGoalInput) => {
      const maxOrder = goals.reduce((max, g) => Math.max(max, g.sort_order), -1);
      const { data, error } = await (supabase as any)
        .from('admin_goals')
        .insert({
          title: input.title,
          description: input.description,
          recurrence_type: input.recurrence_type,
          recurrence_days: input.recurrence_days,
          recurrence_pattern: input.recurrence_pattern,
          start_date: input.start_date || new Date().toISOString().split('T')[0],
          end_date: input.end_date,
          due_date: input.due_date,
          is_published: input.is_published ?? false,
          sort_order: maxOrder + 1,
        })
        .select()
        .single();
      if (error) throw error;
      return data as AdminGoal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-goals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-goals-published'] });
      toast({ title: 'Goal created' });
    },
    onError: (error) => {
      console.error('Error creating admin goal:', error);
      toast({ title: 'Error creating goal', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<AdminGoalInput> }) => {
      const { error } = await (supabase as any)
        .from('admin_goals')
        .update(input)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-goals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-goals-published'] });
      toast({ title: 'Goal updated' });
    },
    onError: (error) => {
      console.error('Error updating admin goal:', error);
      toast({ title: 'Error updating goal', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('admin_goals')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-goals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-goals-published'] });
      toast({ title: 'Goal deleted' });
    },
    onError: (error) => {
      console.error('Error deleting admin goal:', error);
      toast({ title: 'Error deleting goal', variant: 'destructive' });
    },
  });

  return {
    goals,
    isLoading,
    createGoal: createMutation.mutateAsync,
    updateGoal: (id: string, input: Partial<AdminGoalInput>) =>
      updateMutation.mutateAsync({ id, input }),
    deleteGoal: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
