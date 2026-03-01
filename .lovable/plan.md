

## Plan: Apply user sort order to Today's Goals

### Problem
The Goals page respects `goalSortOrder` from `useUserPreferences` to display a unified, user-ordered list. The Dashboard's `TodaysGoals` component ignores this entirely — it renders overdue goals first, then `goalsDueToday` in DB order, then dynamic goals at the bottom.

### Approach
Update `Dashboard.tsx` to sort `goalsDueToday` and `dynamicGoals` using the same `goalSortOrder` preference, then pass a single sorted list to `TodaysGoals`. This requires refactoring `TodaysGoals` to accept a unified ordered list instead of separate `goalsDueToday` + `dynamicGoals` arrays.

### Changes

**`src/pages/Dashboard.tsx`**
- Import `useUserPreferences` and read `goalSortOrder`
- After getting `goalsDueToday` and `dynamicGoals`, merge them into a single sorted array using the same logic as `Goals.tsx` (sort by `goalSortOrder`, with unordered user goals first, dynamic goals after)
- Pass the sorted list to `TodaysGoals` via a new prop pattern

**`src/components/goals/TodaysGoals.tsx`**
- Add a new optional `sortedGoals` prop that accepts a pre-sorted array of `GoalWithStatus` items (containing both user and dynamic goals with `isDynamic` flag)
- When `sortedGoals` is provided, render from that single list instead of separate `goalsDueToday` / `dynamicGoals` arrays
- Each item checks `isDynamic` to determine which toggle handler and badge to use
- Overdue goals remain rendered first (before the sorted list), unchanged

### Result
Goals on the Today page will mirror the order set on the Goals page. Dynamic goals without a custom position will appear after user goals by default.

