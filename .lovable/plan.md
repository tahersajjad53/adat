

## Month View for Calendar Page

### Overview
Add a new "Month View" accessible by tapping the month label in the calendar header. It shows a full month grid with dot indicators for qaza (red) and goals (theme-colored). Swiping up/down navigates months. Tapping a day returns to the week view for that day. The month label in the header gets CTA styling matching the Today button.

### New Files

**`src/components/calendar/MonthView.tsx`**
- Full-screen month grid component replacing the week view + timeline
- Header: month name + year (e.g. "March 2026")
- 7-column grid (Sun-Sat), rows for each week of the month
- Each day cell shows the date number + dot indicators:
  - Red dot: qaza (missed prayers) — reuse the same Supabase query logic from `useWeekQazaIndicators`
  - Primary-colored dot: goals due that day — use `isGoalDueOnDate` from `src/lib/recurrence.ts`
- Today highlighted with accent background, same pattern as WeekRow
- Touch swipe up/down to navigate months (similar animation pattern to WeekRow's horizontal swipe)
- Tapping a day calls `onSelectDate(date)` which exits month view and selects that day in week view

**`src/hooks/useMonthIndicators.ts`**
- New hook similar to `useWeekQazaIndicators` but for an entire month date range
- Fetches prayer logs for the full month to compute qaza days (returns `Set<string>`)
- Computes goal days by iterating each day of the month and checking `isGoalDueOnDate` against user's goals (returns `Set<string>`)
- Single Supabase query for the month range, keeps it efficient

### Modified Files

**`src/pages/Calendar.tsx`**
- Add `calendarView` state: `'week' | 'month'` (default `'week'`)
- Listen for `calendar:toggleMonthView` event from header to toggle view
- When `calendarView === 'month'`: render `<MonthView>` instead of `<WeekRow>` + date header + `<CalendarTimeline>`
- When user taps a day in month view: set `selectedDate`, compute proper `weekOffset`, switch back to `'week'` view
- Dispatch `calendar:viewChanged` event so header knows which view is active

**`src/components/layout/AppLayout.tsx`**
- Style the month label with CTA styling matching the Today button: `text-sm font-medium text-primary` (instead of `text-muted-foreground`)
- On tap, dispatch `calendar:toggleMonthView` event
- Make it a `<button>` instead of `<span>`

### Month View Layout
```text
┌─────────────────────────────┐
│       March 2026            │  ← month/year header inside view
├───┬───┬───┬───┬───┬───┬───┤
│Sun│Mon│Tue│Wed│Thu│Fri│Sat│
├───┼───┼───┼───┼───┼───┼───┤
│ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │
│   │ ● │●● │   │ ● │   │   │  ← dots row
├───┼───┼───┼───┼───┼───┼───┤
│ 8 │ 9 │⑩ │11 │12 │13 │14 │  ← 10 = today
│...                          │
└─────────────────────────────┘
  ↕ swipe up/down for prev/next month
```

### Dot logic per day
- Check if day is in `qazaDays` set → red dot
- Check if day is in `goalDays` set → primary-colored dot
- Both can appear side by side (max 2 dots)

### Key interactions
- **Header month label tap** → toggles between week and month view
- **Day tap in month view** → navigates to that day in week view
- **Vertical swipe in month view** → next/prev month (with slide animation)
- **Today button** → works in both views (returns to today in week view)

