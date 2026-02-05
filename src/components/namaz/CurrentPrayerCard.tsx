import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Clock, Check, SunLight, HalfMoon } from 'iconoir-react';
import { PrayerName } from '@/hooks/usePrayerTimes';

interface CurrentPrayerCardProps {
  prayer: {
    name: PrayerName;
    displayName: string;
    time: string;
    isCompleted: boolean;
    status: 'upcoming' | 'current' | 'completed' | 'missed';
  } | null;
  onToggle: () => void;
  label?: string;
}

const PRAYER_ICONS: Record<PrayerName, React.ComponentType<{ className?: string }>> = {
  fajr: SunLight,
  dhuhr: SunLight,
  asr: SunLight,
  maghrib: HalfMoon,
  isha: HalfMoon,
};

export const CurrentPrayerCard: React.FC<CurrentPrayerCardProps> = ({
  prayer,
  onToggle,
  label = 'Current Prayer',
}) => {
  if (!prayer) {
    return (
      <Card className="border-border">
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>No prayer information available</p>
        </CardContent>
      </Card>
    );
  }

  const PrayerIcon = PRAYER_ICONS[prayer.name];
  const isUpcoming = prayer.status === 'upcoming';

  return (
    <Card className={cn(
      'border-2 transition-all',
      prayer.isCompleted 
        ? 'border-primary/50 bg-primary/5' 
        : 'border-primary bg-gradient-to-br from-primary/10 to-primary/5'
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            {isUpcoming ? 'Next Prayer' : label}
          </span>
          {prayer.isCompleted && (
            <div className="flex items-center gap-1 text-primary text-sm">
              <Check className="h-4 w-4" />
              <span>Done</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              'rounded-full p-3',
              prayer.isCompleted ? 'bg-primary/20' : 'bg-primary/10'
            )}>
              <PrayerIcon className={cn(
                'h-6 w-6',
                prayer.isCompleted ? 'text-primary' : 'text-primary'
              )} />
            </div>
            
            <div>
              <h3 className={cn(
                'text-2xl font-bold font-display',
                prayer.isCompleted && 'text-muted-foreground line-through'
              )}>
                {prayer.displayName}
              </h3>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="text-sm">{prayer.time}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="current-prayer-toggle"
              checked={prayer.isCompleted}
              onCheckedChange={onToggle}
              className="h-6 w-6"
            />
            <Label 
              htmlFor="current-prayer-toggle" 
              className="text-sm cursor-pointer sr-only"
            >
              Mark as complete
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
