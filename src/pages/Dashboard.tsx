import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { MapPin, NavArrowRight, WarningCircle } from 'iconoir-react';
import { DateDisplay } from '@/components/calendar/DateDisplay';
import { useCalendar } from '@/contexts/CalendarContext';
import { DailyMeter } from '@/components/namaz/DailyMeter';
import { CurrentPrayerCard } from '@/components/namaz/CurrentPrayerCard';
import { usePrayerLog } from '@/hooks/usePrayerLog';
import { useMissedPrayers } from '@/hooks/useMissedPrayers';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { location, requestLocationPermission } = useCalendar();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState<string>('');
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);

  const { prayers, togglePrayer, percentage, completedCount, totalCount, currentPrayer, nextPrayer, isLoading: prayersLoading } = usePrayerLog();
  const { unfulfilledCount } = useMissedPrayers();

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

  const displayName = fullName || user?.email?.split('@')[0] || 'User';

  // Determine which prayer to show (current or next upcoming)
  const prayerToShow = currentPrayer || nextPrayer;

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
        {/* Date Display */}
        <div className="flex flex-col items-center space-y-4">
          <DateDisplay showLocation className="text-center" />
          {!location?.city && (
            <Button
              variant="outline"
              size="sm"
              onClick={requestLocationPermission}
              className="gap-2"
            >
              <MapPin className="h-4 w-4" />
              Set your location
            </Button>
          )}
        </div>

        {/* Greeting */}
        <h1 className="text-3xl font-bold tracking-tight font-display text-center">
          Assalamu Alaikum, {displayName}
        </h1>

        {/* Daily Meter */}
        <div className="p-6 border border-border rounded-xl bg-card">
          <DailyMeter percentage={percentage} />
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedCount} of {totalCount} prayers completed
            </span>
            {unfulfilledCount > 0 && (
              <span className="flex items-center gap-1 text-destructive">
                <WarningCircle className="h-3 w-3" />
                {unfulfilledCount} missed
              </span>
            )}
          </div>
        </div>

        {/* Current Prayer */}
        {prayerToShow && (
          <CurrentPrayerCard
            prayer={prayerToShow}
            onToggle={() => togglePrayer(prayerToShow.name)}
            label={currentPrayer ? 'Current Prayer' : 'Next Prayer'}
          />
        )}

        {/* View All Link */}
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => navigate('/namaz')}
        >
          <span>View all prayers</span>
          <NavArrowRight className="h-4 w-4" />
        </Button>

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
