

## Fix: Overdue Goal Completion Should Clear All Past Misses

### Problem

When a recurring daily goal is missed for multiple days (e.g., missed Feb 11-13), the system currently:
1. Shows the most recent miss (Feb 13 = "Yesterday") -- correct
2. When ticked, only records a completion for that single date (Feb 13)
3. This causes the next oldest miss (Feb 12) to surface, then Feb 11, creating a chain of old overdue items instead of moving forward

### Expected Behavior

Ticking an overdue goal should clear the entire backlog of missed occurrences at once, so the goal refreshes to its next scheduled date (e.g., Feb 15 if completed on Feb 14).

### Solution

Modify the `completeOverdue` function in `useOverdueGoals.ts` to insert completions for **all** missed dates of that goal, not just the single displayed one.

### Technical Details

**File: `src/hooks/useOverdueGoals.ts`**

1. Expose the full list of missed dates per goal from `findOverdueGoals`, not just the most recent one.

2. In the `completeOverdueMutation`, instead of inserting a single completion row, insert completions for every missed date of the goal in one batch insert.

**File: `src/lib/recurrence.ts`** -- `findOverdueGoals` function

3. Add a new companion function `findAllOverdueDatesForGoal` (or modify `findOverdueGoals` to collect all missed dates per goal instead of stopping at the first). The existing function uses `seenGoalIds` to skip after the first hit -- we need all hits for the batch-complete operation.

**Detailed changes:**

- `src/lib/recurrence.ts`: Add a helper `findAllMissedDatesForGoal(goal, today, completionKeys, lookbackDays, getHijriForDate)` that returns all missed date pairs (gregorian + hijri) within the lookback window for a single goal.
- `src/hooks/useOverdueGoals.ts`:
  - In `completeOverdue(goalId)`, call the new helper to get all missed dates for that goal
  - Change the mutation to batch-insert completions for all missed dates at once (Supabase `.insert([...array])`)
  - The UI display logic stays the same (only the most recent miss is shown per goal)

### Files Modified
- `src/lib/recurrence.ts` -- add helper to find all missed dates for a goal
- `src/hooks/useOverdueGoals.ts` -- batch-insert completions for all missed dates when completing an overdue goal
