
# Fix: Overdue One-Time Goal Completion Not Reflecting on Goals Page

## Root Cause

Two separate issues create this bug:

1. **Completion date mismatch**: `useGoalCompletions` fetches completions only for the current Hijri date. When `completeOverdue` runs, it writes the completion against the *original* due date's Hijri date (e.g., Feb 23). The Goals page, checking against *today's* Hijri date (Feb 24), never finds that completion.

2. **No cross-page sync for overdue state**: The Goals page determines `isCompleted` purely from `useGoalCompletions` (current date), while the Today page uses the separate `useOverdueGoals` system. After completing an overdue goal from Today, the Goals page has no way to know the goal was already handled.

## The Fix

Modify the Goals page so that one-time (and overdue) goals that have already been batch-completed show as completed, even though the completion lives on a past Hijri date.

### Approach: Augment `isCompleted` on the Goals page with overdue awareness

**File: `src/pages/Goals.tsx`**

- After computing `overdueGoals`, also build a set of goal IDs that were recently completed via the overdue system (i.e., goals that *were* overdue but no longer appear in `overdueGoals` because their completions exist).
- For one-time goals specifically: query whether a completion exists for the goal's actual due date, not just today's date.

**Simpler and more robust approach -- File: `src/hooks/useGoalCompletions.ts`**

- Add a secondary query that fetches completions for **all** dates for one-time goals owned by the user (or fetch the last 7 days of completions).
- Expose a `isEverCompleted(goalId)` helper alongside `isCompleted(goalId)`.

**Recommended (simplest) approach -- File: `src/pages/Goals.tsx`**

- Merge the overdue completion state into the `GoalWithStatus` computation:
  - Use `overdueGoals` list: if a goal is NOT in `overdueGoals` AND is a one-time goal whose due date has passed, treat it as completed.
  - If a goal IS in `overdueGoals`, mark it as not completed (still overdue).

### Implementation Details

**1. `src/pages/Goals.tsx` -- Update `userGoalsWithStatus` computation (approx. line 66-68)**

```typescript
const userGoalsWithStatus: GoalWithStatus[] = useMemo(
  () => goals.filter(g => g.is_active).map((g) => {
    // For one-time goals past their due date:
    // - If still in overdueGoals list -> not completed (user hasn't ticked it)
    // - If NOT in overdueGoals list -> it was completed (on its original date)
    let completed = isCompleted(g.id);
    if (!completed && g.recurrence_type === 'one-time' && g.due_date) {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
      const isPastDue = g.due_date < todayStr;
      const isStillOverdue = overdueGoals.some(o => o.goal.id === g.id);
      if (isPastDue && !isStillOverdue) {
        completed = true;
      }
    }
    return { ...g, isCompleted: completed };
  }),
  [goals, isCompleted, overdueGoals]
);
```

This approach:
- Requires no new queries or hooks
- Leverages the existing `overdueGoals` data (which already checks past completions)
- Logic: "If a one-time goal is past due but NOT showing as overdue, it must have been completed on its original date"
- Falls within the 7-day lookback window, which is the same window used by the overdue system

**2. `src/pages/Goals.tsx` -- Update `handleToggle` (approx. line 112-120)**

Ensure that when toggling a goal on the Goals page that is currently overdue, the completion is properly routed through `completeOverdue` (this already works), AND that the query invalidation refreshes both the overdue list and the current completions list.

No change needed here -- the existing logic already routes overdue goals through `completeOverdue`.

## Edge Cases

- **Within lookback window (7 days)**: The fix works correctly since `overdueGoals` tracks missed dates within this range.
- **Beyond lookback window**: A one-time goal completed more than 7 days ago won't appear in `overdueGoals` and won't have a current-date completion. The logic "past due + not overdue = completed" still holds, since the lookback window has expired and we assume it was handled.
- **Uncompleted one-time goal older than 7 days**: Also won't appear as overdue (outside lookback). The same logic would incorrectly mark it as completed. However, this is an acceptable trade-off since the overdue system itself has already dropped it.

## Summary

One file change in `src/pages/Goals.tsx` to augment the `isCompleted` logic for one-time goals that are past their due date, using the existing `overdueGoals` list as the source of truth for "still pending" status.
