import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { findMatch, normalizeTranslit, type MatchTier } from '@/lib/translitSearch';

const SHOW_UNVERIFIED = import.meta.env.DEV;
const RESULT_LIMIT = 50;
const FETCH_LIMIT = 5000;

export interface SearchHit {
  id: string;
  textId: string;
  textTitle: string;
  lineNo: number;
  snippet: string;
  tier: MatchTier;
}

interface LibraryRow {
  id: string;
  text_id: string;
  line_no: number;
  transliteration: string;
  textTitle: string;
}

/**
 * Fetch every transliterated line once and cache. Small payload today; if the
 * library grows we can switch to a server-side skeleton column.
 */
function useLibraryRows() {
  return useQuery({
    queryKey: ['text-search-library', SHOW_UNVERIFIED],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<LibraryRow[]> => {
      let q = supabase
        .from('text_lines')
        .select('id, text_id, line_no, transliteration, texts!inner(title, verified)')
        .not('transliteration', 'is', null)
        .order('line_no', { ascending: true })
        .limit(FETCH_LIMIT);

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
          text_id: r.text_id,
          line_no: r.line_no,
          transliteration: r.transliteration!,
          textTitle: r.texts!.title!,
        }));
    },
  });
}

export function useTextSearch(query: string) {
  const normalized = normalizeTranslit(query);
  const enabled = normalized.length >= 2;

  const library = useLibraryRows();

  const results = useMemo<SearchHit[]>(() => {
    if (!enabled || !library.data) return [];

    const hits: SearchHit[] = [];
    for (const row of library.data) {
      const m = findMatch(row.transliteration, query);
      if (!m) continue;
      hits.push({
        id: row.id,
        textId: row.text_id,
        textTitle: row.textTitle,
        lineNo: row.line_no,
        snippet: row.transliteration,
        tier: m.tier,
      });
    }

    // Exact matches before fuzzy, then by text title, then by line number.
    hits.sort((a, b) => {
      if (a.tier !== b.tier) return a.tier === 'exact' ? -1 : 1;
      const t = a.textTitle.localeCompare(b.textTitle);
      if (t !== 0) return t;
      return a.lineNo - b.lineNo;
    });

    return hits;
  }, [enabled, library.data, query]);

  const capped = results.slice(0, RESULT_LIMIT);

  return {
    data: enabled ? capped : ([] as SearchHit[]),
    isLoading: enabled && library.isLoading,
    isError: library.isError,
    error: library.error,
    limitReached: results.length > RESULT_LIMIT,
    totalMatches: results.length,
  };
}
