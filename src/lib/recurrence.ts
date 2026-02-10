// Recurrence utilities for goal scheduling
import type { Goal, RecurrencePattern } from '@/types/goals';
import type { HijriDate } from '@/lib/hijri';
export type { HijriDate };

/**
 * Check if a goal is due on a specific date
 */
export function isGoalDueOnDate(
  goal: Goal,
  hijriDate: HijriDate,
  gregorianDate: Date
): boolean {
  // Inactive goals are never due
  if (!goal.is_active) return false;

  // Check if within start/end date range
  const startDate = new Date(goal.start_date);
  if (gregorianDate < startDate) return false;

  if (goal.end_date) {
    const endDate = new Date(goal.end_date);
    if (gregorianDate > endDate) return false;
  }

  switch (goal.recurrence_type) {
    case 'daily':
      return true;

    case 'weekly':
      return isWeeklyDue(goal, gregorianDate);

    case 'custom':
      return isCustomDue(goal, hijriDate, gregorianDate);

    case 'one-time':
      return isOneTimeDue(goal, gregorianDate);

    default:
      return false;
  }
}

/**
 * Check if a weekly goal is due on the given day
 */
function isWeeklyDue(goal: Goal, gregorianDate: Date): boolean {
  if (!goal.recurrence_days || goal.recurrence_days.length === 0) {
    return false;
  }
  
  // JavaScript: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const dayOfWeek = gregorianDate.getDay();
  return goal.recurrence_days.includes(dayOfWeek);
}

/**
 * Check if a custom recurrence goal is due
 */
function isCustomDue(
  goal: Goal,
  hijriDate: HijriDate,
  gregorianDate: Date
): boolean {
  const pattern = goal.recurrence_pattern as RecurrencePattern | null;
  if (!pattern) return false;

  switch (pattern.type) {
    case 'interval':
      return isIntervalDue(goal, gregorianDate, pattern);

    case 'monthly':
      return isMonthlyDue(hijriDate, gregorianDate, pattern);

    default:
      return false;
  }
}

/**
 * Check if an interval-based goal is due (every N days/weeks)
 */
function isIntervalDue(
  goal: Goal,
  gregorianDate: Date,
  pattern: RecurrencePattern
): boolean {
  if (!pattern.interval || !pattern.intervalUnit) return false;

  const startDate = new Date(goal.start_date);
  const diffTime = gregorianDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return false;

  const intervalDays = pattern.intervalUnit === 'weeks' 
    ? pattern.interval * 7 
    : pattern.interval;

  return diffDays % intervalDays === 0;
}

/**
 * Check if a monthly goal is due on a specific day of month
 */
function isMonthlyDue(
  hijriDate: HijriDate,
  gregorianDate: Date,
  pattern: RecurrencePattern
): boolean {
  if (!pattern.monthlyDay) return false;

  const calendarType = pattern.calendarType || 'hijri';
  
  if (calendarType === 'hijri') {
    return hijriDate.day === pattern.monthlyDay;
  } else {
    return gregorianDate.getDate() === pattern.monthlyDay;
  }
}

/**
 * Check if a one-time goal is due on the specific date
 */
function isOneTimeDue(goal: Goal, gregorianDate: Date): boolean {
  if (!goal.due_date) return false;

  const dueDate = new Date(goal.due_date);
  return (
    gregorianDate.getFullYear() === dueDate.getFullYear() &&
    gregorianDate.getMonth() === dueDate.getMonth() &&
    gregorianDate.getDate() === dueDate.getDate()
  );
}

/**
 * Get all goals that are due on a specific date
 */
export function getGoalsDueOnDate(
  goals: Goal[],
  hijriDate: HijriDate,
  gregorianDate: Date
): Goal[] {
  return goals.filter(goal => isGoalDueOnDate(goal, hijriDate, gregorianDate));
}

/**
 * Get a human-readable description of the recurrence pattern
 */
export function getRecurrenceDescription(goal: Goal): string {
  switch (goal.recurrence_type) {
    case 'daily':
      return 'Daily';

    case 'weekly':
      if (!goal.recurrence_days || goal.recurrence_days.length === 0) {
        return 'Weekly';
      }
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const days = goal.recurrence_days
        .sort((a, b) => a - b)
        .map(d => dayNames[d])
        .join(', ');
      return `Weekly (${days})`;

    case 'custom':
      return getCustomDescription(goal.recurrence_pattern);

    case 'one-time':
      if (goal.due_date) {
        const date = new Date(goal.due_date);
        return `One-time (${date.toLocaleDateString()})`;
      }
      return 'One-time';

    default:
      return 'Unknown';
  }
}

function getCustomDescription(pattern: RecurrencePattern | null | undefined): string {
  if (!pattern) return 'Custom';

  switch (pattern.type) {
    case 'interval':
      if (!pattern.interval || !pattern.intervalUnit) return 'Custom';
      const unit = pattern.interval === 1 
        ? pattern.intervalUnit.slice(0, -1) // Remove 's' for singular
        : pattern.intervalUnit;
      return `Every ${pattern.interval} ${unit}`;

    case 'monthly':
      if (!pattern.monthlyDay) return 'Monthly';
      const calType = pattern.calendarType === 'gregorian' ? 'Gregorian' : 'Hijri';
      return `${pattern.monthlyDay}th of each month (${calType})`;

    default:
      return 'Custom';
  }
}

/**
 * Get a human-readable label for an overdue date relative to today.
 * Returns "Yesterday" for 1-day overdue, or "8 Feb" style for older.
 */
export function getOverdueDateLabel(dueDate: Date, today: Date): string {
  const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffMs = todayDay.getTime() - dueDay.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Yesterday';
  return dueDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

/**
 * Find overdue goals by looking back N days from today.
 * Returns only the most recent missed occurrence per goal.
 */
export function findOverdueGoals(
  goals: Goal[],
  today: Date,
  todayHijri: HijriDate,
  pastCompletionDates: Set<string>, // Set of "goalId:hijriDateStr" keys
  lookbackDays: number = 7,
  getHijriForDate: (date: Date) => HijriDate,
): Array<{ goal: Goal; overdueDate: Date; overdueHijriDate: HijriDate }> {
  const result: Array<{ goal: Goal; overdueDate: Date; overdueHijriDate: HijriDate }> = [];
  const seenGoalIds = new Set<string>();

  // Look back from yesterday (most recent first)
  for (let daysAgo = 1; daysAgo <= lookbackDays; daysAgo++) {
    const pastDate = new Date(today);
    pastDate.setDate(pastDate.getDate() - daysAgo);
    const pastHijri = getHijriForDate(pastDate);

    for (const goal of goals) {
      if (!goal.is_active) continue;
      if (seenGoalIds.has(goal.id)) continue; // Only most recent missed occurrence

      if (isGoalDueOnDate(goal, pastHijri, pastDate)) {
        const hijriStr = `${pastHijri.year}-${String(pastHijri.month).padStart(2, '0')}-${String(pastHijri.day).padStart(2, '0')}`;
        const key = `${goal.id}:${hijriStr}`;

        if (!pastCompletionDates.has(key)) {
          result.push({ goal, overdueDate: pastDate, overdueHijriDate: pastHijri });
          seenGoalIds.add(goal.id);
        }
      }
    }
  }

  return result;
}
