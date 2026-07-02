import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type TextRow = Database['public']['Tables']['texts']['Row'];
export type TextType = 'quran' | 'dua';

export interface LibraryText extends TextRow {
  type: TextType;
}

export interface LibraryGroup {
  category: string;
  items: LibraryText[];
}

/**
 * Show unverified texts in dev only. Flip Yaseen's `verified` flag to `true`
 * in Supabase before Phase 2 ships publicly.
 */
const SHOW_UNVERIFIED = import.meta.env.DEV;

/** Fetches all reader texts, filtered to verified rows in production, grouped by category. */
export function useTextsLibrary() {
  return useQuery({
    queryKey: ['texts-library', { showUnverified: SHOW_UNVERIFIED }],
    queryFn: async (): Promise<LibraryGroup[]> => {
      let query = supabase
        .from('texts')
        .select('*')
        .order('type', { ascending: true })
        .order('surah', { ascending: true, nullsFirst: false })
        .order('title', { ascending: true });

      if (!SHOW_UNVERIFIED) query = query.eq('verified', true);

      const { data, error } = await query;
      if (error) throw error;

      const rows = (data ?? []) as LibraryText[];
      const byCategory = new Map<string, LibraryText[]>();
      for (const row of rows) {
        const key = row.category ?? (row.type === 'quran' ? 'Quran' : 'Duas');
        if (!byCategory.has(key)) byCategory.set(key, []);
        byCategory.get(key)!.push(row);
      }
      return Array.from(byCategory.entries()).map(([category, items]) => ({
        category,
        items,
      }));
    },
    staleTime: 10 * 60 * 1000,
  });
}
