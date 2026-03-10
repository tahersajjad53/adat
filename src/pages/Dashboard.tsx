import React, { useEffect, useMemo, useState } from 'react';
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
import { useGoals } from '@/hooks/useGoals';
import { useTags } from '@/hooks/useTags';

import TodaysGoals from '@/components/goals/TodaysGoals';
import GoalFormSheet from '@/components/goals/GoalFormSheet';
import { useOverdueGoals } from '@/hooks/useOverdueGoals';
import { useDynamicGoals } from '@/hooks/useDynamicGoals';
import { useAdminGoalCompletions } from '@/hooks/useAdminGoalCompletions';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTasbeehCounters } from '@/hooks/useTasbeehCounters';
import { TasbeehCard } from '@/components/tasbeeh/TasbeehCard';
import type { Goal, GoalWithStatus } from '@/types/goals';
import WhatsNewPopup from '@/components/WhatsNewPopup';

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
  const overdueGoalIds = useMemo(() => new Set(overdueGoals.map((o) => o.goal.id)), [overdueGoals]);
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const { goals, createGoal, updateGoal, deleteGoal, isCreating, isUpdating } = useGoals();

  // Dynamic goals
  const { dynamicGoals } = useDynamicGoals();
  const {
    isCompleted: isDynamicCompleted,
    toggleCompletion: toggleDynamic,
    isToggling: isDynamicToggling,
  } = useAdminGoalCompletions();
  const { goalSortOrder, tagSortOrder } = useUserPreferences();
  const { tags } = useTags();
  const { counters: tasbeehCounters, deleteCounter: deleteTasbeeh } = useTasbeehCounters();

  const {
    prayerCompleted, prayerTotal, goalsCompleted, goalsTotal, goalsDueToday, overallPercentage,
  } = useTodayProgress(prayers, prayersLoading, overdueGoalIds, dynamicGoals, isDynamicCompleted);

  const DYNAMIC_PREFIX = 'dynamic:';

  // Build sorted goals list matching Goals page order
  const sortedGoals: GoalWithStatus[] = useMemo(() => {
    const userGoals: GoalWithStatus[] = goalsDueToday.map((g) => ({
      ...g,
      isCompleted: isCompleted(g.id),
    }));
    const dynGoals: GoalWithStatus[] = dynamicGoals.map((g) => ({
      ...g,
      user_id: '',
      recurrence_type: g.recurrence_type as GoalWithStatus['recurrence_type'],
      recurrence_days: g.recurrence_days ?? null,
      recurrence_pattern: g.recurrence_pattern as any,
      is_active: true,
      id: `${DYNAMIC_PREFIX}${g.id}`,
      isCompleted: isDynamicCompleted(g.id),
      isDynamic: true,
    }));
    const allGoals = [...userGoals, ...dynGoals];
    if (goalSortOrder.length === 0) return allGoals;

    const orderMap = new Map(goalSortOrder.map((id, i) => [id, i]));
    const sorted: GoalWithStatus[] = [];
    const unsorted: GoalWithStatus[] = [];
    for (const g of allGoals) {
      if (orderMap.has(g.id)) sorted.push(g);
      else unsorted.push(g);
    }
    sorted.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
    return [...sorted, ...unsorted];
  }, [goalsDueToday, dynamicGoals, isCompleted, isDynamicCompleted, goalSortOrder]);

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

  const breakdownParts: string[] = [`Prayers: ${prayerCompleted}/${prayerTotal}`];
  if (goalsTotal > 0) {
    breakdownParts.push(`Goals: ${goalsCompleted}/${goalsTotal}`);
  }

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
        <div onClick={() => navigate('/calendar')} className="cursor-pointer">
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
              className="mt-3 gap-2 border-foreground/20 text-foreground hover:bg-foreground/10 hover:text-foreground"
            >
              <MapPin className="h-4 w-4" />
              Set your location
            </Button>
          )}

          {/* Striped progress bar */}
          <div className="meter-track mt-3 mb-4 h-2 w-full rounded-full overflow-hidden">
            <div
              className="meter-fill h-full rounded-full transition-all"
              style={{
                width: `${overallPercentage}%`,
                backgroundImage:
                  'repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 6px)',
              }}
            />
          </div>

          {prayerToShow ? (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest text-foreground/60 font-normal">
                  {currentPrayer ? 'Current Namaz' : 'Next Namaz'}
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <div className="rounded-full p-2 bg-foreground/10">
                    <PrayerIcon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground font-display">
                      {prayerToShow.displayName}
                    </h3>
                    <span className="text-sm text-foreground/70">{prayerToShow.time}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {prayerToShow.isCompleted && (
                  <div className="flex items-center gap-1 text-foreground/70 text-sm">
                    <Check className="h-4 w-4" />
                    <span>Done</span>
                  </div>
                )}
                <Checkbox
                  checked={prayerToShow.isCompleted}
                  onCheckedChange={() => togglePrayer(prayerToShow.name)}
                  className="h-6 w-6 border-foreground/30 data-[state=checked]:bg-foreground/20 data-[state=checked]:text-foreground"
                />
              </div>
            </div>
          ) : (
            <p className="text-foreground/70 text-sm font-medium">Reflect, rest, renew.</p>
          )}
        </TimeOfDayCard>
        </div>

        {/* Today's Goals */}
        <TodaysGoals
          goalsDueToday={goalsDueToday}
          hasAnyGoals={goals.length > 0}
          goalsCompleted={goalsCompleted}
          goalsTotal={goalsTotal}
          isCompleted={isCompleted}
          onToggle={toggleCompletion}
          isToggling={isToggling}
          overdueGoals={overdueGoals}
          onCompleteOverdue={completeOverdue}
          isCompletingOverdue={isCompletingOverdue}
          onDeleteGoal={deleteGoal}
          dynamicGoals={dynamicGoals}
          isDynamicCompleted={isDynamicCompleted}
          onDynamicToggle={toggleDynamic}
          isDynamicToggling={isDynamicToggling}
          onCreateGoal={() => setGoalFormOpen(true)}
          onEditGoal={(goal) => { setEditingGoal(goal); setGoalFormOpen(true); }}
          sortedGoals={sortedGoals}
          tags={tags}
          tagSortOrder={tagSortOrder}
        />

        <GoalFormSheet
          open={goalFormOpen}
          onOpenChange={(open) => { if (!open) { setGoalFormOpen(false); setEditingGoal(null); } }}
          goal={editingGoal}
          onSubmit={async (data) => {
            if (editingGoal) {
              await updateGoal(editingGoal.id, data);
            } else {
              await createGoal(data);
            }
            setGoalFormOpen(false);
            setEditingGoal(null);
          }}
          onDelete={editingGoal ? async (id) => {
            await deleteGoal(id);
            setGoalFormOpen(false);
            setEditingGoal(null);
          } : undefined}
          isLoading={isCreating || isUpdating}
        />

        <WhatsNewPopup />
      </div>
    </div>
  );
};

export default Dashboard;
