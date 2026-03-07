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

type TimelineItem =
  | { type: 'prayer'; prayer: CalendarDayPrayer; minutes: number }
  | { type: 'goal'; goal: GoalWithStatus; minutes: number }
  | { type: 'now'; minutes: number };

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
  const nowRef = useRef<HTMLDivElement>(null);
  const currentPrayerRef = useRef<HTMLDivElement>(null);

  // Build sorted timeline items
  const items = useMemo<TimelineItem[]>(() => {
    const list: TimelineItem[] = [];

    prayers.forEach((p) => {
      list.push({ type: 'prayer', prayer: p, minutes: p.timeMinutes });
    });

    timedGoals.forEach((g) => {
      const mins = g.preferred_time ? parseTimeToMinutes(g.preferred_time) : 0;
      list.push({ type: 'goal', goal: g, minutes: mins });
    });

    if (isToday) {
      const now = new Date();
      list.push({ type: 'now', minutes: now.getHours() * 60 + now.getMinutes() });
    }

    list.sort((a, b) => a.minutes - b.minutes);
    return list;
  }, [prayers, timedGoals, isToday]);

  // Auto-scroll to "Now" or first prayer
  useEffect(() => {
    if (isToday && nowRef.current) {
      nowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (currentPrayerRef.current) {
      currentPrayerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [items, isToday]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* All-day goals */}
      {allDayGoals.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            All Day
          </h3>
          <div className="space-y-3">
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

      {/* Chronological card list */}
      <div className="space-y-3">
        {items.map((item, idx) => {
          if (item.type === 'now') {
            return (
              <div key="now-indicator" ref={nowRef} className="flex items-center gap-3 py-1">
                <div className="w-2 h-2 rounded-full bg-destructive shrink-0" />
                <div className="flex-1 border-t-2 border-destructive" />
                <span className="text-xs font-semibold text-destructive shrink-0">Now</span>
              </div>
            );
          }

          if (item.type === 'prayer') {
            return (
              <div key={`prayer-${item.prayer.name}`} ref={idx === 0 ? currentPrayerRef : undefined}>
                <PrayerSlotCard
                  prayer={item.prayer}
                  isPast={isPast}
                  isToday={isToday}
                  isFuture={isFuture}
                  onToggle={() => onTogglePrayer(item.prayer.name)}
                  onFulfillQaza={() => onFulfillQaza(item.prayer.name)}
                />
              </div>
            );
          }

          if (item.type === 'goal') {
            return (
              <GoalTimelineCard
                key={`goal-${item.goal.id}`}
                goal={item.goal}
                isFuture={isFuture}
                onToggle={() => onToggleGoal(item.goal.id)}
                onEdit={() => onEditGoal(item.goal)}
                onDelete={onDeleteGoal ? () => onDeleteGoal(item.goal.id) : undefined}
                showTime
                isToggling={isGoalToggling}
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};

// Prayer card — cozy layout with gradient
function PrayerSlotCard({
  prayer: p,
  isPast,
  isToday,
  isFuture,
  onToggle,
  onFulfillQaza,
}: {
  prayer: CalendarDayPrayer;
  isPast: boolean;
  isToday: boolean;
  isFuture: boolean;
  onToggle: () => void;
  onFulfillQaza: () => void;
}) {
  // Past missed → qaza card
  if (isPast && p.status === 'missed' && !p.isCompleted && !p.isQazaFulfilled) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-4">
        <div>
          <div className="flex items-center gap-2">
            <WarningCircle className="h-4 w-4 text-destructive" />
            <span className="font-semibold text-base">{p.displayName}</span>
            <span className="text-sm text-muted-foreground">{p.time}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {p.hijriDate.day} {p.hijriDate.monthName}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onFulfillQaza}
          className="gap-1.5 shrink-0"
        >
          <Undo className="h-3.5 w-3.5" />
          Ada
        </Button>
      </div>
    );
  }

  // Past fulfilled qaza
  if (isPast && p.isQazaFulfilled && !p.isCompleted) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-4">
        <Check className="h-4 w-4 text-primary shrink-0" />
        <div>
          <span className="font-semibold text-base line-through text-muted-foreground">{p.displayName}</span>
          <span className="text-sm text-muted-foreground ml-2">{p.time}</span>
          <p className="text-xs text-primary">Qaza fulfilled</p>
        </div>
      </div>
    );
  }

  // Normal prayer card with gradient
  const gradientClass = GRADIENT_MAP[p.name];

  return (
    <div
      className={cn(
        'rounded-xl px-4 py-4 flex items-center gap-3 transition-all',
        p.isCompleted ? 'opacity-70' : '',
        gradientClass,
      )}
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
            'font-semibold text-white text-base',
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
        <span className="text-xs text-white/70">
          {p.hijriDate.day} {p.hijriDate.monthName}
        </span>
      </div>
      <span className="text-sm text-white/80 font-medium shrink-0">{p.time}</span>
    </div>
  );
}

// Cozy goal card for the timeline
function GoalTimelineCard({
  goal,
  isFuture,
  onToggle,
  onEdit,
  onDelete,
  showTime = false,
  isToggling,
}: {
  goal: GoalWithStatus;
  isFuture: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  showTime?: boolean;
  isToggling?: boolean;
}) {
  const cardContent = (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border p-4 transition-all cursor-pointer',
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
          className="h-5 w-5 shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-base font-medium truncate',
            goal.isCompleted && 'line-through text-muted-foreground'
          )}>
            {goal.title}
          </span>
          {goal.tag && (
            <Badge variant="outline" className="text-[10px] shrink-0">
              {goal.tag}
            </Badge>
          )}
        </div>
      </div>
      {showTime && goal.preferred_time && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <Clock className="h-3.5 w-3.5" />
          <span>{goal.preferred_time}</span>
        </div>
      )}
    </div>
  );

  if (!onDelete) return cardContent;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {cardContent}
      </ContextMenuTrigger>
      <ContextMenuContent className="bg-popover">
        <ContextMenuItem
          onClick={onDelete}
          className="text-destructive focus:text-destructive gap-2"
        >
          <Trash className="size-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
