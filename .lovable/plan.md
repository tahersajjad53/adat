## Make the "Namaz on time" stat live and meaningful

### What's wrong today
- The Profile meter calls `useOnTimePrayerStats`, which loads prayer logs **once on mount** and never refreshes — marking a prayer doesn't update the percentage until the page is reloaded.
- It also aggregates **every prayer log ever recorded** for the user. A user with months of history barely sees newer prayers move the needle, so the number feels stale and inaccurate.

### Proposed window
Use a **rolling 30-day window** (last 30 calendar days, including today). Rationale:
- Large enough to be statistically meaningful (≈150 prayers at full adherence).
- Small enough that recent behavior visibly moves the number — a few on-time prayers today shift it.
- Matches common "recent habit" framing users intuitively expect from a live stat.

The meter label will be updated to read "Last 30 days" under the percentage so the user knows the scope.

### Make it live
- Refetch the stat whenever a prayer log changes for the current user (mark on-time, mark qaza, undo qaza, log from the calendar, etc.).
- Re-query on window focus so returning to the Profile tab always reflects the latest state.

### Files to change
1. **`src/hooks/useOnTimePrayerStats.ts`**
   - Filter `prayer_logs` by `prayer_date >= today − 30 days`.
   - Add a refresh mechanism: listen for a custom `prayer-log:changed` event and re-run the fetch; also re-run on `window` focus.
2. **Prayer mutation sites** — dispatch `prayer-log:changed` after every successful prayer insert/update/delete so the stat refreshes immediately:
   - `src/hooks/usePrayerLog.ts` (today's prayer marking)
   - `src/hooks/useMissedPrayers.ts` (qaza fulfillment)
   - `src/hooks/useCalendarDay.ts` (calendar marking + undo qaza)
3. **`src/components/profile/OnTimeMeter.tsx`** — show a small "Last 30 days" caption beneath the percentage so the window is transparent to the user.

### Out of scope
No schema changes, no changes to how on-time vs. late is determined (still the existing prayer-window comparison), no changes to the meter's visual design beyond the new caption.