import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, SunLight, HalfMoon, Check, Flower } from 'iconoir-react';
import { DateDisplay } from '@/components/calendar/DateDisplay';
import { useCalendar } from '@/contexts/CalendarContext';
import { cn } from '@/lib/utils';


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
import Calendar from '@/pages/Calendar';


const PRAYER_ICONS: Record<AllPrayerName, React.ComponentType<{ className?: string }>> = {
  fajr: SunLight,
  dhuhr: SunLight,
  asr: SunLight,
  maghrib: HalfMoon,
  isha: HalfMoon,
  nisfulLayl: HalfMoon,
};

const GRADIENT_CLASSES: Record<AllPrayerName | 'default', string> = {
  fajr: 'gradient-fajr',
  dhuhr: 'gradient-zuhr',
  asr: 'gradient-asr',
  maghrib: 'gradient-maghrib',
  isha: 'gradient-isha',
  nisfulLayl: 'gradient-nisful-layl',
  default: 'gradient-fajr',
};


const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { location, requestLocationPermission } = useCalendar();
  const navigate = useNavigate();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [tab, setTab] = useState<'feed' | 'calendar'>(() => {
    if (typeof window === 'undefined') return 'feed';
    return (sessionStorage.getItem('today:tab') as 'feed' | 'calendar') || 'feed';
  });
  useEffect(() => {
    sessionStorage.setItem('today:tab', tab);
    window.dispatchEvent(new CustomEvent('today:tabChanged', { detail: { tab } }));
  }, [tab]);

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
      tag: (g as any).tag as GoalWithStatus['tag'],
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

  const gradientClass = currentPrayerName
    ? GRADIENT_CLASSES[currentPrayerName]
    : GRADIENT_CLASSES.default;

  const pillTabs = (
    <div className="container pt-2 pb-1 relative z-20">
      <div className="max-w-2xl mx-auto flex justify-center">
        <div
          role="tablist"
          className="inline-flex items-center gap-1 rounded-full border border-foreground/15 bg-background/50 backdrop-blur-md p-1"
        >
          {(['feed', 'calendar'] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                'px-5 py-1.5 text-sm font-medium rounded-full transition-colors capitalize',
                tab === t
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (tab === 'calendar') {
    return (
      <div className="relative">
        {pillTabs}
        <Calendar />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Seamless time-of-day gradient backdrop: flows behind status bar + header,
          fades softly into page background before the goals list */}
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-x-0 top-0 h-[520px] ${gradientClass}`}
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
          zIndex: 0,
        }}
      />
      {pillTabs}


      <div className="container pt-6 pb-8 relative">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Seamless Namaz Section (no card chrome) */}
          <section className="px-1">
            {/* Chunky day-progress meter */}
            <div
              onClick={() => setTab('calendar')}
              role="button"
              tabIndex={0}
              className="cursor-pointer relative overflow-hidden rounded-3xl border border-foreground/15 bg-foreground/[0.04] backdrop-blur-sm h-44 sm:h-48 p-5 flex flex-col justify-between"
            >
              {/* Low-opacity fill tied to the time-of-day gradient */}
              <div
                aria-hidden
                className={`absolute inset-y-0 left-0 ${gradientClass} transition-[width] duration-700 ease-out`}
                style={{
                  width: `${overallPercentage}%`,
                  opacity: 0.55,
                  WebkitMaskImage:
                    'linear-gradient(to right, black 0%, black 85%, transparent 100%)',
                  maskImage:
                    'linear-gradient(to right, black 0%, black 85%, transparent 100%)',
                }}
              />
              {/* random starry texture across the fill */}
              <div
                aria-hidden
                className="absolute inset-y-0 left-0 pointer-events-none overflow-hidden"
                style={{
                  width: `${overallPercentage}%`,
                  backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
                    `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'>${
                      (() => {
                        const star = (cx: number, cy: number, r: number, o: number) => {
                          const pts: string[] = [];
                          for (let i = 0; i < 10; i++) {
                            const ang = (Math.PI / 5) * i - Math.PI / 2;
                            const rad = i % 2 === 0 ? r : r * 0.42;
                            pts.push(`${(cx + Math.cos(ang) * rad).toFixed(2)},${(cy + Math.sin(ang) * rad).toFixed(2)}`);
                          }
                          return `<polygon points='${pts.join(' ')}' fill='white' fill-opacity='${o}'/>`;
                        };
                        const dot = (cx: number, cy: number, r: number, o: number) =>
                          `<circle cx='${cx}' cy='${cy}' r='${r}' fill='white' fill-opacity='${o}'/>`;
                        // deterministic pseudo-random positions
                        const stars = [
                          [18, 24, 4.5, 0.32], [62, 12, 3, 0.22], [110, 38, 5, 0.28],
                          [168, 18, 3.5, 0.26], [200, 60, 4, 0.3], [40, 70, 3, 0.24],
                          [92, 88, 4, 0.3], [148, 76, 3, 0.22], [22, 122, 5, 0.32],
                          [78, 140, 3.5, 0.26], [130, 130, 4, 0.28], [180, 118, 3, 0.22],
                          [50, 178, 4, 0.3], [104, 192, 3, 0.24], [162, 168, 5, 0.32],
                          [200, 200, 3.5, 0.26], [8, 90, 3, 0.22], [120, 60, 3, 0.2],
                        ] as const;
                        const dots = [
                          [10, 50, 0.8, 0.4], [55, 40, 0.6, 0.3], [88, 20, 0.7, 0.35],
                          [140, 50, 0.6, 0.3], [185, 90, 0.8, 0.4], [70, 110, 0.7, 0.35],
                          [125, 100, 0.6, 0.28], [30, 150, 0.8, 0.4], [98, 160, 0.6, 0.3],
                          [155, 145, 0.7, 0.35], [195, 180, 0.6, 0.3], [15, 200, 0.8, 0.4],
                          [75, 195, 0.6, 0.28], [135, 175, 0.7, 0.32], [180, 30, 0.6, 0.3],
                          [45, 100, 0.7, 0.32], [115, 25, 0.6, 0.28], [165, 200, 0.8, 0.4],
                        ] as const;
                        return [
                          ...stars.map(([x, y, r, o]) => star(x, y, r, o)),
                          ...dots.map(([x, y, r, o]) => dot(x, y, r, o)),
                        ].join('');
                      })()
                    }</svg>`
                  )}")`,
                  backgroundSize: '220px 220px',
                  backgroundRepeat: 'repeat',
                  WebkitMaskImage:
                    'linear-gradient(to right, black 0%, black 85%, transparent 100%)',
                  maskImage:
                    'linear-gradient(to right, black 0%, black 85%, transparent 100%)',
                }}
              />

              {/* Top-left: date */}
              <div className="relative z-10">
                <DateDisplay showLocation compact variant="light" />
              </div>

              {/* Bottom row: label left, percentage right (aligned to label baseline) */}
              <div className="relative z-10 flex items-end justify-between gap-3">
                <span className="text-[10px] uppercase tracking-[0.18em] text-foreground/60 font-medium pb-2">
                  Today's progress
                </span>
                <span className="text-5xl sm:text-6xl font-light font-display text-foreground tracking-tight leading-none">
                  {overallPercentage}%
                </span>
              </div>
            </div>

            {!location?.city && (
              <Button
                variant="outline"
                size="sm"
                onClick={requestLocationPermission}
                className="mt-4 gap-2 border-foreground/20 text-foreground hover:bg-foreground/10 hover:text-foreground"
              >
                <MapPin className="h-4 w-4" />
                Set your location
              </Button>
            )}

            {/* Next / Current Namaz — below the meter */}
            {prayerToShow ? (
              <div className="mt-5">
                <span className="text-xs uppercase tracking-widest text-foreground/60 font-normal">
                  {currentPrayer ? 'Current Namaz' : 'Next Namaz'}
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <Checkbox
                    checked={prayerToShow.isCompleted}
                    onCheckedChange={() => togglePrayer(prayerToShow.name)}
                    className="h-6 w-6 border-foreground/30 data-[state=checked]:bg-foreground/20 data-[state=checked]:text-foreground"
                  />
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-foreground font-display">
                      {prayerToShow.displayName}
                    </h3>
                    <span className="text-sm text-foreground/70">{prayerToShow.time}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-foreground/70 text-sm font-medium">Reflect, rest, renew.</p>
            )}
          </section>

          <div className="flex items-center justify-center h-16" aria-hidden>
            <Flower className="w-4 h-4 text-foreground/30" strokeWidth={1.5} />
          </div>



        {/* Tasbeeh Counters */}
        {tasbeehCounters.length > 0 && (
          <div className="flex gap-4 overflow-x-auto scrollbar-none px-1 py-1">
            {tasbeehCounters.map((c, i) => (
              <TasbeehCard key={c.id} counter={c} index={i} onDelete={deleteTasbeeh} />
            ))}
          </div>
        )}

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
    </div>
  );

};

export default Dashboard;
