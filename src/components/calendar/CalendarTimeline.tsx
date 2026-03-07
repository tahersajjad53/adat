import React, { useEffect, useRef, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import { Undo, Clock, Check, WarningCircle, Trash } from 'iconoir-react';
import { CalendarDayPrayer } from '@/hooks/useCalendarDay';
import { AllPrayerName } from '@/hooks/usePrayerTimes';
import type { GoalWithStatus } from '@/types/goals';

const HOUR_HEIGHT = 60; // px per hour

const GRADIENT_MAP: Record<AllPrayerName, string> = {
  fajr: 'gradient-fajr',
  dhuhr: 'gradient-zuhr',
  asr: 'gradient-asr',
  maghrib: 'gradient-maghrib',
  isha: 'gradient-isha',
  nisfulLayl: 'gradient-nisful-layl',
};

interface CalendarTimelineProps {
  prayers: CalendarDayPrayer[];
  allDayGoals: GoalWithStatus[];
  timedGoals: GoalWithStatus[];
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  isLoading: boolean;
  onTogglePrayer: (prayer: AllPrayerName) => void;
  onFulfillQaza: (prayer: AllPrayerName) => void;
  onToggleGoal: (goalId: string) => void;
  onEditGoal: (goal: GoalWithStatus) => void;
  onDeleteGoal?: (goalId: string) => void;
  isGoalToggling?: boolean;
}

function parseTimeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function formatHour(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
}

function minutesToTop(minutes: number, startHour: number): number {
  return ((minutes - startHour * 60) / 60) * HOUR_HEIGHT;
}

export const CalendarTimeline: React.FC<CalendarTimelineProps> = ({
  prayers,
  allDayGoals,
  timedGoals,
  isToday,
  isPast,
  isFuture,
  isLoading,
  onTogglePrayer,
  onFulfillQaza,
  onToggleGoal,
  onEditGoal,
  onDeleteGoal,
  isGoalToggling,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Compute hour range from prayers
  const { startHour, endHour } = useMemo(() => {
    if (!prayers.length) return { startHour: 3, endHour: 25 };
    const mins = prayers.map(p => p.timeMinutes);
    const earliest = Math.min(...mins);
    const latest = Math.max(...mins);
    // Handle wrap-around for nisful layl (after midnight)
    const s = Math.max(0, Math.floor(earliest / 60) - 1);
    const e = Math.min(25, Math.ceil(latest / 60) + 1);
    return { startHour: s, endHour: e < s ? e + 24 : e };
  }, [prayers]);

  const totalHours = endHour - startHour;
  const totalHeight = totalHours * HOUR_HEIGHT;

  // Auto-scroll to current prayer or fajr
  useEffect(() => {
    if (!scrollRef.current || !prayers.length) return;
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const targetMin = isToday ? currentMin : prayers[0]?.timeMinutes ?? startHour * 60;
    const top = minutesToTop(targetMin, startHour) - 60;
    scrollRef.current.scrollTop = Math.max(0, top);
  }, [prayers, isToday, startHour]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  const currentMinutes = isToday ? new Date().getHours() * 60 + new Date().getMinutes() : -1;

  return (
    <div className="space-y-4">
      {/* All-day goals */}
      {allDayGoals.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            All Day
          </h3>
          <div className="space-y-2">
            {allDayGoals.map((goal) => (
              <GoalTimelineCard
                key={goal.id}
                goal={goal}
                isFuture={isFuture}
                onToggle={() => onToggleGoal(goal.id)}
                onEdit={() => onEditGoal(goal)}
                onDelete={onDeleteGoal ? () => onDeleteGoal(goal.id) : undefined}
                isToggling={isGoalToggling}
              />
            ))}
          </div>
        </div>
      )}

      {/* Hourly time-slot grid */}
      <div
        ref={scrollRef}
        className="relative overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 260px)' }}
      >
        <div className="relative" style={{ height: totalHeight }}>
          {/* Hour grid lines & labels */}
          {Array.from({ length: totalHours + 1 }).map((_, i) => {
            const hour = startHour + i;
            const top = i * HOUR_HEIGHT;
            return (
              <div key={hour} className="absolute left-0 right-0" style={{ top }}>
                <div className="flex items-start">
                  <span className="text-[10px] text-muted-foreground w-12 shrink-0 -mt-1.5 text-right pr-2">
                    {formatHour(hour)}
                  </span>
                  <div className="flex-1 border-t border-border/40" />
                </div>
              </div>
            );
          })}

          {/* Current time indicator */}
          {isToday && currentMinutes >= startHour * 60 && currentMinutes <= endHour * 60 && (
            <div
              className="absolute left-12 right-0 z-30 flex items-center"
              style={{ top: minutesToTop(currentMinutes, startHour) }}
            >
              <div className="w-2 h-2 rounded-full bg-destructive -ml-1" />
              <div className="flex-1 border-t-2 border-destructive" />
            </div>
          )}

          {/* Prayer cards positioned at their time */}
          {prayers.map((p, idx) => {
            const top = minutesToTop(p.timeMinutes, startHour);
            const nextPrayer = prayers[idx + 1];
            const durationMins = nextPrayer
              ? Math.max(nextPrayer.timeMinutes - p.timeMinutes, 30)
              : 60;
            const height = Math.min(Math.max((durationMins / 60) * HOUR_HEIGHT, 70), 100);

            return (
              <div
                key={`prayer-${p.name}`}
                className="absolute left-12 right-0 z-10"
                style={{ top, height }}
              >
                <PrayerSlotCard
                  prayer={p}
                  isPast={isPast}
                  isToday={isToday}
                  isFuture={isFuture}
                  height={height}
                  onToggle={() => onTogglePrayer(p.name)}
                  onFulfillQaza={() => onFulfillQaza(p.name)}
                />
              </div>
            );
          })}

          {/* Timed goal cards — nudged below overlapping prayers */}
          {(() => {
            // Build prayer occupied ranges
            const prayerRanges = prayers.map((p, idx) => {
              const pTop = minutesToTop(p.timeMinutes, startHour);
              const nextPrayer = prayers[idx + 1];
              const durationMins = nextPrayer
                ? Math.max(nextPrayer.timeMinutes - p.timeMinutes, 30)
                : 60;
              const pHeight = Math.min(Math.max((durationMins / 60) * HOUR_HEIGHT, 70), 100);
              return { topPx: pTop, bottomPx: pTop + pHeight };
            });

            // Track occupied bottoms for stacking multiple goals
            const occupiedBottoms = new Map<number, number>(); // prayerIndex -> next available bottom

            return timedGoals.map((goal) => {
              const mins = goal.preferred_time ? parseTimeToMinutes(goal.preferred_time) : 0;
              let goalTop = minutesToTop(mins, startHour) + 2;

              // Check overlap with any prayer range
              for (let i = 0; i < prayerRanges.length; i++) {
                const range = prayerRanges[i];
                if (goalTop >= range.topPx && goalTop < range.bottomPx) {
                  const currentBottom = occupiedBottoms.get(i) ?? range.bottomPx;
                  goalTop = currentBottom + 4;
                  occupiedBottoms.set(i, goalTop + 36); // ~36px goal card height
                  break;
                }
              }

              return (
                <div
                  key={`goal-${goal.id}`}
                  className="absolute left-12 right-0 z-20"
                  style={{ top: goalTop }}
                >
                  <GoalTimelineCard
                    goal={goal}
                    isFuture={isFuture}
                    onToggle={() => onToggleGoal(goal.id)}
                    onEdit={() => onEditGoal(goal)}
                    onDelete={onDeleteGoal ? () => onDeleteGoal(goal.id) : undefined}
                    showTime
                    isToggling={isGoalToggling}
                  />
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};

// Prayer card styled with gradient, positioned in the timeline
function PrayerSlotCard({
  prayer: p,
  isPast,
  isToday,
  isFuture,
  height,
  onToggle,
  onFulfillQaza,
}: {
  prayer: CalendarDayPrayer;
  isPast: boolean;
  isToday: boolean;
  isFuture: boolean;
  height: number;
  onToggle: () => void;
  onFulfillQaza: () => void;
}) {
  // Past missed → qaza card
  if (isPast && p.status === 'missed' && !p.isCompleted && !p.isQazaFulfilled) {
    return (
      <div
        className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-3 h-full"
        style={{ minHeight: height }}
      >
        <div>
          <div className="flex items-center gap-2">
            <WarningCircle className="h-4 w-4 text-destructive" />
            <span className="font-medium text-sm">{p.displayName}</span>
            <span className="text-xs text-muted-foreground">{p.time}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {p.hijriDate.day} {p.hijriDate.monthName}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onFulfillQaza}
          className="gap-1.5 shrink-0 text-xs"
        >
          <Undo className="h-3 w-3" />
          Ada
        </Button>
      </div>
    );
  }

  // Past fulfilled qaza
  if (isPast && p.isQazaFulfilled && !p.isCompleted) {
    return (
      <div
        className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-3 h-full"
        style={{ minHeight: height }}
      >
        <Check className="h-4 w-4 text-primary shrink-0" />
        <div>
          <span className="font-medium text-sm line-through text-muted-foreground">{p.displayName}</span>
          <span className="text-xs text-muted-foreground ml-2">{p.time}</span>
          <p className="text-[10px] text-primary">Qaza fulfilled</p>
        </div>
      </div>
    );
  }

  // Normal prayer card with gradient
  const gradientClass = GRADIENT_MAP[p.name];

  return (
    <div
      className={cn(
        'rounded-lg px-3 flex items-center gap-3 h-full transition-all',
        p.isCompleted ? 'opacity-70' : '',
        gradientClass,
      )}
      style={{ minHeight: height }}
    >
      <Checkbox
        checked={p.isCompleted}
        onCheckedChange={() => {
          if (isToday) onToggle();
        }}
        disabled={!isToday && !isPast}
        className="h-5 w-5 shrink-0 border-white/50 data-[state=checked]:bg-white/30 data-[state=checked]:border-white/60"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'font-semibold text-white text-sm',
            p.isCompleted && 'line-through opacity-70'
          )}>
            {p.displayName}
          </span>
          {p.isOptional && (
            <Badge variant="outline" className="text-[10px] border-white/30 text-white/80">
              Optional
            </Badge>
          )}
        </div>
        <span className="text-[10px] text-white/70">
          {p.hijriDate.day} {p.hijriDate.monthName}
        </span>
      </div>
      <span className="text-xs text-white/80 font-medium shrink-0">{p.time}</span>
    </div>
  );
}

// Compact goal card for the timeline
function GoalTimelineCard({
  goal,
  isFuture,
  onToggle,
  onEdit,
  showTime = false,
  isToggling,
}: {
  goal: GoalWithStatus;
  isFuture: boolean;
  onToggle: () => void;
  onEdit: () => void;
  showTime?: boolean;
  isToggling?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-2.5 transition-all cursor-pointer',
        goal.isCompleted
          ? 'border-primary/30 bg-primary/5'
          : 'border-border bg-card hover:bg-muted/50'
      )}
      onClick={onEdit}
    >
      {!isFuture && (
        <Checkbox
          checked={goal.isCompleted}
          onCheckedChange={() => onToggle()}
          onClick={(e) => e.stopPropagation()}
          disabled={isToggling}
          className="h-4 w-4 shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-xs font-medium truncate',
            goal.isCompleted && 'line-through text-muted-foreground'
          )}>
            {goal.title}
          </span>
          {goal.tag && (
            <Badge variant="outline" className="text-[9px] shrink-0">
              {goal.tag}
            </Badge>
          )}
        </div>
      </div>
      {showTime && goal.preferred_time && (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
          <Clock className="h-3 w-3" />
          <span>{goal.preferred_time}</span>
        </div>
      )}
    </div>
  );
}
