import React from 'react';
import { Book } from 'iconoir-react';

const Dua: React.FC = () => {
  return (
    <div className="container py-16 max-w-xl mx-auto flex flex-col items-center justify-center text-center min-h-[60vh]">
      <div className="rounded-full bg-foreground/5 p-6 mb-5">
        <Book className="h-10 w-10 text-foreground/60" strokeWidth={1.5} />
      </div>
      <h1 className="font-display tracking-tight text-2xl font-normal mb-2">Dua</h1>
      <p className="text-muted-foreground text-sm max-w-xs">
        A collection of duas is coming soon.
      </p>
    </div>
  );
};

export default Dua;
