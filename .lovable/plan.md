

# Open Goal Creation Form from Today Page Empty State

## What Changes
Instead of navigating to `/goals`, the Today page empty state should directly open the goal creation form. This requires adding a callback prop to `TodaysGoals` that the parent (`Dashboard.tsx`) provides.

## Technical Details

### 1. `src/components/goals/TodaysGoals.tsx`
- Add a new prop `onCreateGoal?: () => void` to the component interface
- Replace `onClick={() => navigate('/goals')}` on the button (line 96) with `onClick={onCreateGoal}`
- Make the quote text also clickable with the same `onCreateGoal` handler

### 2. `src/pages/Dashboard.tsx`
- Import `GoalFormSheet` and the `useGoals` hook (for the `addGoal` mutation)
- Add state: `const [goalFormOpen, setGoalFormOpen] = useState(false)`
- Create handler: `const handleCreateGoal = () => setGoalFormOpen(true)`
- Pass `onCreateGoal={handleCreateGoal}` to `<TodaysGoals />`
- Render `<GoalFormSheet open={goalFormOpen} onOpenChange={setGoalFormOpen} onSubmit={...} />` in the JSX

This way tapping the quote or the CTA button opens the goal creation sheet directly on the Today page without any navigation.

