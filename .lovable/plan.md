## Goal
Reflect qaza ada (fulfilled) state in the week calendar's date-tab dot:
- Red dot = day has at least one unfulfilled (missed) required prayer
- Black dot = all required prayers are accounted for, but at least one was fulfilled as qaza
- No dot = all required prayers were prayed on time (or day is today/future/pre-signup)

## Changes

### 1. `src/hooks/useWeekQazaIndicators.ts`
- Also select `qaza_completed_at` from `prayer_logs`.
- Return `Map<string, 'red' | 'black'>` instead of `Set<string>`.
- Per past day after signup:
  - `onTime` = prayers with `completed_at`
  - `qaza` = prayers with `qaza_completed_at` (and no `completed_at`)
  - If any required prayer missing from both → `'red'`
  - Else if any required prayer is in `qaza` → `'black'`
  - Else → no entry (no dot)

### 2. `src/components/calendar/WeekRow.tsx`
- Change `qazaDays` prop type to `Map<string, 'red' | 'black'>`.
- Render dot using `bg-destructive` for `'red'` and `bg-foreground` for `'black'`.
- When the day is selected, keep current contrast (`bg-primary-foreground/80`).

### 3. `src/pages/Calendar.tsx`
- Update local `qazaDays` (the monitoring-disabled fallback) from `new Set<string>()` to `new Map()` and pass through.

No business logic, DB, or schema changes. Existing `fulfillQaza` already writes `qaza_completed_at`, and the `week-prayer-logs` query is invalidated on fulfill, so the dot updates automatically after marking ada from either the Calendar timeline or the Qaza Namaz page.