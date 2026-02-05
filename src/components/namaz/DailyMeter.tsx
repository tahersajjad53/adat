import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface DailyMeterProps {
  percentage: number;
  className?: string;
  showMessage?: boolean;
  compact?: boolean;
}

const ENCOURAGEMENT_MESSAGES: Record<number, string> = {
  0: 'Start your day with Fajr',
  20: 'Great start! Keep going',
  40: "You're on track",
  60: 'More than halfway there!',
  80: 'Almost complete!',
  100: 'Masha\'Allah! All prayers complete!',
};

function getEncouragementMessage(percentage: number): string {
  if (percentage === 100) return ENCOURAGEMENT_MESSAGES[100];
  if (percentage >= 80) return ENCOURAGEMENT_MESSAGES[80];
  if (percentage >= 60) return ENCOURAGEMENT_MESSAGES[60];
  if (percentage >= 40) return ENCOURAGEMENT_MESSAGES[40];
  if (percentage >= 20) return ENCOURAGEMENT_MESSAGES[20];
  return ENCOURAGEMENT_MESSAGES[0];
}

export const DailyMeter: React.FC<DailyMeterProps> = ({
  percentage,
  className,
  showMessage = true,
  compact = false,
}) => {
  const message = getEncouragementMessage(percentage);

  if (compact) {
    return (
      <div className={cn('flex flex-col items-end', className)}>
        <span className="text-3xl font-bold font-display text-foreground">
          {percentage}%
        </span>
        <span className="text-xs text-muted-foreground">Daily Progress</span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-baseline justify-between">
        <span className="text-5xl font-bold tracking-tight font-display text-foreground">
          {percentage}%
        </span>
        <span className="text-sm text-muted-foreground">Daily Progress</span>
      </div>
      
      <Progress 
        value={percentage} 
        className="h-3"
      />
      
      {showMessage && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
};
