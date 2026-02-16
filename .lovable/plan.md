

# Dynamic Empty State for Today's Goals

## Problem
The "Create your first goal" CTA always shows when no goals are scheduled today, even for returning users who have goals but just don't have any due today. This feels odd for existing users.

## Solution
Pass a flag (or the total goal count) from the Dashboard to `TodaysGoals` so it can distinguish between:

1. **Brand new user (zero goals ever created):** Show the Hadith quote + "Create your first goal" button (current behavior).
2. **Returning user (has goals, but none due today):** Show a friendlier message like "No goals scheduled today" with a softer CTA like "Create a goal".

## Technical Details

### 1. Dashboard (`src/pages/Dashboard.tsx`)
- The `useGoals()` hook is already imported and provides `goals` (all goals).
- Pass `hasAnyGoals={goals.length > 0}` as a new prop to `TodaysGoals`.

### 2. TodaysGoals (`src/components/goals/TodaysGoals.tsx`)
- Add `hasAnyGoals?: boolean` to the props interface.
- Update the empty state block (lines 92-101) to branch:

```text
if totalDisplay === 0:
  if hasAnyGoals:
    Show: "No goals for today -- enjoy the calm."
    Button: "Create a goal" (rounded-full)
  else:
    Show: Hadith quote (current)
    Button: "Create your first goal" (current)
```

This is a minimal change -- one new prop and a conditional in the empty state.

