import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import type { LibraryText } from '@/hooks/useTextsLibrary';

interface LibraryCardProps {
  text: LibraryText;
}

export const LibraryCard: React.FC<LibraryCardProps> = ({ text }) => {
  return (
    <Link
      to={`/dua/${text.id}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
    >
      <Card className="p-4 flex items-center justify-between gap-4 transition-colors hover:bg-muted/40">
        <div className="min-w-0 flex-1">
          <h3 className="font-display tracking-tight text-lg font-normal truncate">
            {text.title}
          </h3>
          {text.source_kitab && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {text.source_kitab}
            </p>
          )}
        </div>
        {text.title_ar && (
          <span
            dir="rtl"
            lang="ar"
            className="arabic-body text-2xl text-foreground/80 shrink-0"
          >
            {text.title_ar}
          </span>
        )}
      </Card>
    </Link>
  );
};

