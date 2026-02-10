
# Deduplicate Overdue + Today Goals

## Problem
When a recurring goal (e.g., daily "Dua Kamil") is missed, the app shows TWO entries: one overdue copy with a "Yesterday" label AND the regular today copy. The user should only see ONE instance -- the overdue version with its label. Completing it clears the obligation; the goal then naturally reappears for its next occurrence.

## Approach
Filter out any goal from the "today" list if it already appears in the overdue list. This is a simple ID-based exclusion applied in two places.

## Changes

### 1. `src/pages/Dashboard.tsx`
- After getting `overdueGoals` and `goalsDueToday`, filter `goalsDueToday` to exclude any goal whose ID is in the overdue list
- Update `goalsTotal` and `goalsCompleted` counts accordingly

### 2. `src/hooks/useTodayProgress.ts`
- Accept an optional `overdueGoalIds` parameter (a `Set<string>`)
- When computing `goalsDueToday`, exclude goals whose IDs are in the overdue set
- This ensures the Ada percentage and counts reflect the deduplicated list

### 3. `src/components/goals/TodaysGoals.tsx`
- Update the counter display: the total should be `goalsTotal` (already deduplicated from above), not `goalsTotal + overdueGoals.length`
- Remove the current `totalDisplay = goalsTotal + overdueGoals.length` line and just use `goalsTotal` directly for the empty-state check (but include overdue count so empty state doesn't show when there are overdue items)

### 4. `src/pages/Goals.tsx`
- No structural changes needed here since the Goals page shows all goals as a management list with overdue labels -- it doesn't duplicate entries

## Technical Details

The key filtering logic in Dashboard.tsx:
```typescript
const overdueGoalIds = new Set(overdueGoals.map(o => o.goal.id));
const filteredGoalsDueToday = goalsDueToday.filter(g => !overdueGoalIds.has(g.id));
```

This is passed to `TodaysGoals` as `goalsDueToday={filteredGoalsDueToday}`.

For `useTodayProgress`, the hook will accept an optional exclusion set so progress calculations stay accurate without double-counting.

## Files Changed
- `src/hooks/useTodayProgress.ts` -- accept optional `overdueGoalIds` param, exclude from today's count
- `src/pages/Dashboard.tsx` -- pass overdue IDs to progress hook and filter goals for TodaysGoals
- `src/components/goals/TodaysGoals.tsx` -- fix total count to not add overdue on top of today
