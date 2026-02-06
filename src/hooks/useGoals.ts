import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Goal, GoalInput, RecurrenceType, RecurrencePattern } from '@/types/goals';

// Helper to convert DB row to typed Goal
function rowToGoal(row: any): Goal {
  return {
    ...row,
    recurrence_type: row.recurrence_type as RecurrenceType,
    recurrence_pattern: row.recurrence_pattern as RecurrencePattern | null,
  };
}

export function useGoals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all goals for the current user
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching goals:', error);
        throw error;
      }

      return (data || []).map(rowToGoal);
    },
    enabled: !!user,
  });

  // Create a new goal
  const createGoalMutation = useMutation({
    mutationFn: async (input: GoalInput) => {
      if (!user) throw new Error('Not authenticated');

      // Get the next sort order
      const maxOrder = goals.reduce((max, g) => Math.max(max, g.sort_order), -1);

      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: input.title,
          description: input.description,
          recurrence_type: input.recurrence_type,
          recurrence_pattern: input.recurrence_pattern as any,
          recurrence_days: input.recurrence_days,
          due_date: input.due_date,
          start_date: input.start_date || new Date().toISOString().split('T')[0],
          end_date: input.end_date,
          sort_order: maxOrder + 1,
          is_active: input.is_active ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return rowToGoal(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({
        title: 'Goal created',
        description: 'Your new goal has been added.',
      });
    },
    onError: (error) => {
      console.error('Error creating goal:', error);
      toast({
        title: 'Error creating goal',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Update an existing goal
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<GoalInput> }) => {
      if (!user) throw new Error('Not authenticated');

      const updateData: any = { ...input };
      if (input.recurrence_pattern !== undefined) {
        updateData.recurrence_pattern = input.recurrence_pattern as any;
      }

      const { error } = await supabase
        .from('goals')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({
        title: 'Goal updated',
        description: 'Your changes have been saved.',
      });
    },
    onError: (error) => {
      console.error('Error updating goal:', error);
      toast({
        title: 'Error updating goal',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Delete a goal (soft delete by setting is_active = false)
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({
        title: 'Goal deleted',
        description: 'The goal has been removed.',
      });
    },
    onError: (error) => {
      console.error('Error deleting goal:', error);
      toast({
        title: 'Error deleting goal',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Reorder goals (update sort_order for multiple goals)
  const reorderGoalsMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      if (!user) throw new Error('Not authenticated');

      // Update each goal's sort_order based on its position in the array
      const updates = orderedIds.map((id, index) => 
        supabase
          .from('goals')
          .update({ sort_order: index })
          .eq('id', id)
          .eq('user_id', user.id)
      );

      const results = await Promise.all(updates);
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) {
        throw errors[0].error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
    onError: (error) => {
      console.error('Error reordering goals:', error);
      toast({
        title: 'Error reordering goals',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    goals,
    isLoading,
    createGoal: createGoalMutation.mutateAsync,
    updateGoal: (id: string, input: Partial<GoalInput>) => 
      updateGoalMutation.mutateAsync({ id, input }),
    deleteGoal: deleteGoalMutation.mutateAsync,
    reorderGoals: reorderGoalsMutation.mutateAsync,
    isCreating: createGoalMutation.isPending,
    isUpdating: updateGoalMutation.isPending,
    isDeleting: deleteGoalMutation.isPending,
  };
}
