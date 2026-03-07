import React from 'react';
import { PrayerCard } from '@/components/namaz/PrayerCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Undo, Clock } from 'iconoir-react';
import { CalendarDayPrayer } from '@/hooks/useCalendarDay';
import { AllPrayerName } from '@/hooks/usePrayerTimes';
import type { GoalWithStatus } from '@/types/goals';
import { getRecurrenceDescription } from '@/lib/recurrence';

interface TimelineItem {
  type: 'prayer' | 'goal';
  timeMinutes: number;
  timeLabel: string;
  prayer?: CalendarDayPrayer;
  goal?: GoalWithStatus;
}

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
  isGoalToggling?: boolean;
}

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
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
  isGoalToggling,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  // Build merged timeline
  const items: TimelineItem[] = [];

  for (const p of prayers) {
    items.push({
      type: 'prayer',
      timeMinutes: p.timeMinutes,
      timeLabel: p.time,
      prayer: p,
    });
  }

  for (const g of timedGoals) {
    const mins = g.preferred_time ? parseTime(g.preferred_time) : 0;
    items.push({
      type: 'goal',
      timeMinutes: mins,
      timeLabel: g.preferred_time || '',
      goal: g,
    });
  }

  items.sort((a, b) => a.timeMinutes - b.timeMinutes);

  return (
    <div className="space-y-6">
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
                isToggling={isGoalToggling}
              />
            ))}
          </div>
        </div>
      )}

      {/* Chronological timeline */}
      <div className="space-y-2">
        {items.map((item, i) => {
          if (item.type === 'prayer' && item.prayer) {
            const p = item.prayer;
            if (isPast && p.status === 'missed' && !p.isCompleted && !p.isQazaFulfilled) {
              // Past missed prayer — show qaza card
              return (
                <div
                  key={`prayer-${p.name}`}
                  className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p.displayName}</span>
                      <span className="text-sm text-muted-foreground">{p.time}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {p.hijriDate.day} {p.hijriDate.monthName}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onFulfillQaza(p.name)}
                    className="gap-2 shrink-0"
                  >
                    <Undo className="h-3 w-3" />
                    Ada
                  </Button>
                </div>
              );
            }

            if (isPast && p.isQazaFulfilled && !p.isCompleted) {
              // Fulfilled qaza
              return (
                <div
                  key={`prayer-${p.name}`}
                  className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-4"
                >
                  <div>
                    <span className="font-medium line-through text-muted-foreground">{p.displayName}</span>
                    <span className="text-sm text-muted-foreground ml-2">{p.time}</span>
                    <p className="text-xs text-primary mt-1">Qaza fulfilled</p>
                  </div>
                </div>
              );
            }

            return (
              <PrayerCard
                key={`prayer-${p.name}`}
                name={p.name}
                displayName={p.displayName}
                time={p.time}
                status={p.status}
                isCompleted={p.isCompleted}
                onToggle={() => {
                  if (isToday) onTogglePrayer(p.name);
                }}
                isOptional={p.isOptional}
                hijriDate={p.hijriDate}
                compact
              />
            );
          }

          if (item.type === 'goal' && item.goal) {
            return (
              <GoalTimelineCard
                key={`goal-${item.goal.id}`}
                goal={item.goal}
                isFuture={isFuture}
                onToggle={() => onToggleGoal(item.goal!.id)}
                onEdit={() => onEditGoal(item.goal!)}
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

// Inline goal card for the timeline
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
        'flex items-center gap-3 rounded-lg border p-3 transition-all cursor-pointer',
        goal.isCompleted
          ? 'border-primary/30 bg-primary/5'
          : 'border-border bg-card hover:bg-muted/50'
      )}
      onClick={onEdit}
    >
      {!isFuture && (
        <Checkbox
          checked={goal.isCompleted}
          onCheckedChange={(e) => {
            e; // prevent bubbling
            onToggle();
          }}
          onClick={(e) => e.stopPropagation()}
          disabled={isToggling}
          className="h-5 w-5 shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-sm font-medium truncate',
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
        {showTime && goal.preferred_time && (
          <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{goal.preferred_time}</span>
          </div>
        )}
      </div>
    </div>
  );
}
