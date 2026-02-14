

# Match Goals Page Empty State Styling to Today Page

## What Changes
Align the Goals page empty state styling with the Today page's hadith styling, which is more compact and refined.

## File to Edit

### `src/pages/Goals.tsx` (lines 153-160)
Update the empty state container and quote styling:
- Container: change `py-16 space-y-6` to `py-8 space-y-4`
- Quote text: change `text-lg max-w-sm` to `text-sm max-w-xs mx-auto`
- Keep the existing quote text and CTA button as-is

These changes mirror the exact classes used in `TodaysGoals.tsx` for a consistent look across both pages.

