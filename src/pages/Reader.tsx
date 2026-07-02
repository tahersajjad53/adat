import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { NavArrowLeft } from 'iconoir-react';

/**
 * Phase 2 placeholder — full reader arrives in Phase 3.
 */
const Reader: React.FC = () => {
  const { textId } = useParams<{ textId: string }>();

  return (
    <div className="container py-10 max-w-2xl mx-auto">
      <Link
        to="/dua"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <NavArrowLeft className="h-4 w-4" strokeWidth={2} />
        Library
      </Link>
      <div className="text-center py-16">
        <h1 className="font-display tracking-tight text-2xl font-normal mb-2">
          Reader coming soon
        </h1>
        <p className="text-sm text-muted-foreground">
          The reading view is being built. Selected text: <code className="text-xs">{textId}</code>
        </p>
      </div>
    </div>
  );
};

export default Reader;
