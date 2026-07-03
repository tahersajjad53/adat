import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const ReaderSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 py-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-4/5 ml-auto" />
        </div>
      ))}
    </div>
  );
};
