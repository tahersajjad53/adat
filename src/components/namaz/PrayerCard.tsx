import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Check, Clock, WarningCircle, HalfMoon } from 'iconoir-react';
import { AllPrayerName } from '@/hooks/usePrayerTimes';

interface PrayerCardProps {
  name: AllPrayerName;
  displayName: string;
  time: string;
  status: 'upcoming' | 'current' | 'completed' | 'missed';
  isCompleted: boolean;
  onToggle: () => void;
  compact?: boolean;
  isOptional?: boolean;
}

const STATUS_STYLES = {
  upcoming: 'border-border bg-card',
  current: 'border-primary bg-primary/5 ring-1 ring-primary/20',
  completed: 'border-primary/50 bg-primary/10',
  missed: 'border-destructive/50 bg-destructive/5',
};

const STATUS_ICONS = {
  upcoming: Clock,
  current: Clock,
  completed: Check,
  missed: WarningCircle,
};

export const PrayerCard: React.FC<PrayerCardProps> = ({
  name,
  displayName,
  time,
  status,
  isCompleted,
  onToggle,
  compact = false,
  isOptional = false,
}) => {
  // For optional prayers, don't show missed status icon
  const effectiveStatus = isOptional && status === 'missed' ? 'upcoming' : status;
  const StatusIcon = isOptional ? HalfMoon : STATUS_ICONS[effectiveStatus];

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border p-4 transition-all',
        isOptional 
          ? 'border-border/50 bg-muted/30' 
          : STATUS_STYLES[status],
        compact && 'p-3'
      )}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          id={`prayer-${name}`}
          checked={isCompleted}
          onCheckedChange={onToggle}
          className="h-5 w-5"
        />
        <div className="flex items-center gap-2">
          <Label
            htmlFor={`prayer-${name}`}
            className={cn(
              'cursor-pointer font-medium',
              isCompleted && 'line-through text-muted-foreground',
              isOptional && !isCompleted && 'text-muted-foreground',
              compact ? 'text-sm' : 'text-base'
            )}
          >
            {displayName}
          </Label>
          {isOptional && (
            <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
              Optional
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{time}</span>
        <StatusIcon
          className={cn(
            'h-4 w-4',
            isOptional && 'text-muted-foreground/60',
            !isOptional && status === 'current' && 'text-primary',
            !isOptional && status === 'completed' && 'text-primary',
            !isOptional && status === 'missed' && 'text-destructive'
          )}
        />
      </div>
    </div>
  );
};
