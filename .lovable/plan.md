

# Fix: Hijri Epoch Off-By-One Error

## Problem

The Bohra calendar engine's epoch constant (`HIJRI_EPOCH_JDN = 1948440`) is 1 day too high, causing all Hijri dates to be 1 day behind the correct Dawoodi Bohra calendar.

**Evidence from console logs at 12:37 AM on Feb 9:**
- `gregorianToBohra(Feb 8)` returns 20 Shaban
- But Feb 8 should be 21 Shaban (as confirmed by you)
- After the midnight adjustment and advance, the display shows 21 Shaban -- which looks correct only by coincidence at night, but would show 20 Shaban during daytime on Feb 8 (wrong)

## Fix

**One-line change in `src/lib/hijri.ts` (line 51):**

Change the epoch from `1948440` to `1948439`.

This shifts every converted Hijri date forward by exactly 1 day, correcting the alignment across all dates.

## Expected Results After Fix

| Time | baseDate | gregorianToBohra | advance | isAfterMaghrib | Display |
|------|----------|-----------------|---------|----------------|---------|
| Feb 8, 10 AM | Feb 8 | 21 Shaban | 22 Shaban | false | **21 Shaban** |
| Feb 8, 7 PM (after Maghrib) | Feb 8 | 21 Shaban | 22 Shaban | true | **22 Shaban** |
| Feb 9, 12:37 AM | Feb 8 | 21 Shaban | 22 Shaban | true | **22 Shaban** |
| Feb 9, 10 AM | Feb 9 | 22 Shaban | 23 Shaban | false | **22 Shaban** |

## Impact

This is a global fix -- every Hijri date displayed anywhere in the app (Dashboard, Namaz, Dues, Goals) will shift by +1 day to the correct value.

