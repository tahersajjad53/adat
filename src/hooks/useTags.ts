import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface TagOption {
  value: string;       // slug stored on goals.tag
  label: string;
  isPersonal: boolean;
  id?: string;         // tag row id (personal tags only, used for delete/rename)
}

/** Fetches active tags for use in the goal form: admin/global tags + the user's personal tags. */
export function useTags() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('id, slug, label, sort_order, user_id, created_at')
        .eq('is_active', true)
        .order('user_id', { ascending: true, nullsFirst: true })
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []).map((t) => ({
        value: t.slug,
        label: t.label,
        isPersonal: t.user_id !== null,
        id: t.id,
      })) as TagOption[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const createPersonalTag = useMutation({
    mutationFn: async (label: string) => {
      if (!user) throw new Error('Not signed in');
      const cleaned = label.trim();
      if (!cleaned) throw new Error('Tag name is required');
      if (cleaned.length > 24) throw new Error('Keep it under 24 characters');
      // Opaque slug guarantees no collision with admin or other users' tags.
      const rand =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID().slice(0, 8)
          : Math.random().toString(36).slice(2, 10);
      const slug = `u:${rand}`;
      const { data, error } = await supabase
        .from('tags')
        .insert({ label: cleaned, slug, user_id: user.id, sort_order: 0 })
        .select('id, slug, label, user_id')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (err: Error) => {
      toast({
        title: 'Could not create tag',
        description: err.message.includes('duplicate')
          ? 'You already have a tag with that name.'
          : err.message,
        variant: 'destructive',
      });
    },
  });

  const renamePersonalTag = useMutation({
    mutationFn: async ({ id, label }: { id: string; label: string }) => {
      const cleaned = label.trim();
      if (!cleaned) throw new Error('Tag name is required');
      if (cleaned.length > 24) throw new Error('Keep it under 24 characters');
      const { error } = await supabase.from('tags').update({ label: cleaned }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (err: Error) => {
      toast({
        title: 'Could not rename tag',
        description: err.message.includes('duplicate')
          ? 'You already have a tag with that name.'
          : err.message,
        variant: 'destructive',
      });
    },
  });

  const deletePersonalTag = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tags').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: 'Tag deleted' });
    },
    onError: (err: Error) => {
      toast({ title: 'Could not delete tag', description: err.message, variant: 'destructive' });
    },
  });

  return {
    tags,
    isLoading,
    createPersonalTag: (label: string) => createPersonalTag.mutateAsync(label),
    renamePersonalTag: (id: string, label: string) =>
      renamePersonalTag.mutateAsync({ id, label }),
    deletePersonalTag: (id: string) => deletePersonalTag.mutateAsync(id),
    isCreating: createPersonalTag.isPending,
  };
}
