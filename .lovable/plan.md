

## Make User Goals Editable from Today Page

### Problem
Currently, tapping any goal on the Today page opens a read-only `GoalDetailSheet`. User-created goals should open the editable `GoalFormSheet` (same as the Goals page), while only dynamic goals should show the read-only detail view.

### Changes

**1. `src/components/goals/TodaysGoals.tsx`**
- Add new prop `onEditGoal?: (goal: Goal) => void`
- In `renderGoalRow`: when a non-dynamic goal is clicked, call `onEditGoal(goal)` instead of `setViewingGoal`
- Dynamic goals continue to use `setViewingGoal` → `GoalDetailSheet` (read-only)
- Overdue goals also call `onEditGoal` since they are user-created

**2. `src/pages/Dashboard.tsx`**
- Import `updateGoal` and `isUpdating` from `useGoals()`
- Add `editingGoal` state to track which goal is being edited
- Pass `onEditGoal` callback to `TodaysGoals` that sets `editingGoal`
- Wire the existing `GoalFormSheet` to handle both create and edit modes:
  - When `editingGoal` is set, pass it as the `goal` prop
  - On submit, call `updateGoal` instead of `createGoal`
  - On delete, call `deleteGoal` and close the sheet
  - On close, clear `editingGoal`

### Result
- Tapping a **user goal** on Today → opens `GoalFormSheet` in edit mode (title, recurrence, delete, etc.)
- Tapping a **dynamic goal** on Today → opens read-only `GoalDetailSheet` (unchanged)

