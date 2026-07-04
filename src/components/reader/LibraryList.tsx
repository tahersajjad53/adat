import React, { useMemo, useState } from 'react';
import { Book } from 'iconoir-react';
import { useTextsLibrary } from '@/hooks/useTextsLibrary';
import { LibraryCard } from './LibraryCard';
import { LibrarySkeleton } from './LibrarySkeleton';

export const LibraryList: React.FC = () => {
  const { data: groups, isLoading, error } = useTextsLibrary();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => (groups ?? []).map((g) => g.category), [groups]);

  const visibleItems = useMemo(() => {
    if (!groups) return [];
    const source = activeCategory
      ? groups.filter((g) => g.category === activeCategory)
      : groups;
    return source.flatMap((g) => g.items);
  }, [groups, activeCategory]);

  if (isLoading) return <LibrarySkeleton />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">
          We couldn't load the library. Please try again.
        </p>
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16">
        <div className="rounded-full bg-foreground/5 p-5 mb-4">
          <Book className="h-8 w-8 text-foreground/50" strokeWidth={1.5} />
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">
          No texts available yet. New surahs and duas will appear here as they're added.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              activeCategory === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setActiveCategory(activeCategory === cat ? null : cat)
              }
              className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {visibleItems.map((text) => (
          <LibraryCard key={text.id} text={text} />
        ))}
      </div>
    </div>
  );
};
