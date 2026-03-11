

## Swap Header Labels on Calendar Page

Swap the left and right slots in the mobile header when on the Calendar page:

- **Left slot**: Show the abbreviated month name (currently on the right)
- **Right slot**: Show the "Today" button when not showing today (currently on the left)

### Changes in `src/components/layout/AppLayout.tsx`

1. **Left slot** (`isCalendarPage` branch): Show `calendarMonth` text instead of the "Today" button
2. **Right slot** (`isCalendarPage` branch): Show the "Today" button (with its `calendar:goToToday` dispatch) instead of the month text
3. When showing today, right slot falls back to an empty spacer

