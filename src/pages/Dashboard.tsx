import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, SunLight, HalfMoon, Check } from 'iconoir-react';
import { DateDisplay } from '@/components/calendar/DateDisplay';
import { useCalendar } from '@/contexts/CalendarContext';
import { DailyMeter } from '@/components/namaz/DailyMeter';
import { TimeOfDayCard } from '@/components/namaz/TimeOfDayCard';
import { usePrayerLog } from '@/hooks/usePrayerLog';
import { useMissedPrayers } from '@/hooks/useMissedPrayers';
import { usePrayerTimes, getCurrentPrayerWindow, AllPrayerName } from '@/hooks/usePrayerTimes';

const PRAYER_ICONS: Record<AllPrayerName, React.ComponentType<{ className?: string }>> = {
  fajr: SunLight,
  dhuhr: SunLight,
  asr: SunLight,
  maghrib: HalfMoon,
  isha: HalfMoon,
  nisfulLayl: HalfMoon,
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { location, requestLocationPermission } = useCalendar();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState<string>('');
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);

  const { prayers, togglePrayer, percentage, completedCount, totalCount, currentPrayer, nextPrayer, isLoading: prayersLoading } = usePrayerLog();
  const { unfulfilledCount } = useMissedPrayers();
  const { prayerTimes } = usePrayerTimes();

  // Get current prayer window for theming
  const currentPrayerWindow = prayerTimes ? getCurrentPrayerWindow(prayerTimes) : null;
  const currentPrayerName = currentPrayerWindow?.current || null;

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, latitude')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching profile:', error);
          setNeedsOnboarding(true);
          return;
        }
        
        if (data) {
          if (data.full_name) {
            setFullName(data.full_name);
          }
          setNeedsOnboarding(data.latitude === null);
        } else {
          setNeedsOnboarding(true);
        }
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (needsOnboarding === true) {
      navigate('/auth/onboarding', { replace: true });
    }
  }, [needsOnboarding, navigate]);

  // Determine which prayer to show (current or next upcoming)
  const prayerToShow = currentPrayer || nextPrayer;
  const PrayerIcon = prayerToShow ? PRAYER_ICONS[prayerToShow.name] : SunLight;

  if (needsOnboarding === null) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Unified Time-Aware Card */}
        <TimeOfDayCard currentPrayer={currentPrayerName}>
          {/* Top row: Date + Progress */}
          <div className="flex items-start justify-between">
            <DateDisplay showLocation compact variant="light" />
            <DailyMeter percentage={percentage} compact variant="light" />
          </div>

          {/* Location prompt if needed */}
          {!location?.city && (
            <Button
              variant="outline"
              size="sm"
              onClick={requestLocationPermission}
              className="mt-3 gap-2 border-white/30 text-white hover:bg-white/10 hover:text-white"
            >
              <MapPin className="h-4 w-4" />
              Set your location
            </Button>
          )}

          {/* Divider */}
          <div className="my-4 border-t border-white/20" />

          {/* Next Namaz section */}
          {prayerToShow ? (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-white/70">
                  {currentPrayer ? 'Current Namaz' : 'Next Namaz'}
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <div className="rounded-full p-2 bg-white/20">
                    <PrayerIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white font-display">
                      {prayerToShow.displayName}
                    </h3>
                    <span className="text-sm text-white/80">{prayerToShow.time}</span>
                  </div>
                </div>
              </div>

              {/* Checkbox with completion indicator */}
              <div className="flex items-center gap-2">
                {prayerToShow.isCompleted && (
                  <div className="flex items-center gap-1 text-white/80 text-sm">
                    <Check className="h-4 w-4" />
                    <span>Done</span>
                  </div>
                )}
                <Checkbox
                  checked={prayerToShow.isCompleted}
                  onCheckedChange={() => togglePrayer(prayerToShow.name)}
                  className="h-6 w-6 border-white/50 data-[state=checked]:bg-white/30 data-[state=checked]:text-white"
                />
              </div>
            </div>
          ) : (
            <p className="text-white/70 text-sm">No prayer information available</p>
          )}
        </TimeOfDayCard>

        {/* Coming Soon Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 border border-border rounded-lg">
            <h3 className="font-semibold mb-2">Dues & Khumus</h3>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </div>
          <div className="p-6 border border-border rounded-lg">
            <h3 className="font-semibold mb-2">Goals & Habits</h3>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
