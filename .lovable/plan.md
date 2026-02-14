

# Include Dynamic Goals in Daily Progress Meter

## Problem
When dynamic goals are toggled on and due today, they appear in the Today's Goals list but are **not** counted in the Ada percentage meter. The progress bar only reflects prayers + user-created goals.

## Solution
Pass dynamic goal data into `useTodayProgress` so the combined percentage accounts for dynamic goals too.

## Changes

### 1. `src/hooks/useTodayProgress.ts`
- Accept two new parameters: `dynamicGoals` (array of AdminGoal objects due today) and `isDynamicCompleted` (function to check completion status).
- In the `useMemo` calculation, add dynamic goal counts to the overall totals:
  - `dynamicTotal = dynamicGoals.length`
  - `dynamicCompleted = dynamicGoals.filter(g => isDynamicCompleted(g.id)).length`
- Include these in the combined `overallTotal` and `overallCompleted`.
- Also add dynamic counts to `goalsTotal` and `goalsCompleted` so the breakdown label ("Goals: X/Y") reflects them.

### 2. `src/pages/Dashboard.tsx`
- Pass `dynamicGoals` (from `useDynamicGoals`) and `isDynamicCompleted` (from `useAdminGoalCompletions`) as additional arguments to the `useTodayProgress` hook call.

### 3. `src/pages/Namaz.tsx` (if it also uses `useTodayProgress`)
- Update the call signature to pass empty defaults for the new parameters if dynamic goals are not relevant on that page.

## Technical Notes
- Following the existing state-synchronization pattern: data flows in as parameters rather than being fetched independently inside the hook.
- Dynamic goals that are not enabled will pass as an empty array, so the percentage remains unchanged when the feature is off.
