

# Fix: Namaz Checklist Day Boundary and Missed Prayers

## Overview

Fix the prayer checklist so it resets at 4 AM instead of 6 AM, aligning with the user's Fajr wake-up time (~5-6 AM). This ensures the new day's checklist is ready when the user wakes up. Also fix the missed prayers naming bug and Hijri date split.

## Changes

### 1. Global cutoff: 6 AM to 4 AM

All places that use the "post-midnight = still last evening" logic will use a 4 AM cutoff:

- **`src/lib/hijri.ts`** -- `isAfterMaghrib()`: change `currentHours < 6` to `currentHours < 4`
- **`src/contexts/CalendarContext.tsx`** -- `refreshDate()`: change `currentHour < 6` to `currentHour < 4`
- **`src/hooks/usePrayerLog.ts`** -- new effective date logic will use `hour < 4`

This means:
- 12:00 AM - 3:59 AM: still shows previous evening's checklist (post-Maghrib period)
- 4:00 AM onward: new day begins, fresh checklist with Fajr/Zuhr/Asr ready

### 2. `src/hooks/usePrayerLog.ts` -- Fix Gregorian date for post-midnight

Replace the current `gregorianDate` derivation with a `useMemo` that shifts to the previous Gregorian day when `isAfterMaghrib` is true and the hour is before 4 AM. Also use timezone-aware date formatting instead of `toISOString()` (which uses UTC).

```typescript
const gregorianDate = useMemo(() => {
  if (!currentDate) return null;
  const greg = currentDate.gregorian;
  let effectiveDate = new Date(greg);

  if (currentDate.isAfterMaghrib) {
    // Extract hour in user's timezone
    const hour = /* timezone-aware hour extraction */;
    if (hour < 4) {
      effectiveDate.setDate(effectiveDate.getDate() - 1);
    }
  }

  // Format as YYYY-MM-DD in local timezone (not UTC)
  return formatLocalDate(effectiveDate, timezone);
}, [currentDate]);
```

### 3. `src/hooks/useMissedPrayers.ts` -- Fix naming and Hijri split

**Fix 1**: Change `'dhuhr'` to `'zuhr'` in the prayers array (line ~93).

**Fix 2**: For each Gregorian day, compute both pre-Maghrib and post-Maghrib Hijri dates. Assign the correct Hijri key per prayer:

```typescript
const preMaghribHijri = gregorianToBohra(currentDate);
const postMaghribHijri = advanceHijriDay(preMaghribHijri);

for (const prayer of prayers) {
  const isPostMaghrib = ['maghrib', 'isha'].includes(prayer);
  const hijri = isPostMaghrib ? postMaghribHijri : preMaghribHijri;
  const hijriKey = formatHijriDateKey(hijri);
  // ... lookup and track missed
}
```

## Files Changed

| File | Change |
|------|--------|
| `src/lib/hijri.ts` | `isAfterMaghrib()`: cutoff 6 to 4 AM |
| `src/contexts/CalendarContext.tsx` | `refreshDate()`: cutoff 6 to 4 AM |
| `src/hooks/usePrayerLog.ts` | Use previous Gregorian day when post-midnight + before 4 AM; timezone-aware date |
| `src/hooks/useMissedPrayers.ts` | `'dhuhr'` to `'zuhr'`; Hijri split per prayer |

## Expected Behavior

| Time | Checklist Shows |
|------|----------------|
| Feb 9, 12:30 AM | Feb 8 prayers (last evening's view) |
| Feb 9, 3:59 AM | Feb 8 prayers (still last evening) |
| Feb 9, 4:00 AM | Feb 9 prayers -- fresh checklist ready for Fajr |
| Feb 9, 7:00 PM (after Maghrib) | Feb 9 prayers with Maghrib now checkable |

