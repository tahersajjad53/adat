import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { DateDisplay } from '@/components/calendar/DateDisplay';
import { DailyMeter } from '@/components/namaz/DailyMeter';
import { PrayerList } from '@/components/namaz/PrayerList';
import { MissedPrayersList } from '@/components/namaz/MissedPrayersList';
import { usePrayerLog } from '@/hooks/usePrayerLog';
import { useMissedPrayers } from '@/hooks/useMissedPrayers';
import adatLogo from '@/assets/adat-logo.svg';

const Namaz: React.FC = () => {
  const navigate = useNavigate();
  const { prayers, togglePrayer, percentage, isLoading: prayersLoading } = usePrayerLog();
  const { missedPrayers, unfulfilledCount, fulfillPrayer, isLoading: missedLoading } = useMissedPrayers();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <img src={adatLogo} alt="Adat" className="h-6 w-auto" />
          </div>
          <h1 className="text-lg font-semibold">Namaz Tracker</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-6 max-w-xl mx-auto space-y-6">
        {/* Date Display */}
        <DateDisplay showLocation className="text-center" />

        {/* Daily Meter */}
        <DailyMeter percentage={percentage} />

        {/* Tabs */}
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today">Today's Prayers</TabsTrigger>
            <TabsTrigger value="missed" className="relative">
              Missed Prayers
              {unfulfilledCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
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
      </main>
    </div>
  );
};

export default Namaz;
