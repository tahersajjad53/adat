import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateDisplay } from '@/components/calendar/DateDisplay';
import { DailyMeter } from '@/components/namaz/DailyMeter';
import { PrayerList } from '@/components/namaz/PrayerList';
import { MissedPrayersList } from '@/components/namaz/MissedPrayersList';
import { usePrayerLog } from '@/hooks/usePrayerLog';
import { useMissedPrayers } from '@/hooks/useMissedPrayers';
import { Clock, WarningCircle } from 'iconoir-react';

const Namaz: React.FC = () => {
  const { prayers, togglePrayer, percentage, isLoading: prayersLoading } = usePrayerLog();
  const { missedPrayers, unfulfilledCount, fulfillPrayer, isLoading: missedLoading } = useMissedPrayers();

  return (
    <div className="container py-6 max-w-xl mx-auto space-y-6">
      {/* Date Display */}
      <DateDisplay showLocation className="text-center" />

      {/* Daily Meter */}
      <DailyMeter percentage={percentage} />

      {/* Tabs */}
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="today">
            <Clock className="h-4 w-4" />
            Today's Namaz
          </TabsTrigger>
          <TabsTrigger value="missed">
            <WarningCircle className="h-4 w-4" />
            Missed Namaz
            {unfulfilledCount > 0 && (
              <span className="ml-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-semibold text-destructive-foreground">
                {unfulfilledCount > 99 ? '99+' : unfulfilledCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-6">
          <PrayerList
            prayers={prayers}
            onToggle={togglePrayer}
            isLoading={prayersLoading}
          />
        </TabsContent>

        <TabsContent value="missed" className="mt-6">
          <MissedPrayersList
            prayers={missedPrayers}
            onFulfill={fulfillPrayer}
            isLoading={missedLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Namaz;
