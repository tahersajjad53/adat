import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface TasbeehCounter {
  id: string;
  user_id: string;
  title: string | null;
  target_count: number | null;
  current_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useTasbeehCounters() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: counters = [], isLoading } = useQuery({
    queryKey: ['tasbeeh_counters', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasbeeh_counters')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as TasbeehCounter[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async ({ title, target_count }: { title?: string; target_count?: number }) => {
      const { data, error } = await supabase
        .from('tasbeeh_counters')
        .insert({ user_id: user!.id, title: title || null, target_count: target_count || null })
        .select()
        .single();
      if (error) throw error;
      return data as TasbeehCounter;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasbeeh_counters'] });
      toast({ title: 'Tasbeeh counter created' });
    },
    onError: () => toast({ title: 'Failed to create counter', variant: 'destructive' }),
  });

  const incrementMutation = useMutation({
    mutationFn: async (id: string) => {
      const counter = counters.find(c => c.id === id);
      if (!counter) throw new Error('Counter not found');
      const { error } = await supabase
        .from('tasbeeh_counters')
        .update({ current_count: counter.current_count + 1 })
        .eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['tasbeeh_counters'] });
      const prev = queryClient.getQueryData<TasbeehCounter[]>(['tasbeeh_counters', user?.id]);
      queryClient.setQueryData<TasbeehCounter[]>(['tasbeeh_counters', user?.id], old =>
        old?.map(c => c.id === id ? { ...c, current_count: c.current_count + 1 } : c)
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) queryClient.setQueryData(['tasbeeh_counters', user?.id], context.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tasbeeh_counters'] }),
  });

  const resetMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasbeeh_counters')
        .update({ current_count: 0 })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasbeeh_counters'] });
      toast({ title: 'Counter reset' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, title, target_count }: { id: string; title?: string; target_count?: number | null }) => {
      const { error } = await supabase
        .from('tasbeeh_counters')
        .update({ title: title || null, target_count: target_count ?? null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasbeeh_counters'] });
      toast({ title: 'Counter updated' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasbeeh_counters')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasbeeh_counters'] });
      toast({ title: 'Counter removed' });
    },
  });

  return {
    counters,
    isLoading,
    createCounter: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    incrementCounter: incrementMutation.mutate,
    resetCounter: resetMutation.mutateAsync,
    updateCounter: updateMutation.mutateAsync,
    deleteCounter: deleteMutation.mutateAsync,
  };
}
