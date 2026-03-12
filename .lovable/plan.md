

## Add "Create Goal" CTA to Calendar Timeline

### Changes

**`src/components/calendar/CalendarTimeline.tsx`**
- Add new prop `onCreateGoal?: () => void`
- Render a discreet CTA card at the very top of the timeline (before the chronological items, above Nisful Layl)
- Style: same `rounded-xl px-4 py-4` as prayer cards, with a subtle dashed border (`border-dashed border-border`), muted text, and a `+` icon — blends in without being loud

**`src/pages/Calendar.tsx`**
- Add `creatingGoal` boolean state and wire up a new `GoalFormSheet` instance for creation (separate from the edit one)
- Pre-populate the goal form's date with the currently selected calendar date by passing a default goal stub with `start_date` and `due_date` set to `formatDateKey(selectedDate)`
- Pass `onCreateGoal` callback to `CalendarTimeline`

**`src/components/goals/GoalFormSheet.tsx`**
- No changes needed — it already reads `goal.start_date` / `goal.due_date` in the `useEffect` on open, and falls back to defaults for new goals. We'll pass a partial "template" goal with just the date fields to seed the form.

### CTA Design
- Matches prayer card dimensions: `rounded-xl px-4 py-4`
- Dashed border, muted foreground text
- `+ Add Goal` label with a Plus icon
- Positioned as the first item in the timeline, above Nisful Layl

