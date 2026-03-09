

## Hide "One-time" Recurrence Label

The "One-time" badge on goal cards adds no useful information — users naturally infer a goal is one-time when no recurrence label is shown.

### Changes

**`src/components/goals/GoalCard.tsx`** — Conditionally render the recurrence `Badge` only when `recurrenceLabel` is not `"One-time"`.

**`src/components/goals/TodaysGoals.tsx`** — No change needed since TodaysGoals doesn't show recurrence badges.

