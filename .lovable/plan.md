## Add Calendar Header Menu + Qaza Namaz Page

### Header changes (`src/components/layout/AppLayout.tsx`)

Today, the Calendar mobile header right slot shows EITHER the "Today" CTA OR nothing. Replace with a row that can show both: `[Today CTA?] [3-dot menu]`.

- On `/calendar`, always render the 3-dot `MoreHoriz` `DropdownMenu` button on the right
- When `calendarInMonthView || !calendarShowingToday`, render the "Today" text button immediately to the LEFT of the 3-dot menu (same row)
- Dropdown contains one item: **View Qaza Namaz** → `navigate('/calendar/qaza')`
- Wrap the right slot in a `flex items-center gap-1` container; widen its container width allowance so two controls fit (replace fixed `w-10` right slot)

### New page (`src/pages/QazaNamaz.tsx`) + route `/calendar/qaza`

Recreate the previously-existing Qaza list view:

- Header (page-level, below app header): Title "Qaza Namaz" + badge with unfulfilled count + "Clear All" action in a small overflow button (confirmation dialog before bulk fulfill)
- Empty state when count is 0: "No missed prayers — alhamdulillah"
- List grouped by Gregorian date (most recent first), each group shows:
  - Date header: weekday + Gregorian date · Hijri date (using same Maghrib split logic as `useCalendarDay`)
  - Each unfulfilled prayer row: prayer display name + "Ada" button on the right
- Tapping "Ada" upserts a `prayer_logs` row with `qaza_completed_at = now()` (same pattern as `fulfillQaza` in `useCalendarDay.ts`), then removes the row from the list
- Respects `useQazaMonitoring`: if disabled, page shows a notice "Qaza monitoring is disabled. Enable it in Profile."

### Data hook (`src/hooks/useMissedPrayers.ts`) — recreated

Mirror the spec from `docs/rn-spec/05-namaz.md`:

1. Read `profiles.created_at` for the user
2. Generate every Gregorian day from `created_at + 1 day` through **yesterday**
3. Fetch all `prayer_logs` in that range
4. For each (day × required prayer in `['fajr','dhuhr','asr','maghrib','isha']`): missed if no row OR row has neither `completed_at` nor `qaza_completed_at`
5. Group by date desc, prayers in canonical order
6. Expose: `groups`, `unfulfilledCount`, `fulfillQaza(date, prayer)`, `clearAll()`
7. Use react-query keys (`['missed-prayers', userId]`) so invalidation refreshes Calendar's `useWeekQazaIndicators` / `useMonthIndicators` automatically — call `queryClient.invalidateQueries({ queryKey: ['week-prayer-logs'] })` and `['month-prayer-logs']` after mutations so calendar dot indicators update

### Cross-page sync

`useWeekQazaIndicators` and `useMonthIndicators` already key off `prayer_logs`. Invalidating those query keys on Ada/clear-all in the new page makes the calendar dots disappear immediately when the user returns.

### Routing (`src/App.tsx`)

Add a protected route `/calendar/qaza` rendering `<QazaNamaz />` inside `<AppLayout>`.

### Files touched

- `src/components/layout/AppLayout.tsx` — header right slot for `/calendar`
- `src/pages/QazaNamaz.tsx` — new page
- `src/hooks/useMissedPrayers.ts` — new hook
- `src/App.tsx` — new route
