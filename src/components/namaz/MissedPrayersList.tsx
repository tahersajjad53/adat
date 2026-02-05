import React, { useState } from 'react';
import { MissedPrayerCard } from './MissedPrayerCard';
import { MissedPrayer } from '@/hooks/useMissedPrayers';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

interface MissedPrayersListProps {
  prayers: MissedPrayer[];
  onFulfill: (prayerId: string) => void;
  isLoading?: boolean;
}

export const MissedPrayersList: React.FC<MissedPrayersListProps> = ({
  prayers,
  onFulfill,
  isLoading = false,
}) => {
  const [showFulfilled, setShowFulfilled] = useState(true);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const filteredPrayers = showFulfilled
    ? prayers
    : prayers.filter((p) => !p.isFulfilled);

  const unfulfilledCount = prayers.filter((p) => !p.isFulfilled).length;
  const fulfilledCount = prayers.filter((p) => p.isFulfilled).length;

  if (prayers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">No missed prayers!</p>
        <p className="text-sm mt-1">Keep up the great work</p>
      </div>
    );
  }

  // Group prayers by date
  const groupedPrayers = filteredPrayers.reduce((groups, prayer) => {
    const dateKey = prayer.gregorianDate.toISOString().split('T')[0];
    if (!groups[dateKey]) {
      groups[dateKey] = {
        hijriDisplay: prayer.hijriDisplay,
        gregorianDisplay: prayer.gregorianDisplay,
        prayers: [],
      };
    }
    groups[dateKey].prayers.push(prayer);
    return groups;
  }, {} as Record<string, { hijriDisplay: string; gregorianDisplay: string; prayers: MissedPrayer[] }>);

  const dateKeys = Object.keys(groupedPrayers).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Filter controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {unfulfilledCount > 0 ? (
            <span>{unfulfilledCount} unfulfilled</span>
          ) : (
            <span>All prayers fulfilled!</span>
          )}
          {fulfilledCount > 0 && (
            <span className="ml-2">• {fulfilledCount} fulfilled</span>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFulfilled(!showFulfilled)}
          className="gap-2"
        >
          <Filter className="h-3 w-3" />
          {showFulfilled ? 'Hide fulfilled' : 'Show all'}
        </Button>
      </div>

      {/* Grouped list */}
      {dateKeys.map((dateKey) => {
        const group = groupedPrayers[dateKey];
        return (
          <div key={dateKey} className="space-y-3">
            <div className="sticky top-0 bg-background py-2 border-b border-border">
              <h3 className="font-medium">{group.hijriDisplay}</h3>
              <p className="text-xs text-muted-foreground">{group.gregorianDisplay}</p>
            </div>
            
            <div className="space-y-2">
              {group.prayers.map((prayer) => (
                <MissedPrayerCard
                  key={prayer.id}
                  prayer={prayer}
                  onFulfill={() => onFulfill(prayer.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
