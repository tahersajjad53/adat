import React from 'react';
import { PrayerCard } from './PrayerCard';
import { PrayerStatus } from '@/hooks/usePrayerLog';
import { AllPrayerName } from '@/hooks/usePrayerTimes';
import { Skeleton } from '@/components/ui/skeleton';

interface PrayerListProps {
  prayers: PrayerStatus[];
  onToggle: (prayer: AllPrayerName) => void;
  isLoading?: boolean;
  compact?: boolean;
}

export const PrayerList: React.FC<PrayerListProps> = ({
  prayers,
  onToggle,
  isLoading = false,
  compact = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {prayers.map((prayer) => (
        <PrayerCard
          key={prayer.name}
          name={prayer.name}
          displayName={prayer.displayName}
          time={prayer.time}
          status={prayer.status}
          isCompleted={prayer.isCompleted}
          onToggle={() => onToggle(prayer.name)}
          compact={compact}
          isOptional={prayer.isOptional}
          hijriDate={prayer.hijriDate}
        />
      ))}
    </div>
  );
};
