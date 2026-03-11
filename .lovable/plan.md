

## Update Month View Header Navigation

### Current behavior
- **Left**: Month label → toggles between week/month view
- **Right**: "Today" → appears only when not showing today, jumps to today's week view

### Desired behavior
- **Left**: Month label → when in **month view**, tapping resets to present month (instead of toggling back to week). When in **week view**, still toggles to month view.
- **Right**: "Today" → always visible when not showing today, jumps to today's **week view** (unchanged)

### Changes

**`src/pages/Calendar.tsx`**:
1. Add a new `calendarInMonthView` state broadcast — emit `calendar:viewChanged` with `{ view: 'week' | 'month' }` whenever `calendarView` changes, so the header knows the current view
2. Add listener for new `calendar:goToCurrentMonth` event — sets view to `'month'` and increments a `monthViewResetKey` to force `MonthView` to remount at the current month
3. Pass `key={monthViewResetKey}` to `<MonthView>`
4. Update existing `calendar:toggleMonthView` listener — keep it for week→month toggle only

**`src/components/layout/AppLayout.tsx`**:
1. Add state `calendarInMonthView` (default `false`), listen for `calendar:viewChanged` events
2. Update the left month button: if in month view, dispatch `calendar:goToCurrentMonth`; if in week view, dispatch `calendar:toggleMonthView` (existing behavior)
3. Right "Today" button: show when `!calendarShowingToday` regardless of view (already works, just ensure month view also broadcasts `showingToday` correctly — it does since `showingToday` is based on `selectedDate`)

