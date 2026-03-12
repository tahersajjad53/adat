

## Feasibility: "Monitor Qaza Namaz" Toggle

### Verdict: Fully feasible, straightforward implementation

### What it does
A toggle in Profile that disables all qaza/missed prayer tracking. When off:
- **Namaz page**: Hide the "Qaza Namaz" tab entirely (only show "Today's Namaz")
- **Calendar page**: Hide qaza dot indicators on week/month views, hide "Ada" buttons on past missed prayers, hide "Clear Qaza Namaz" header menu
- **AppLayout header**: Hide "Clear Qaza Namaz" menu item
- Today's prayer checking remains fully functional

### Approach

**Database**: Add `qaza_monitoring_enabled boolean NOT NULL DEFAULT true` column to `profiles` table via migration. No new table needed — this is a user preference, not a role.

**Profile page**: Add a new "Monitor Qaza Namaz" section (or inline toggle in the existing menu) with a Switch component. Reads/writes the new column.

**Propagation**: Two options:

1. **Simple prop-drilling** — each consumer checks the flag independently via a shared hook
2. **Shared hook** (recommended) — extend the existing profile fetch or create a small `useQazaMonitoring()` hook that returns the boolean

### Files to change (6 files)

| File | Change |
|---|---|
| `profiles` table | Add `qaza_monitoring_enabled` column |
| `src/pages/Profile.tsx` | Add toggle UI in menu + fetch/save the flag |
| `src/pages/Namaz.tsx` | Conditionally hide Qaza tab when disabled |
| `src/pages/Calendar.tsx` | Skip `useWeekQazaIndicators`, hide qaza UI in timeline |
| `src/components/layout/AppLayout.tsx` | Hide "Clear Qaza Namaz" menu item |
| `src/components/calendar/CalendarTimeline.tsx` | Hide Ada buttons when qaza monitoring off |

### Complexity
Low-medium. The flag is a simple boolean that gates existing UI. No data deletion needed — toggling off just hides qaza features; toggling back on restores everything since prayer_logs data remains intact.

