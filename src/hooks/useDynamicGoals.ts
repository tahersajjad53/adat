import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCalendar } from '@/contexts/CalendarContext';
import { useUserPreferences } from './useUserPreferences';
import { isGoalDueOnDate } from '@/lib/recurrence';
import type { AdminGoal } from '@/types/adminGoals';

export function useDynamicGoals() {
  const { user } = useAuth();
  const { currentDate } = useCalendar();
  const { dynamicGoalsEnabled } = useUserPreferences();

  const hijriDate = currentDate?.preMaghribHijri ?? currentDate?.hijri;
  const gregorianDate = currentDate?.gregorian;

  const { data: publishedGoals = [], isLoading } = useQuery({
    queryKey: ['admin-goals-published'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('admin_goals')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data || []) as AdminGoal[];
    },
    enabled: !!user && dynamicGoalsEnabled,
  });

  const dynamicGoalsDueToday = useMemo(() => {
    if (!dynamicGoalsEnabled || !hijriDate || !gregorianDate) return [];
    return publishedGoals.filter((g) => {
      // AdminGoal doesn't have is_active; published goals are treated as active
      const checkable = { ...g, is_active: true };
      return isGoalDueOnDate(checkable, hijriDate, gregorianDate);
    });
  }, [publishedGoals, hijriDate, gregorianDate, dynamicGoalsEnabled]);

  return {
    dynamicGoals: dynamicGoalsDueToday,
    isEnabled: dynamicGoalsEnabled,
    isLoading,
  };
}
