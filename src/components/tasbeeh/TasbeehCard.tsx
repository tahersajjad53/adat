import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash } from 'iconoir-react';
import { Progress } from '@/components/ui/progress';
import type { TasbeehCounter } from '@/hooks/useTasbeehCounters';

interface TasbeehCardProps {
  counter: TasbeehCounter;
  onDelete: (id: string) => void;
}

export function TasbeehCard({ counter, onDelete }: TasbeehCardProps) {
  const navigate = useNavigate();
  const percentage = counter.target_count
    ? Math.min(100, (counter.current_count / counter.target_count) * 100)
    : null;

  return (
    <div
      onClick={() => navigate(`/tasbeeh/${counter.id}`)}
      className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card cursor-pointer hover:bg-accent/50 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-card-foreground truncate">
          {counter.title || 'Tasbeeh'}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {counter.current_count}
          {counter.target_count ? ` / ${counter.target_count}` : ' counted'}
        </p>
        {percentage !== null && (
          <Progress value={percentage} className="h-1.5 mt-2" />
        )}
      </div>
      <button
        onClick={e => { e.stopPropagation(); onDelete(counter.id); }}
        className="p-2 text-muted-foreground hover:text-destructive transition-colors shrink-0"
      >
        <Trash className="h-4 w-4" />
      </button>
    </div>
  );
}
