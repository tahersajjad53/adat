import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateDisplay } from '@/components/calendar/DateDisplay';
import { DailyMeter } from '@/components/namaz/DailyMeter';
import { TimeOfDayCard } from '@/components/namaz/TimeOfDayCard';
import { PrayerList } from '@/components/namaz/PrayerList';
import { MissedPrayersList } from '@/components/namaz/MissedPrayersList';
import { usePrayerLog } from '@/hooks/usePrayerLog';
import { useMissedPrayers } from '@/hooks/useMissedPrayers';
import { usePrayerTimes, getCurrentPrayerWindow } from '@/hooks/usePrayerTimes';
import { useTodayProgress } from '@/hooks/useTodayProgress';
import { Clock, WarningCircle } from 'iconoir-react';

const Namaz: React.FC = () => {
  const { prayers, togglePrayer, isLoading: prayersLoading } = usePrayerLog();
  const { overallPercentage } = useTodayProgress(prayers, prayersLoading);
  const { missedPrayers, unfulfilledCount, fulfillPrayer, isLoading: missedLoading } = useMissedPrayers();
  const { prayerTimes } = usePrayerTimes();
  
  const currentPrayerWindow = prayerTimes ? getCurrentPrayerWindow(prayerTimes) : null;
  const currentPrayer = currentPrayerWindow?.current || null;

  return (
    <div className="container py-8 max-w-xl mx-auto space-y-8">
      {/* Time-aware visual header card */}
      <TimeOfDayCard currentPrayer={currentPrayer}>
        <div className="flex items-start justify-between">
          <DateDisplay showLocation compact variant="light" />
          <DailyMeter percentage={overallPercentage} compact variant="light" />
        </div>
      </TimeOfDayCard>

      {/* Tabs */}
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-full h-11">
          <TabsTrigger value="today" className="rounded-full">
            <Clock className="h-4 w-4" />
            Today's Namaz
          </TabsTrigger>
          <TabsTrigger value="missed" className="rounded-full">
            <WarningCircle className="h-4 w-4" />
            Qaza
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
