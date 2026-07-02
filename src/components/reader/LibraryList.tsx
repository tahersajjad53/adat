import React from 'react';
import { Book } from 'iconoir-react';
import { useTextsLibrary } from '@/hooks/useTextsLibrary';
import { LibraryCard } from './LibraryCard';
import { LibrarySkeleton } from './LibrarySkeleton';

export const LibraryList: React.FC = () => {
  const { data: groups, isLoading, error } = useTextsLibrary();

  if (isLoading) {
    return <LibrarySkeleton />;
  }

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
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.category} className="space-y-3">
          <h2 className="font-display tracking-tight text-xl font-normal">
            {group.category}
          </h2>
          <div className="space-y-3">
            {group.items.map((text) => (
              <LibraryCard key={text.id} text={text} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
