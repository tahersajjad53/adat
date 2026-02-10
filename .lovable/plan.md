

# Overdue Goals -- "Yesterday" / Date Labels + Late Completion

## Overview

Currently, goals only show for the current day. If a goal goes unchecked, it silently disappears the next day. This plan adds Todoist-style overdue tracking: missed goals carry forward with contextual date labels ("Yesterday" or "8 Feb") in red, and completing them late still clears the obligation.

## How It Works

```text
Goal due Feb 8 (daily)
+---------+-------------------+---------------------------+
| Feb 8   | Shows normally    | No label needed           |
| Feb 9   | Still shows       | Red label: "Yesterday"    |
| Feb 10+ | Still shows       | Red label: "8 Feb"        |
| Ticked  | Clears overdue    | Refreshes to next due date|
+---------+-------------------+---------------------------+
```

## Changes

### 1. New utility: `getOverdueGoals` in `src/lib/recurrence.ts`

Add a function that looks back up to 7 days (configurable) from today. For each past day, it checks which goals were due using the existing `isGoalDueOnDate()` logic. It then cross-references with completions for those dates. Any goal that was due but has no completion is returned as "overdue" with metadata:
- `overdueDate`: the Gregorian date when it was due
- `overdueDateLabel`: "Yesterday" or formatted date (e.g., "8 Feb")
- `isOverdue: true`
- `overdueHijriDate`: the Hijri date string (for recording completion against the correct date)

Also add a helper `getOverdueDateLabel(dueDate: Date, today: Date): string` that returns "Yesterday" for 1-day-old and "8 Feb" style for older.

### 2. New hook: `src/hooks/useOverdueGoals.ts`

This hook:
- Gets the current Gregorian/Hijri dates from `CalendarContext`
- Gets all active goals from `useGoals`
- Fetches goal completions for the past 7 days (batch query: `completion_date IN (...)` for all past Hijri dates)
- Uses `getOverdueGoals()` to compute which goals are overdue
- Provides a `completeOverdue(goalId, overdueHijriDate, overdueGregorianDate)` mutation that inserts a completion for the original due date
- Deduplicates: if a goal is overdue from multiple days, only the most recent missed occurrence is shown (to avoid flooding the list)

### 3. Update `src/components/goals/TodaysGoals.tsx`

- Accept a new prop `overdueGoals` (array of goals with overdue metadata)
- Render overdue goals above the today goals, each with a red date label below the title:
  - `<span className="text-xs text-destructive font-medium">Yesterday</span>`
  - or `<span className="text-xs text-destructive font-medium">8 Feb</span>`
- When an overdue goal is ticked, call `completeOverdue()` instead of the regular `toggleCompletion`
- Show overdue count separately in the section header if any exist (e.g., "2 overdue")

### 4. Update `src/components/goals/GoalCard.tsx` (Goals page)

- Accept optional `overdueLabel?: string` prop
- When present, render the red date label beneath the title (same style as TodaysGoals)
- This gives the Goals page the same visual treatment

### 5. Update `src/pages/Goals.tsx`

- Import and use `useOverdueGoals`
- Pass overdue metadata to `GoalCard` via the `GoalList` component
- Overdue goals appear at the top of the list, above regular active goals

### 6. Update `src/pages/Dashboard.tsx`

- Import `useOverdueGoals`
- Pass overdue goals to `TodaysGoals`

### 7. Update `src/hooks/useTodayProgress.ts`

- Overdue goals should NOT count toward today's Ada percentage (they are from past days)
- They are shown for awareness/action but don't inflate the daily total

## Types

Add to `src/types/goals.ts`:
```typescript
export interface OverdueGoal {
  goal: Goal;
  overdueDate: Date;          // Gregorian date when it was due
  overdueDateLabel: string;   // "Yesterday" or "8 Feb"
  overdueHijriDate: string;   // YYYY-MM-DD Hijri for completion recording
}
```

## Edge Cases

- **Daily goals**: If unchecked for 3 days, only the most recent missed day is shown (not 3 copies)
- **Weekly goals**: Only shows as overdue if the specific weekday was missed
- **One-time goals**: Shows as overdue until completed, then disappears permanently
- **Completing an overdue goal**: Records completion against the original Hijri date, then the goal naturally appears for its next scheduled occurrence
- **Lookback window**: 7 days max to avoid performance issues and overwhelming the user

## Files Changed
- `src/lib/recurrence.ts` -- add `getOverdueGoals()` and `getOverdueDateLabel()`
- `src/types/goals.ts` -- add `OverdueGoal` interface
- `src/hooks/useOverdueGoals.ts` -- new hook (batch-fetch past completions, compute overdue)
- `src/components/goals/TodaysGoals.tsx` -- render overdue goals with red labels
- `src/components/goals/GoalCard.tsx` -- accept optional `overdueLabel` prop
- `src/components/goals/GoalList.tsx` -- pass overdue metadata through
- `src/pages/Dashboard.tsx` -- wire up `useOverdueGoals`
- `src/pages/Goals.tsx` -- wire up `useOverdueGoals`, show overdue at top

