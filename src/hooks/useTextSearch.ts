import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { normalizeTranslit } from '@/lib/translitSearch';

const SHOW_UNVERIFIED = import.meta.env.DEV;
const RESULT_LIMIT = 50;

export interface SearchHit {
  id: string;
  textId: string;
  textTitle: string;
  lineNo: number;
  snippet: string;
}

/**
 * Search text_lines.transliteration for a substring match.
 * Query is normalized (diacritics/punct stripped, lowercased). Because we
 * can't normalize the DB column inside a plain ilike, we fall back to matching
 * on the raw lowercased query — good enough for the plain-Latin transliteration
 * used across the library.
 */
export function useTextSearch(query: string) {
  const normalized = normalizeTranslit(query);
  const enabled = normalized.length >= 2;

  return useQuery({
    queryKey: ['text-search', normalized, SHOW_UNVERIFIED],
    enabled,
    staleTime: 60 * 1000,
    queryFn: async (): Promise<SearchHit[]> => {
      let q = supabase
        .from('text_lines')
        .select('id, text_id, line_no, transliteration, texts!inner(title, verified)')
        .not('transliteration', 'is', null)
        .ilike('transliteration', `%${normalized}%`)
        .order('line_no', { ascending: true })
        .limit(RESULT_LIMIT);

      if (!SHOW_UNVERIFIED) {
        q = q.eq('texts.verified', true);
      }

      const { data, error } = await q;
      if (error) throw error;

      const rows = (data ?? []) as Array<{
        id: string;
        text_id: string;
        line_no: number;
        transliteration: string | null;
        texts: { title: string | null; verified: boolean | null } | null;
      }>;

      return rows
        .filter((r) => r.transliteration && r.texts?.title)
        .map((r) => ({
          id: r.id,
          textId: r.text_id,
          textTitle: r.texts!.title!,
          lineNo: r.line_no,
          snippet: r.transliteration!,
        }));
    },
  });
}
