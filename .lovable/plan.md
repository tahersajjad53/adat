

# Make Dynamic Goals Draggable Among User Goals

## Problem
Dynamic (admin-published) goals are currently rendered as static cards below the user's draggable goals. Users cannot reorder them or interleave them with their own goals.

## Approach
Merge dynamic goals into the same drag-and-drop list as user goals. Store the user's custom ordering in a new `goal_sort_order` JSON column on `user_preferences`. This way each user controls their own arrangement without affecting the admin's published order.

## Changes

### 1. Database Migration -- Add `goal_sort_order` column
Add a `jsonb` column `goal_sort_order` to `user_preferences` to persist the combined ordered list of goal IDs (both user and dynamic). Format: `["user-id-1", "dynamic:admin-id-2", "user-id-3", ...]`. Dynamic goal IDs are prefixed with `dynamic:` to distinguish them.

### 2. `src/types/goals.ts` -- Add `isDynamic` flag
Add an optional `isDynamic?: boolean` field to `GoalWithStatus` so the card can render differently for dynamic goals (no edit/delete menu, show Dynamic badge).

### 3. `src/components/goals/GoalCard.tsx` -- Handle dynamic goals
- When `goal.isDynamic` is true: hide the edit/delete dropdown menu, show a "Dynamic" badge, and make the content area non-clickable (no edit action).
- Keep the drag handle, checkbox, and confetti behavior for both types.

### 4. `src/pages/Goals.tsx` -- Merge lists into one DnD context
- Convert dynamic goals into `GoalWithStatus`-shaped objects with `isDynamic: true`.
- Merge user goals and dynamic goals into a single combined list.
- Sort the combined list using the persisted `goal_sort_order` from preferences (new goals not in the saved order append at the end).
- Pass the merged list to a single `GoalList` component.
- Remove the separate inline rendering of dynamic goals.
- On reorder, save the new ordered ID list (with `dynamic:` prefixes) to `user_preferences.goal_sort_order`.

### 5. `src/hooks/useUserPreferences.ts` -- Expose goal sort order
- Read and expose `goal_sort_order` from the preferences row.
- Add a `setGoalSortOrder` mutation to persist the ordered ID array.

### 6. `src/hooks/useGoals.ts` -- Update reorder to handle mixed lists
- The `reorderGoals` mutation will now receive the full ordered ID list (including `dynamic:` prefixed IDs).
- User goal `sort_order` values are updated in the `goals` table as before (filtering out dynamic IDs).
- The full combined order is saved to `user_preferences.goal_sort_order` for persistence.

## Technical Details

- Dynamic goal IDs in the sort order use a `dynamic:` prefix to avoid collisions with user goal UUIDs.
- When dynamic goals are toggled off, they are simply filtered out of the merged list; the sort order is preserved for when they are re-enabled.
- New goals (user or dynamic) not found in the saved sort order are appended at the end of the list.

