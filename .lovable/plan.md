

## /calendar Page — Phased Implementation Plan

### Overview
A new `/calendar` page that presents a **week-row navigator** at the top and a **daily timeline view** below, combining namaz slots (with gradient cards and qaza handling) and goals (time-slotted or "all day"). Users navigate between days to see past/future prayers and goals, tick off namaz, and tap goals to edit.

### Feasibility Assessment
- **Namaz data for arbitrary days**: `usePrayerLog` and `usePrayerTimes` are currently hardcoded to "today." We need variants that accept a target date.
- **Goals for arbitrary days**: `isGoalDueOnDate` already exists in `src/lib/recurrence.ts`, so populating goals for any date is straightforward.
- **Qaza detection for past days**: `useMissedPrayers` already scans all past days. We can reuse its logic per-day.
- **Prayer times for past/future days**: The Aladhan API accepts any date, so `fetchPrayerTimes(targetDate, location)` works.
- **Goal `preferred_time`**: Already stored as `HH:mm`, perfect for time-slot placement.

This is a large feature. Recommended phased approach:

---

### Phase 1: Page shell, week navigator, and prayer timeline

**New files:**
- `src/pages/Calendar.tsx` — Page component with week row and day content
- `src/hooks/useCalendarDay.ts` — Hook that fetches prayer times + prayer logs for an arbitrary Gregorian date (not just today)
- `src/components/calendar/WeekRow.tsx` — Horizontal week strip (Mon–Sun) with selectable days, highlights today, shows qaza dot indicator on days with missed prayers

**Route:** Add `/calendar` to `App.tsx` inside `AppLayout` + `ProtectedRoute`

**Week Row:**
- Shows 7 days centered on today (scrollable left/right to shift the week)
- Each day shows weekday abbreviation + day number
- Active day highlighted with bold + accent
- Red dot on days that have unfulfilled qaza prayers

**Prayer Timeline:**
- For the selected day, fetch prayer times via `fetchPrayerTimes(selectedDate, location)`
- Fetch prayer logs for that date from Supabase (`prayer_logs` where `gregorian_date = selectedDate`)
- Render 5 prayer cards (+ Nisful Layl) in time order using existing `PrayerCard` component with gradient accent
- For today: prayers are interactive (can tick off, status = upcoming/current/completed/missed)
- For past days: missed prayers show qaza styling (destructive border), with an "Ada" button to fulfill qaza (reuses `fulfillPrayer` logic from `useMissedPrayers`)
- For future days: all prayers show as "upcoming" (read-only, no checkbox)

**`useCalendarDay` hook shape:**
```typescript
function useCalendarDay(date: Date, location: Location) {
  // Returns: prayerTimes, prayerStatuses, togglePrayer, fulfillQaza, isLoading
}
```

---

### Phase 2: Goals in the timeline

**Changes:**
- `src/hooks/useCalendarDayGoals.ts` — Hook that computes which goals are due on a given date using `isGoalDueOnDate`, fetches completions for that date
- Update `Calendar.tsx` to render goals alongside prayers

**Layout logic:**
- Goals with `preferred_time` set → placed at their time slot in the timeline (between prayer cards based on time)
- Goals without `preferred_time` → grouped at the top of the day as "All Day" items (like the reference image's section headers)
- Timeline order: All-day goals section → then chronological mix of prayers and timed goals

**Goal cards:**
- Reuse existing goal card styling (checkbox, title, tag badge)
- Tapping a goal opens `GoalFormSheet` in edit mode (existing pattern)
- Future days show recurring goals as read-only previews

---

### Phase 3: Polish and navigation integration

**Changes:**
- Add `/calendar` to the bottom nav / sidebar navigation
- Week row: swipe gesture support for mobile (shift week left/right)
- Smooth transitions when switching days
- Loading skeletons for prayer times and goals
- Empty state for days with no goals

---

### Technical Details

**Data fetching strategy:**
- Prayer times: cached per date+location (existing cache layer handles this)
- Prayer logs: direct Supabase query filtered by `gregorian_date`
- Goals: client-side filter using `isGoalDueOnDate` against the full goals list (already fetched by `useGoals`)
- Goal completions: query by `gregorian_date` for the selected day

**Qaza indicator on week row:**
- For visible week days (only past days), batch-query `prayer_logs` for the 7-day range, count days where any of the 5 required prayers lack `completed_at`

**Key reusable components:**
- `PrayerCard` — existing, used as-is for timeline prayer slots
- `MissedPrayerCard` — existing qaza card styling
- `TimeOfDayCard` gradients — reuse gradient classes for prayer slot accent colors
- `GoalFormSheet` — existing edit form, opened on goal tap

**Estimated scope:** ~3 files in Phase 1, ~2 files in Phase 2, ~2 file edits in Phase 3. Phase 1 is the critical path; Phases 2 and 3 can follow incrementally.

