

## Show "Today" CTA in Month View Header

Currently the "Today" button on the right only shows when `!calendarShowingToday` and NOT in month view (since the month view condition is checked first at line 145). The right slot shows nothing specific for month view.

### Change in `src/components/layout/AppLayout.tsx` (lines 112-154)

Update the right-side conditional to show "Today" when on the calendar page **and** in month view, dispatching `calendar:goToToday` (which already resets to week view + today).

The right-side logic becomes:
1. Goals page → 3-dot menu
2. Namaz page → 3-dot menu  
3. **Calendar page in month view** → always show "Today"
4. Calendar page in week view, not showing today → show "Today"
5. Otherwise → empty spacer

This reuses the existing `calendarInMonthView` state and the `calendar:goToToday` event already handled in `Calendar.tsx`.

