import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { PrayerName } from '@/hooks/usePrayerTimes';

interface PrayerCardProps {
  name: PrayerName;
  displayName: string;
  time: string;
  status: 'upcoming' | 'current' | 'completed' | 'missed';
  isCompleted: boolean;
  onToggle: () => void;
  compact?: boolean;
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
  missed: AlertCircle,
};

export const PrayerCard: React.FC<PrayerCardProps> = ({
  name,
  displayName,
  time,
  status,
  isCompleted,
  onToggle,
  compact = false,
}) => {
  const StatusIcon = STATUS_ICONS[status];

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border p-4 transition-all',
        STATUS_STYLES[status],
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
        <Label
          htmlFor={`prayer-${name}`}
          className={cn(
            'cursor-pointer font-medium',
            isCompleted && 'line-through text-muted-foreground',
            compact ? 'text-sm' : 'text-base'
          )}
        >
          {displayName}
        </Label>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{time}</span>
        <StatusIcon
          className={cn(
            'h-4 w-4',
            status === 'current' && 'text-primary',
            status === 'completed' && 'text-primary',
            status === 'missed' && 'text-destructive'
          )}
        />
      </div>
    </div>
  );
};
