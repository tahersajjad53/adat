// Recurrence utilities for goal scheduling
import type { RecurrencePattern } from '@/types/goals';
import type { HijriDate } from '@/lib/hijri';
export type { HijriDate };

/** Minimal shape needed for recurrence checking (works with Goal and AdminGoal) */
export interface RecurrenceCheckable {
  is_active?: boolean;
  start_date: string;
  end_date?: string | null;
  recurrence_type: string;
  recurrence_days?: number[] | null;
  recurrence_pattern?: RecurrencePattern | null;
  due_date?: string | null;
}

/**
 * Check if a goal is due on a specific date
 */
export function isGoalDueOnDate(
  goal: RecurrenceCheckable,
  hijriDate: HijriDate,
  gregorianDate: Date
): boolean {
  // Inactive goals are never due (default to active if not specified)
  if (goal.is_active === false) return false;

  // Normalize to date-only strings for comparison (avoid timezone issues)
  const gregDateStr = `${gregorianDate.getFullYear()}-${String(gregorianDate.getMonth() + 1).padStart(2, '0')}-${String(gregorianDate.getDate()).padStart(2, '0')}`;

  if (gregDateStr < goal.start_date) return false;

  if (goal.end_date) {
    if (gregDateStr > goal.end_date) return false;
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

    case 'annual':
      return isAnnualDue(goal, hijriDate, gregorianDate);

    default:
      return false;
  }
}

/**
 * Check if a weekly goal is due on the given day
 */
function isWeeklyDue(goal: RecurrenceCheckable, gregorianDate: Date): boolean {
  if (!goal.recurrence_days || goal.recurrence_days.length === 0) {
    return false;
  }
  const dayOfWeek = gregorianDate.getDay();
  return goal.recurrence_days.includes(dayOfWeek);
}

/**
 * Check if a custom recurrence goal is due
 */
function isCustomDue(
  goal: RecurrenceCheckable,
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
  goal: RecurrenceCheckable,
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
function isOneTimeDue(goal: RecurrenceCheckable, gregorianDate: Date): boolean {
  if (!goal.due_date) return false;

  const dueDate = new Date(goal.due_date);
  return (
    gregorianDate.getFullYear() === dueDate.getFullYear() &&
    gregorianDate.getMonth() === dueDate.getMonth() &&
    gregorianDate.getDate() === dueDate.getDate()
  );
}

/**
 * Check if an annual goal is due on the specific month+day
 */
function isAnnualDue(
  goal: RecurrenceCheckable,
  hijriDate: HijriDate,
  gregorianDate: Date
): boolean {
  const pattern = goal.recurrence_pattern as RecurrencePattern | null;
  if (!pattern || pattern.type !== 'annual' || !pattern.annualMonth || !pattern.monthlyDay) {
    return false;
  }

  const calendarType = pattern.calendarType || 'hijri';

  if (calendarType === 'hijri') {
    return hijriDate.month === pattern.annualMonth && hijriDate.day === pattern.monthlyDay;
  } else {
    // Gregorian: month is 1-indexed in pattern, getMonth() is 0-indexed
    return (
      gregorianDate.getMonth() + 1 === pattern.annualMonth &&
      gregorianDate.getDate() === pattern.monthlyDay
    );
  }
}

/**
 * Get all goals that are due on a specific date
 */
export function getGoalsDueOnDate<T extends RecurrenceCheckable>(
  goals: T[],
  hijriDate: HijriDate,
  gregorianDate: Date
): T[] {
  return goals.filter(goal => isGoalDueOnDate(goal, hijriDate, gregorianDate));
}

/**
 * Get a human-readable description of the recurrence pattern
 */
export function getRecurrenceDescription(goal: RecurrenceCheckable): string {
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
        const date = new Date(goal.due_date + 'T00:00:00');
        const now = new Date();
        const isToday = date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth() &&
          date.getDate() === now.getDate();
        if (isToday) return 'Today';
        return `One-time (${date.toLocaleDateString()})`;
      }
      return 'One-time';

    case 'annual': {
      const p = goal.recurrence_pattern as RecurrencePattern | null;
      if (p && p.annualMonth && p.monthlyDay) {
        const cal = p.calendarType || 'hijri';
        const monthNames = cal === 'hijri'
          ? ['', 'Muharram', 'Safar', 'Rabi I', 'Rabi II', 'Jumada I', 'Jumada II', 'Rajab', 'Shabaan', 'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah']
          : ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `Annual (${p.monthlyDay} ${monthNames[p.annualMonth] || ''})`;
      }
      return 'Annual';
    }

    default:
      return 'Unknown';
  }
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function getCustomDescription(pattern: RecurrencePattern | null | undefined): string {
  if (!pattern) return 'Custom';

  switch (pattern.type) {
    case 'interval':
      if (!pattern.interval || !pattern.intervalUnit) return 'Custom';
      const unit = pattern.interval === 1 
        ? pattern.intervalUnit.slice(0, -1)
        : pattern.intervalUnit;
      return `Every ${pattern.interval} ${unit}`;

    case 'monthly':
      if (!pattern.monthlyDay) return 'Monthly';
      const calType = pattern.calendarType === 'gregorian' ? 'Gregorian' : 'Hijri';
      return `${ordinal(pattern.monthlyDay)} of each month (${calType})`;

    default:
      return 'Custom';
  }
}

/**
 * Get a human-readable label for an overdue date relative to today.
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
 */
export function findOverdueGoals<T extends RecurrenceCheckable & { id: string }>(
  goals: T[],
  today: Date,
  todayHijri: HijriDate,
  pastCompletionDates: Set<string>,
  lookbackDays: number = 7,
  getHijriForDate: (date: Date) => HijriDate,
): Array<{ goal: T; overdueDate: Date; overdueHijriDate: HijriDate }> {
  const result: Array<{ goal: T; overdueDate: Date; overdueHijriDate: HijriDate }> = [];
  const seenGoalIds = new Set<string>();

  for (let daysAgo = 1; daysAgo <= lookbackDays; daysAgo++) {
    const pastDate = new Date(today);
    pastDate.setDate(pastDate.getDate() - daysAgo);
    const pastHijri = getHijriForDate(pastDate);

    for (const goal of goals) {
      if (goal.is_active === false) continue;
      if (seenGoalIds.has(goal.id)) continue;

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

/**
 * Find ALL missed dates for a single goal within the lookback window.
 */
export function findAllMissedDatesForGoal(
  goal: RecurrenceCheckable & { id: string },
  today: Date,
  completionKeys: Set<string>,
  lookbackDays: number,
  getHijriForDate: (date: Date) => HijriDate,
): Array<{ gregorianDate: Date; hijriDate: HijriDate }> {
  const result: Array<{ gregorianDate: Date; hijriDate: HijriDate }> = [];

  for (let daysAgo = 1; daysAgo <= lookbackDays; daysAgo++) {
    const pastDate = new Date(today);
    pastDate.setDate(pastDate.getDate() - daysAgo);
    const pastHijri = getHijriForDate(pastDate);

    if (isGoalDueOnDate(goal, pastHijri, pastDate)) {
      const hijriStr = `${pastHijri.year}-${String(pastHijri.month).padStart(2, '0')}-${String(pastHijri.day).padStart(2, '0')}`;
      const key = `${goal.id}:${hijriStr}`;

      if (!completionKeys.has(key)) {
        result.push({ gregorianDate: pastDate, hijriDate: pastHijri });
      }
    }
  }

  return result;
}
