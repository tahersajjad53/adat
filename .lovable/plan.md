

## Add Month Name to Calendar Header (Right Side)

**Layout on calendar page:**
- **Left**: "Today" button (stays exactly where it is, no change)
- **Center**: Logo (unchanged)
- **Right**: Month name (e.g. "March") — currently an empty `<div className="w-10" />`

### 1. `src/pages/Calendar.tsx`
- Add `useEffect` that dispatches `calendar:monthChanged` with month string from `selectedDate`
- Format: "March" (current year) or "Mar 2025" (other years)
- On unmount, dispatch empty string to clean up

### 2. `src/components/layout/AppLayout.tsx`
- Add `calendarMonth` state, listen for `calendar:monthChanged` event
- On calendar page right slot: show the month name (`text-sm font-medium text-muted-foreground`) instead of the empty spacer
- Keep the "Today" button in its current left slot, unchanged

