import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Tag {
  id: string;
  label: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface TagInput {
  label: string;
  slug: string;
  sort_order?: number;
  is_active?: boolean;
}

export function useAdminTags() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['admin-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as Tag[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (input: TagInput) => {
      const maxOrder = tags.length > 0 ? Math.max(...tags.map((t) => t.sort_order)) + 1 : 0;
      const { error } = await supabase
        .from('tags')
        .insert({ ...input, sort_order: input.sort_order ?? maxOrder });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast({ title: 'Tag created' });
    },
    onError: (err: any) => {
      toast({ title: 'Error creating tag', description: err.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<TagInput> }) => {
      const { error } = await supabase
        .from('tags')
        .update(input)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast({ title: 'Tag updated' });
    },
    onError: (err: any) => {
      toast({ title: 'Error updating tag', description: err.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast({ title: 'Tag deleted' });
    },
    onError: (err: any) => {
      toast({ title: 'Error deleting tag', description: err.message, variant: 'destructive' });
    },
  });

  return {
    tags,
    isLoading,
    createTag: (input: TagInput) => createMutation.mutateAsync(input),
    updateTag: (id: string, input: Partial<TagInput>) => updateMutation.mutateAsync({ id, input }),
    deleteTag: (id: string) => deleteMutation.mutateAsync(id),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
