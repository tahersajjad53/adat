import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Undo } from 'iconoir-react';
import { MissedPrayer } from '@/hooks/useMissedPrayers';

interface MissedPrayerCardProps {
  prayer: MissedPrayer;
  onFulfill: () => void;
}

export const MissedPrayerCard: React.FC<MissedPrayerCardProps> = ({
  prayer,
  onFulfill,
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border p-4 transition-all',
        prayer.isFulfilled
          ? 'border-primary/30 bg-primary/5'
          : 'border-destructive/30 bg-destructive/5'
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'font-medium',
              prayer.isFulfilled && 'line-through text-muted-foreground'
            )}
          >
            {prayer.displayName}
          </span>
          {prayer.isFulfilled && (
            <Check className="h-4 w-4 text-primary shrink-0" />
          )}
        </div>
        
        <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
          <p>{prayer.hijriDisplay}</p>
          <p className="text-xs">{prayer.gregorianDisplay}</p>
        </div>
        
        {prayer.isFulfilled && prayer.qazaCompletedAt && (
          <p className="text-xs text-primary mt-2">
            Fulfilled on {prayer.qazaCompletedAt.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        )}
      </div>

      {!prayer.isFulfilled && (
        <Button
          variant="outline"
          size="sm"
          onClick={onFulfill}
          className="shrink-0 gap-2"
        >
          <Undo className="h-3 w-3" />
          Make Up
        </Button>
      )}
    </div>
  );
};
