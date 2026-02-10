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
import { usePrayerTimes, getCurrentPrayerWindow, AllPrayerName } from '@/hooks/usePrayerTimes';
import { useTodayProgress } from '@/hooks/useTodayProgress';
import { useGoalCompletions } from '@/hooks/useGoalCompletions';
import { DueRemindersCard } from '@/components/dues/DueRemindersCard';
import TodaysGoals from '@/components/goals/TodaysGoals';
import { useOverdueGoals } from '@/hooks/useOverdueGoals';

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
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);

  const { prayers, togglePrayer, currentPrayer, nextPrayer, isLoading: prayersLoading } = usePrayerLog();
  const { prayerTimes } = usePrayerTimes();
  const { isCompleted, toggleCompletion, isToggling } = useGoalCompletions();
  const { overdueGoals, completeOverdue, isCompletingOverdue } = useOverdueGoals();
  const {
    prayerCompleted, prayerTotal,
    goalsCompleted, goalsTotal, goalsDueToday,
    overallPercentage,
  } = useTodayProgress(prayers, prayersLoading);

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

  const prayerToShow = currentPrayer || nextPrayer;
  const PrayerIcon = prayerToShow ? PRAYER_ICONS[prayerToShow.name] : SunLight;

  // Build breakdown label
  const breakdownParts: string[] = [`Prayers: ${prayerCompleted}/${prayerTotal}`];
  if (goalsTotal > 0) {
    breakdownParts.push(`Goals: ${goalsCompleted}/${goalsTotal}`);
  }
  const breakdownLabel = breakdownParts.join(' · ');

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
          <div className="flex items-start justify-between">
            <DateDisplay showLocation compact variant="light" />
            <DailyMeter percentage={overallPercentage} compact variant="light" />
          </div>

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

          {/* Striped progress bar */}
          <div className="mt-3 mb-4 h-2 w-full rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${overallPercentage}%`,
                backgroundColor: 'hsl(75, 70%, 55%)',
                backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(255,255,255,0.2) 3px, rgba(255,255,255,0.2) 6px)',
              }}
            />
          </div>

          {prayerToShow ? (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
                  {currentPrayer ? 'Current Namaz' : 'Next Namaz'}
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <div className="rounded-full p-2 bg-white/20">
                    <PrayerIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white font-display">
                      {prayerToShow.displayName}
                    </h3>
                    <span className="text-sm text-white/80">{prayerToShow.time}</span>
                  </div>
                </div>
              </div>

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
          ) : overallPercentage === 100 ? (
            <p className="text-white/80 text-sm font-medium">Masha'Allah! All done for today.</p>
          ) : (
            <p className="text-white/70 text-sm">No prayer information available</p>
          )}
        </TimeOfDayCard>

        {/* Dues Reminders - only shows when there are active reminders */}
        <DueRemindersCard />

        {/* Today's Goals */}
        <TodaysGoals
          goalsDueToday={goalsDueToday}
          goalsCompleted={goalsCompleted}
          goalsTotal={goalsTotal}
          isCompleted={isCompleted}
          onToggle={toggleCompletion}
          isToggling={isToggling}
          overdueGoals={overdueGoals}
          onCompleteOverdue={completeOverdue}
          isCompletingOverdue={isCompletingOverdue}
        />
      </div>
    </div>
  );
};

export default Dashboard;
