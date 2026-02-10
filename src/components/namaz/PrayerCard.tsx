import React, { useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Check, Clock, WarningCircle, HalfMoon } from 'iconoir-react';
import { AllPrayerName } from '@/hooks/usePrayerTimes';
import { HijriDate } from '@/lib/hijri';
import { useConfetti } from '@/components/ui/confetti';

interface PrayerCardProps {
  name: AllPrayerName;
  displayName: string;
  time: string;
  status: 'upcoming' | 'current' | 'completed' | 'missed';
  isCompleted: boolean;
  onToggle: () => void;
  compact?: boolean;
  isOptional?: boolean;
  hijriDate?: HijriDate | null;
}

export const PrayerCard: React.FC<PrayerCardProps> = ({
  name,
  displayName,
  time,
  status,
  isCompleted,
  onToggle,
  compact = false,
  isOptional = false,
  hijriDate,
}) => {
  const effectiveStatus = isOptional && status === 'missed' ? 'upcoming' : status;
  const checkboxRef = useRef<HTMLButtonElement>(null);
  const { triggerConfetti, ConfettiPortal } = useConfetti();

  const handleToggle = () => {
    if (!isCompleted) {
      triggerConfetti(checkboxRef.current);
    }
    onToggle();
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between py-4 separator-dotted last:border-b-0 transition-colors',
        status === 'current' && !isOptional && 'bg-primary/[0.03] -mx-4 px-4 rounded-xl',
      )}
    >
      <div className="flex items-center gap-4">
        <Checkbox
          ref={checkboxRef}
          id={`prayer-${name}`}
          checked={isCompleted}
          onCheckedChange={handleToggle}
          className="h-5 w-5"
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <label
              htmlFor={`prayer-${name}`}
              className={cn(
                'cursor-pointer font-display font-semibold',
                isCompleted && 'line-through text-muted-foreground',
                isOptional && !isCompleted && 'text-muted-foreground',
                compact ? 'text-base' : 'text-lg'
              )}
            >
              {displayName}
            </label>
            {isOptional && (
              <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground rounded-full">
                Optional
              </Badge>
            )}
          </div>
          {hijriDate && (
            <span className="text-xs text-muted-foreground">
              {hijriDate.day} {hijriDate.monthName}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium">{time}</span>
        {isCompleted && <Check className="h-4 w-4 text-primary" />}
        {!isCompleted && status === 'missed' && !isOptional && (
          <WarningCircle className="h-4 w-4 text-destructive" />
        )}
      </div>
      <ConfettiPortal />
    </div>
  );
};
