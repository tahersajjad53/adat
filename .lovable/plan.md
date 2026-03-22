

## Fix Three Critical Stability Issues

### 1. Remove hijri fallback in useAdminGoalCompletions and useDynamicGoals

Both hooks use `currentDate?.preMaghribHijri ?? currentDate?.hijri` which falls back to the post-Maghrib date, causing the same disappearing-completions bug fixed earlier for regular goals.

**Files**: `src/hooks/useAdminGoalCompletions.ts` (line 12), `src/hooks/useDynamicGoals.ts` (line 15)
**Change**: Replace `currentDate?.preMaghribHijri ?? currentDate?.hijri` with `currentDate?.preMaghribHijri` (no fallback).

### 2. Move useMissedPrayers out of AppLayout

`useMissedPrayers` runs an expensive historical scan on every page load because it's called in `AppLayout` (line 42). It's only needed for:
- The Namaz page (already calls it directly)
- The AppLayout header "Clear Qaza" menu (only visible on Namaz page)

**File**: `src/components/layout/AppLayout.tsx`
**Change**:
- Remove `useMissedPrayers` import and call from AppLayout
- The `unfulfilledCount` and `clearAllQaza` for the header menu need to come from the Namaz page instead
- Lift the state via custom events (matching the existing pattern used for calendar state): Namaz page dispatches `namaz:qazaCountChanged` with `{ count, clearAllQaza }` and AppLayout listens
- Alternatively (simpler): since the 3-dot menu with "Clear Qaza" only shows on Namaz page, move the menu trigger and AlertDialog into the Namaz page component itself, removing the need for AppLayout to know about qaza at all

I'll use the simpler approach: move the "Clear Qaza" menu action into Namaz page and remove `useMissedPrayers` from AppLayout entirely.

### 3. Add row limits to useMissedPrayers query

The query fetches all `prayer_logs` since signup with no limit, which will hit Supabase's 1000-row default and cause silent data truncation.

**File**: `src/hooks/useMissedPrayers.ts`
**Changes**:
- Paginate the Supabase query: fetch in batches of 1000 using `.range()` until all rows are retrieved
- Add a safety cap (e.g., 90 days lookback) to avoid unbounded scans for long-tenured users, with the option to load older data on demand

### Technical details

| File | Change |
|---|---|
| `src/hooks/useAdminGoalCompletions.ts` | Line 12: remove `?? currentDate?.hijri` fallback |
| `src/hooks/useDynamicGoals.ts` | Line 15: remove `?? currentDate?.hijri` fallback |
| `src/components/layout/AppLayout.tsx` | Remove `useMissedPrayers` import/call; remove qaza-specific header menu and AlertDialog |
| `src/pages/Namaz.tsx` | Add the "Clear Qaza" header action (dispatch event for header menu, or embed menu directly) |
| `src/hooks/useMissedPrayers.ts` | Add paginated fetching with `.range()` loops; cap default lookback to 90 days |

