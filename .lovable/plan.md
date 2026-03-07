

## Hijri Calendar Toggle in Date Picker

### Overview

Add a Hijri/Gregorian toggle to `DateRecurrenceTimePopover`. When in Hijri mode, the calendar grid shows Hijri months/days, presets show Hijri dates, and recurrence defaults to `calendarType: 'hijri'`. All dates are still stored as Gregorian `YYYY-MM-DD` strings.

### Maghrib-aware date storage

Key consideration: when the user picks a Hijri date after Maghrib, the Islamic day has already advanced. For example, if it's Friday evening after Maghrib and the user selects "Today" in Hijri mode, the Hijri date is already Saturday's Islamic day. The Gregorian date stored must reflect this:

- Use `CalendarContext.currentDate.isAfterMaghrib` to determine if Maghrib has passed
- When in Hijri mode and selecting "Today", use the post-Maghrib Hijri date for display but store the **current Gregorian date** (not tomorrow's) — because the Gregorian day hasn't changed, only the Islamic day has
- When selecting from the Hijri calendar grid, convert the selected Hijri date to Gregorian via `bohraToJDN` → `jdnToGregorian`. This is straightforward and already handles the offset correctly since the conversion is purely mathematical

In practice: the Hijri grid cell for "7 Ramadan 1447" maps to a specific JDN which maps to a specific Gregorian date. No Maghrib adjustment is needed for grid selection — the JDN conversion is deterministic. Maghrib only matters for the "Today" preset label.

### Changes

**1. New component: `src/components/goals/HijriCalendarGrid.tsx`** (~120 lines)
- Custom month grid rendering Hijri month names and correct day counts via `getDaysInBohraMonth`
- Month/year navigation (prev/next) with Muharram↔Dhul Hijjah year rollover
- Each cell click converts Hijri → Gregorian via `bohraToJDN` + `jdnToGregorian` and calls `onDateChange(YYYY-MM-DD)`
- Highlights "today" using `CalendarContext.currentDate.hijri` (post-Maghrib aware)
- Styled to match the existing `react-day-picker` calendar (same grid, cell sizes, selected/today ring states)

**2. Update `src/components/goals/DateRecurrenceTimePopover.tsx`**
- Add `calendarMode` state (`'gregorian' | 'hijri'`), default `'gregorian'`
- Add a compact two-segment toggle above the presets (similar to the existing `CalendarTypeSelector` but inline/smaller)
- In Hijri mode:
  - Presets show Hijri-formatted dates on the right (e.g., "7 Ramadan" instead of "Fri")
  - "This weekend" / "Next week" presets still show (they're Gregorian concepts but still useful)
  - Calendar section renders `<HijriCalendarGrid>` instead of `<Calendar>`
  - Recurrence presets default `calendarType: 'hijri'` for monthly/annual options
- Header subtitle: when in Hijri mode, show Gregorian as the subtitle (reversed from current)

**3. No database or schema changes** — dates remain Gregorian `YYYY-MM-DD`. The Hijri view is a UI-only lens.

**4. No changes to recurrence engine** — `src/lib/recurrence.ts` already supports `calendarType: 'hijri'` in patterns.

### Technical detail: Hijri grid ↔ Gregorian storage

```text
User taps cell "7 Ramadan 1447" in Hijri grid
  → bohraToJDN({ year: 1447, month: 9, day: 7 })  → JDN
  → jdnToGregorian(JDN)                            → { year: 2026, month: 3, day: 7 }
  → onDateChange("2026-03-07")                      → stored as Gregorian
```

For "Today" preset in Hijri mode after Maghrib:
```text
CalendarContext.currentDate.hijri = postMaghribHijri (already advanced)
Display: "Today — 8 Ramadan"
Store: current Gregorian date (2026-03-07) — unchanged
```

This is correct because the recurrence engine already uses `isAfterMaghrib` when checking if a Hijri-based goal is due.

