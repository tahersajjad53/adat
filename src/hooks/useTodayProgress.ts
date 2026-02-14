import { useMemo } from 'react';
import { useGoals } from './useGoals';
import { useGoalCompletions } from './useGoalCompletions';
import { useCalendar } from '@/contexts/CalendarContext';
import { getGoalsDueOnDate } from '@/lib/recurrence';
import type { Goal } from '@/types/goals';
import type { PrayerStatus } from './usePrayerLog';

export interface TodayProgressData {
  // Prayers
  prayerCompleted: number;
  prayerTotal: number;
  prayerPercentage: number;

  // Goals
  goalsCompleted: number;
  goalsTotal: number;
  goalsPercentage: number;
  goalsDueToday: Goal[];

  // Combined
  overallCompleted: number;
  overallTotal: number;
  overallPercentage: number;

  // Loading states
  isLoading: boolean;
}

export function useTodayProgress(prayers: PrayerStatus[], prayersLoading: boolean, overdueGoalIds?: Set<string>): TodayProgressData {
  const { currentDate } = useCalendar();
  const { goals, isLoading: goalsLoading } = useGoals();
  const { isCompleted, isLoading: completionsLoading } = useGoalCompletions();

  const hijriDate = currentDate?.hijri;
  const gregorianDate = currentDate?.gregorian;

  const progressData = useMemo(() => {
    // Prayer progress - count required prayers only (not optional)
    const requiredPrayers = prayers.filter(p => !p.isOptional);
    const prayerTotal = requiredPrayers.length; // Always 5
    const prayerCompleted = requiredPrayers.filter(p => p.isCompleted).length;
    const prayerPercentage = prayerTotal > 0 
      ? Math.round((prayerCompleted / prayerTotal) * 100) 
      : 0;

    // Goals progress
    let goalsDueToday: Goal[] = [];
    let goalsCompleted = 0;

    if (hijriDate && gregorianDate) {
      // Get active goals that are due today
      const activeGoals = goals.filter(g => g.is_active);
      const allDueToday = getGoalsDueOnDate(activeGoals, hijriDate, gregorianDate);
      goalsDueToday = overdueGoalIds ? allDueToday.filter(g => !overdueGoalIds.has(g.id)) : allDueToday;
      
      // Count completed goals
      goalsCompleted = goalsDueToday.filter(goal => isCompleted(goal.id)).length;
    }

    const goalsTotal = goalsDueToday.length;
    const goalsPercentage = goalsTotal > 0 
      ? Math.round((goalsCompleted / goalsTotal) * 100) 
      : 100; // 100% if no goals due

    // Combined progress
    const overallTotal = prayerTotal + goalsTotal;
    const overallCompleted = prayerCompleted + goalsCompleted;
    const overallPercentage = overallTotal > 0 
      ? Math.round((overallCompleted / overallTotal) * 100) 
      : 0;

    return {
      prayerCompleted,
      prayerTotal,
      prayerPercentage,
      goalsCompleted,
      goalsTotal,
      goalsPercentage,
      goalsDueToday,
      overallCompleted,
      overallTotal,
      overallPercentage,
    };
  }, [goals, prayers, hijriDate, gregorianDate, isCompleted, overdueGoalIds]);

  return {
    ...progressData,
    isLoading: goalsLoading || completionsLoading || prayersLoading,
  };
}
