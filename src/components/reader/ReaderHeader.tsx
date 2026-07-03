import React from 'react';
import { Link } from 'react-router-dom';
import { NavArrowLeft } from 'iconoir-react';
import { ReaderPreferencesMenu } from './ReaderPreferencesMenu';

interface ReaderHeaderProps {
  title?: string | null;
  titleAr?: string | null;
}

export const ReaderHeader: React.FC<ReaderHeaderProps> = ({ title, titleAr }) => {
  return (
    <div className="sticky top-0 z-30 -mx-4 md:-mx-6 px-4 md:px-6 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="flex items-center gap-3 h-14 max-w-2xl mx-auto">
        <Link
          to="/dua"
          aria-label="Back to Library"
          className="h-9 w-9 -ml-2 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
        >
          <NavArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>
        <div className="min-w-0 flex-1 text-center">
          {title && (
            <div className="text-sm font-medium truncate leading-tight">
              {title}
            </div>
          )}
          {titleAr && (
            <div
              dir="rtl"
              lang="ar"
              className="arabic-body text-base text-muted-foreground leading-none"
            >
              {titleAr}
            </div>
          )}
        </div>
        <ReaderPreferencesMenu />
      </div>
    </div>
  );
};
