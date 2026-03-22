import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { useQazaMonitoring } from '@/hooks/useQazaMonitoring';

const Namaz: React.FC = () => {
  const { prayers, togglePrayer, isLoading: prayersLoading } = usePrayerLog();
  const { overallPercentage } = useTodayProgress(prayers, prayersLoading);
  const { missedPrayers, unfulfilledCount, fulfillPrayer, clearAllQaza, isLoading: missedLoading } = useMissedPrayers();
  const { prayerTimes } = usePrayerTimes();
  const { qazaMonitoringEnabled } = useQazaMonitoring();
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  
  const currentPrayerWindow = prayerTimes ? getCurrentPrayerWindow(prayerTimes) : null;
  const currentPrayer = currentPrayerWindow?.current || null;

  // Dispatch menu items to AppLayout header via custom event
  const handleClearQaza = useCallback(() => {
    setClearConfirmOpen(true);
  }, []);

  useEffect(() => {
    if (qazaMonitoringEnabled) {
      window.dispatchEvent(new CustomEvent('namaz:menuChanged', {
        detail: {
          items: [{
            label: 'Clear Qaza Namaz',
            disabled: unfulfilledCount === 0,
            action: handleClearQaza,
          }],
        },
      }));
    } else {
      window.dispatchEvent(new CustomEvent('namaz:menuChanged', { detail: { items: [] } }));
    }

    // Clear menu on unmount
    return () => {
      window.dispatchEvent(new CustomEvent('namaz:menuChanged', { detail: { items: [] } }));
    };
  }, [qazaMonitoringEnabled, unfulfilledCount, handleClearQaza]);

  return (
    <div className="container py-6 max-w-xl mx-auto space-y-6">
      {/* Time-aware visual header card */}
      <TimeOfDayCard currentPrayer={currentPrayer}>
        <div className="flex items-start justify-between">
          <DateDisplay showLocation compact variant="light" />
          <DailyMeter percentage={overallPercentage} compact variant="light" />
        </div>
      </TimeOfDayCard>

      {/* Tabs */}
      {qazaMonitoringEnabled ? (
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today">
              <Clock className="h-4 w-4" />
              Today's Namaz
            </TabsTrigger>
            <TabsTrigger value="missed">
              <WarningCircle className="h-4 w-4" />
              Qaza Namaz
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
      ) : (
        <div className="mt-6">
          <PrayerList
            prayers={prayers}
            onToggle={togglePrayer}
            isLoading={prayersLoading}
          />
        </div>
      )}

      {/* Clear Qaza confirmation dialog */}
      <AlertDialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Qaza Namaz?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark all {unfulfilledCount} missed prayers as completed. New missed prayers will continue to appear going forward.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await clearAllQaza();
                setClearConfirmOpen(false);
              }}
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Namaz;
