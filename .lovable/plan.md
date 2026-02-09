
# Fix: Immediate Progress Update on Prayer Toggle

## Problem

When you check off a prayer on the Today or Namaz page, the percentage in the header card doesn't update immediately.

**Root cause:** `usePrayerLog()` uses local `useState` to track completed prayers. Both the Dashboard component and the `useTodayProgress` hook call `usePrayerLog()` independently, creating two separate state instances. Toggling a prayer updates one instance but the other (used for the percentage calculation) doesn't know about it until the component remounts or the date changes.

The same issue occurs on the Namaz page -- it calls `usePrayerLog()` once and `useTodayProgress()` once, but `useTodayProgress` has its own internal `usePrayerLog()` call.

## Solution

Remove the duplicate `usePrayerLog()` call inside `useTodayProgress` by making it accept prayer data as parameters instead of fetching its own copy. This way, both the prayer list and the progress meter read from the **same** state instance.

## Changes

### 1. `src/hooks/useTodayProgress.ts`
- Remove the internal `usePrayerLog()` call
- Accept `prayers: PrayerStatus[]` and `prayersLoading: boolean` as parameters
- Compute prayer progress from the passed-in array (same logic, just using the parameter instead of its own hook call)

### 2. `src/pages/Dashboard.tsx`
- Pass `prayers` and `isLoading` from the existing `usePrayerLog()` call into `useTodayProgress(prayers, prayersLoading)`

### 3. `src/pages/Namaz.tsx`
- Same change: pass prayer data from its `usePrayerLog()` call into `useTodayProgress(prayers, prayersLoading)`

## Why This Works

Both the prayer checkboxes and the progress percentage now read from a single `usePrayerLog()` instance. When `togglePrayer` optimistically updates the local state, the percentage recalculates immediately via `useMemo` -- no refetch needed.

## Impact

- Instant percentage updates on both Today and Namaz pages
- No new dependencies or API changes
- Removes one redundant Supabase query per page (the duplicate `usePrayerLog` fetch)
