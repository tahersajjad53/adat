import React from 'react';
import { cn } from '@/lib/utils';
import { AllPrayerName } from '@/hooks/usePrayerTimes';

interface TimeOfDayCardProps {
  currentPrayer: AllPrayerName | null;
  children: React.ReactNode;
  className?: string;
}

const GRADIENT_CLASSES: Record<AllPrayerName | 'default', string> = {
  fajr: 'gradient-fajr',
  dhuhr: 'gradient-zuhr',
  asr: 'gradient-asr',
  maghrib: 'gradient-maghrib',
  isha: 'gradient-isha',
  nisfulLayl: 'gradient-nisful-layl',
  default: 'gradient-fajr',
};

export const TimeOfDayCard: React.FC<TimeOfDayCardProps> = ({
  currentPrayer,
  children,
  className,
}) => {
  const gradientClass = currentPrayer 
    ? GRADIENT_CLASSES[currentPrayer] 
    : GRADIENT_CLASSES.default;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl p-5',
        gradientClass,
        className
      )}
    >
      <div>
        {children}
      </div>
    </div>
  );
};
