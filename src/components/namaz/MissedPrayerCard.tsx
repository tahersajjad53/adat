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
      className="flex items-center justify-between py-3 separator-dotted last:border-b-0 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'font-display font-semibold text-base',
              prayer.isFulfilled && 'line-through text-muted-foreground'
            )}
          >
            {prayer.displayName}
          </span>
          {prayer.isFulfilled && (
            <Check className="h-4 w-4 text-primary shrink-0" />
          )}
        </div>
        
        {prayer.isFulfilled && prayer.qazaCompletedAt && (
          <p className="text-xs text-primary mt-1">
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
          Ada
        </Button>
      )}
    </div>
  );
};
