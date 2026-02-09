

# Redesign Dues Reminders to Match Goals UI Pattern

## Overview

Replace the current Card-based `DueRemindersCard` with a flat list layout matching `TodaysGoals` -- a section header with icon + title + count, followed by individual rounded bordered items with checkboxes.

## Changes

### `src/components/dues/DueRemindersCard.tsx`

**Remove**: The `Card`/`CardHeader`/`CardContent` wrapper, `Progress` bar, `Badge` components, and `Button` for marking paid.

**New layout**:
- **Header row**: Bell icon + "Dues Reminders" title (h2, same styling as goals) + `{paidCount}/{totalCount}` counter on the right
- **Each reminder item**: Same `rounded-xl border border-border bg-card p-4` card style as goal items, with:
  - A `Checkbox` on the left (checked when paid, triggers `markAsPaid` with confetti)
  - Title with strike-through when paid, plus calendar type icon inline
  - Subtitle line: amount and due date (with strike-through when paid)
  - Check icon on the right when paid (matching goals' completed state)
- **Empty state**: Same pattern as goals -- centered text with "No dues reminders right now"
- Remove the monthly progress bar at the bottom (the count in the header serves this purpose)

### Technical Details

- Import `Checkbox` and `useConfetti` to match goals pattern
- Remove imports: `Card`, `CardContent`, `CardHeader`, `CardTitle`, `Progress`, `Badge`, `Button`
- Keep urgency logic but express it through subtle text color rather than background colors (to stay consistent with the clean goals style)
- The component remains self-contained with its own hooks (`useDueReminders`, `useDuePayments`)
- Continue returning `null` when loading or no reminders exist

