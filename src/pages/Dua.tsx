import React from 'react';
import { LibraryList } from '@/components/reader/LibraryList';

const Dua: React.FC = () => {
  return (
    <div className="container py-6 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="font-display tracking-tight text-3xl font-normal mb-1">
          Ibadat
        </h1>
        <p className="text-sm text-muted-foreground">
          Read and reflect.
        </p>
      </header>
      <LibraryList />
    </div>
  );
};

export default Dua;
