import React, { useEffect, useState } from 'react';
import { Search, Xmark } from 'iconoir-react';
import { LibraryList } from '@/components/reader/LibraryList';
import { SearchResults } from '@/components/reader/SearchResults';
import { useTextSearch } from '@/hooks/useTextSearch';

const Dua: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Listen for header search toggle
  useEffect(() => {
    const handler = () => {
      setSearchOpen((open) => {
        if (open) setQuery('');
        return !open;
      });
    };
    window.addEventListener('dua:toggleSearch', handler);
    return () => window.removeEventListener('dua:toggleSearch', handler);
  }, []);

  // Debounce query
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query), 200);
    return () => window.clearTimeout(t);
  }, [query]);

  const shouldSearch = searchOpen && debouncedQuery.trim().length >= 2;
  const { data: results, isLoading, limitReached } = useTextSearch(shouldSearch ? debouncedQuery : '');

  return (
    <div className="container py-6 max-w-2xl mx-auto">
      {searchOpen && (
        <div className="mb-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              strokeWidth={2}
            />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search transliteration…"
              className="w-full h-11 pl-9 pr-9 rounded-full bg-secondary text-foreground placeholder:text-muted-foreground border border-border/50 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <Xmark className="h-4 w-4" strokeWidth={2} />
              </button>
            )}
          </div>
          {debouncedQuery.trim().length > 0 && debouncedQuery.trim().length < 2 && (
            <p className="mt-2 text-xs text-muted-foreground text-center">
              Keep typing…
            </p>
          )}
        </div>
      )}

      {shouldSearch ? (
        <SearchResults
          query={debouncedQuery}
          results={results ?? []}
          isLoading={isLoading}
          limitReached={limitReached}
        />
      ) : (
        <LibraryList />
      )}
    </div>
  );
};

export default Dua;
