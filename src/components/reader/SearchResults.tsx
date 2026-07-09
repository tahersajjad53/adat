import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { findMatch } from '@/lib/translitSearch';
import type { SearchHit } from '@/hooks/useTextSearch';

interface SearchResultsProps {
  query: string;
  results: SearchHit[];
  isLoading: boolean;
  limitReached: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  results,
  isLoading,
  limitReached,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">
          No matches for "{query}".
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((hit) => {
        const parts = findMatch(hit.snippet, query);
        const isFuzzy = hit.tier === 'fuzzy';
        return (
          <Link
            key={hit.id}
            to={`/dua/${hit.textId}#verse-${hit.lineNo}`}
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
          >
            <Card className="p-4 transition-colors hover:bg-muted/40">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display tracking-tight text-base font-normal truncate">
                  {hit.textTitle}
                </h3>
                <div className="flex items-baseline gap-2 shrink-0">
                  {isFuzzy && (
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground/80 border border-border/60 rounded-full px-1.5 py-0.5">
                      similar
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Verse {hit.lineNo}
                  </span>
                </div>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground italic leading-snug line-clamp-2">
                {parts ? (
                  <>
                    {parts.before}
                    <span className="font-semibold text-foreground not-italic">
                      {parts.match}
                    </span>
                    {parts.after}
                  </>
                ) : (
                  hit.snippet
                )}
              </p>
            </Card>
          </Link>
        );
      })}
      {limitReached && (
        <p className="text-xs text-muted-foreground text-center pt-2">
          Showing the first 50 matches. Refine your search for fewer results.
        </p>
      )}
    </div>
  );
};
