import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type TextLine = Database['public']['Tables']['text_lines']['Row'];

/**
 * Fetches every line of a text, ordered by line_no.
 *
 * IMPORTANT: `arabic_text` must be rendered verbatim — no normalization,
 * trimming, or character substitutions. Ayah markers are rendered as
 * sibling elements by the reader, never concatenated into this string.
 */
export function useTextLines(textId: string | undefined) {
  return useQuery({
    queryKey: ['text-lines', textId],
    queryFn: async (): Promise<TextLine[]> => {
      const { data, error } = await supabase
        .from('text_lines')
        .select('*')
        .eq('text_id', textId!)
        .order('line_no', { ascending: true });
      if (error) throw error;
      return (data ?? []) as TextLine[];
    },
    enabled: !!textId,
    staleTime: 10 * 60 * 1000,
  });
}
