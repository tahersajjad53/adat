import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { WeekRow } from '@/components/calendar/WeekRow';
import { CalendarTimeline } from '@/components/calendar/CalendarTimeline';
import { DateDisplay } from '@/components/calendar/DateDisplay';
import { useCalendarDay } from '@/hooks/useCalendarDay';
import { useCalendarDayGoals } from '@/hooks/useCalendarDayGoals';
import { useWeekQazaIndicators } from '@/hooks/useWeekQazaIndicators';
import { useGoalCompletions } from '@/hooks/useGoalCompletions';
import { useGoals } from '@/hooks/useGoals';
import { formatHijriDate, gregorianToBohra } from '@/lib/hijri';
import { useCalendar } from '@/contexts/CalendarContext';
import GoalFormSheet from '@/components/goals/GoalFormSheet';
import type { GoalWithStatus } from '@/types/goals';

function getWeekDates(centerDate: Date): Date[] {
  const day = centerDate.getDay(); // 0=Sun
  const start = new Date(centerDate);
  start.setDate(start.getDate() - day); // Start on Sunday
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const Calendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const { location } = useCalendar();

  const weekCenter = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekDates = useMemo(() => getWeekDates(weekCenter), [weekCenter]);
  const qazaDays = useWeekQazaIndicators(weekDates);

  const {
    prayers, togglePrayer, fulfillQaza,
    isLoading: prayersLoading, isToday, isPast, isFuture,
    preMaghribHijri,
  } = useCalendarDay(selectedDate);

  const {
    allDayGoals, timedGoals, isLoading: goalsLoading,
  } = useCalendarDayGoals(selectedDate, preMaghribHijri);

  // Goal completion toggling using the existing hook scoped to the selected date's hijri
  const hijriDateStr = useMemo(() => {
    const h = preMaghribHijri;
    return `${h.year}-${String(h.month).padStart(2, '0')}-${String(h.day).padStart(2, '0')}`;
  }, [preMaghribHijri]);

  const { toggleCompletion, isToggling } = useGoalCompletions({ forDate: hijriDateStr });
  const { updateGoal, deleteGoal } = useGoals();

  // Goal editing
  const [editingGoal, setEditingGoal] = useState<GoalWithStatus | null>(null);

  // Listen for "Today" button in app header
  useEffect(() => {
    const handleGoToToday = () => {
      setSelectedDate(new Date());
      setWeekOffset(0);
    };
    window.addEventListener('calendar:goToToday', handleGoToToday);
    return () => window.removeEventListener('calendar:goToToday', handleGoToToday);
  }, []);

  // Notify header whether we're showing today
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('calendar:showingTodayChanged', { detail: { showingToday } }));
  }, [showingToday]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent('calendar:showingTodayChanged', { detail: { showingToday: true } }));
    };
  }, []);

  const handleShiftWeek = useCallback((dir: -1 | 1) => {
    setWeekOffset(prev => prev + dir);
  }, []);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    const weekStart = weekDates[0];
    const weekEnd = weekDates[6];
    if (date < weekStart || date > weekEnd) {
      const diffDays = Math.round((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      setWeekOffset(Math.floor(diffDays / 7));
    }
  }, [weekDates]);

  // Formatted selected date display
  const selectedHijri = preMaghribHijri;
  const selectedDateLabel = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const selectedHijriLabel = formatHijriDate(selectedHijri, 'long');

  const todayKey = formatDateKey(new Date());
  const selectedKey = formatDateKey(selectedDate);
  const showingToday = todayKey === selectedKey;

  return (
    <div className="container py-6 max-w-xl mx-auto space-y-5">
      {/* Week navigator */}
      <WeekRow
        weekDates={weekDates}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        onShiftWeek={handleShiftWeek}
        qazaDays={qazaDays}
      />

      {/* Selected date header */}
      <div className="px-1 flex justify-between items-baseline">
        <h2 className="font-display tracking-tight font-normal text-xl">
          {showingToday ? 'Today' : selectedDateLabel}
        </h2>
        <p className="text-sm text-muted-foreground">{selectedHijriLabel}</p>
      </div>

      {/* Timeline */}
      <CalendarTimeline
        prayers={prayers}
        allDayGoals={allDayGoals}
        timedGoals={timedGoals}
        isToday={isToday}
        isPast={isPast}
        isFuture={isFuture}
        isLoading={prayersLoading || goalsLoading}
        onTogglePrayer={togglePrayer}
        onFulfillQaza={fulfillQaza}
        onToggleGoal={toggleCompletion}
        onEditGoal={setEditingGoal}
        onDeleteGoal={deleteGoal}
        isGoalToggling={isToggling}
      />

      {/* Goal edit sheet */}
      <GoalFormSheet
        open={!!editingGoal}
        onOpenChange={(open) => { if (!open) setEditingGoal(null); }}
        goal={editingGoal || undefined}
        onSubmit={async (data) => {
          if (editingGoal) {
            await updateGoal(editingGoal.id, data);
            setEditingGoal(null);
          }
        }}
        onDelete={async (id) => {
          await deleteGoal(id);
          setEditingGoal(null);
        }}
        isLoading={false}
      />
    </div>
  );
};

export default Calendar;
