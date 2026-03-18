import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TagOption {
  value: string;
  label: string;
}

/** Fetches active tags for use in the goal form. */
export function useTags() {
  const { user } = useAuth();

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('slug, label')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data as { slug: string; label: string }[]).map((t) => ({
        value: t.slug,
        label: t.label,
      })) as TagOption[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  return { tags, isLoading };
}
