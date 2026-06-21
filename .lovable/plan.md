## Feasibility

Yes — fully feasible with a small, low-risk change. The existing schema already supports it:
- `prayer_logs.qaza_completed_at` is the single flag that drives "Qaza fulfilled" state. Setting it back to `NULL` restores the prayer to its missed/qaza state everywhere (Calendar timeline, Qaza Namaz page list and count, week-row red/black dot indicator).
- No schema migration, no RLS change. Existing update policy on `prayer_logs` already covers this.

## Where the undo should live

The Qaza Namaz page only lists *unfulfilled* qaza, so undo cannot live there. The natural place is the **Calendar timeline**, where the user navigates to the past day and sees the "Qaza fulfilled" card (the green/check card in the screenshot for Zuhr/Asr/Maghrib/Isha).

Add a subtle "Undo" affordance to that card. Tapping it:
1. Confirms via a small dialog ("Move this prayer back to qaza?") — prevents accidental taps.
2. Clears `qaza_completed_at` on that `prayer_logs` row.
3. Invalidates the same query keys `fulfillQaza` uses, so the card flips back to the red qaza card with the "Ada" button, the Qaza Namaz count increments, and the week date dot turns red again (or stays black if other prayers that day are still qaza-fulfilled).

## Changes

### 1. `src/hooks/useMissedPrayers.ts`
Add a sibling to `fulfillQaza`:

```ts
const undoQazaFulfillment = async (args: {
  gregorianDate: string;
  prayer: PrayerName;
  hijri: HijriDate;
}) => {
  if (!user) return;
  const { error } = await supabase
    .from('prayer_logs')
    .update({ qaza_completed_at: null })
    .eq('user_id', user.id)
    .eq('prayer_date', formatHijriDateKey(args.hijri))
    .eq('prayer', args.prayer);
  if (error) throw error;
  invalidate();
};
```
Export it from the hook.

### 2. `src/components/calendar/CalendarTimeline.tsx`
On the "Past fulfilled qaza" branch (lines ~254-266), add a small ghost icon-button (undo arrow, same `Undo` icon already imported) aligned right. On click → open AlertDialog → on confirm call a new `onUndoQaza` prop.

Thread `onUndoQaza` through the existing prop chain alongside `onFulfillQaza`.

### 3. `src/pages/Calendar.tsx`
Wire `onUndoQaza` to call the new `undoQazaFulfillment` from `useMissedPrayers`, passing the prayer's `gregorian_date`, `prayer`, and split-hijri date (same way `fulfillQaza` is wired today). Show a toast "Moved back to qaza" on success.

## Out of scope
- No change to the Qaza Namaz page (fulfilled items aren't shown there).
- No change to today's prayer card (today uses `completed_at`, not qaza).
- No change to indicators logic — the existing red/black dot rule already responds correctly once `qaza_completed_at` is cleared.
