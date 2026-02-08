

# Fix: Midnight Crossover in `isAfterMaghrib` Detection

## Problem

The `isAfterMaghrib()` function in `src/lib/hijri.ts` does a simple time comparison:

```
currentMinutes >= maghribMinutes
```

This fails after midnight because 00:24 (24 minutes) is numerically less than 18:21 (1101 minutes), so it returns `false` -- even though midnight is clearly still "after Maghrib."

## Root Cause

The function only considers same-day comparison. It doesn't account for the fact that the period from Maghrib until Fajr the next morning spans midnight.

## Solution

Update `isAfterMaghrib()` to also return `true` when the current time is between midnight and Fajr. Since Maghrib always occurs in the evening (roughly 17:00-20:00 depending on location/season), any time before ~5:00 AM is reliably "after Maghrib from the previous evening."

A simple and robust approach: if the current time is less than a reasonable Fajr cutoff (e.g., before 6:00 AM), it's still the post-Maghrib period. Alternatively, we can pass the Fajr time for precision.

The simplest correct logic:

- If current time >= Maghrib time: after Maghrib (same evening)
- If current time < Maghrib time AND current time < ~6:00 AM: after Maghrib (past midnight, still in the Islamic "night")
- Otherwise: before Maghrib (daytime)

Since Maghrib is always in the late afternoon/evening (never before noon), any time before a safe cutoff like 6 AM can be treated as "still after last night's Maghrib."

## File Changes

### `src/lib/hijri.ts` -- `isAfterMaghrib()` function (lines ~245-268)

Update the comparison logic:

```typescript
export function isAfterMaghrib(
  currentTime: Date,
  maghribTime: string,
  timezone?: string
): boolean {
  const [hours, minutes] = maghribTime.split(':').map(Number);
  const maghribMinutes = hours * 60 + minutes;

  let currentHours: number;
  let currentMinutes: number;

  if (timezone) {
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric', minute: 'numeric',
      hour12: false, timeZone: timezone,
    });
    const parts = formatter.formatToParts(currentTime);
    currentHours = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
    currentMinutes = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
  } else {
    currentHours = currentTime.getHours();
    currentMinutes = currentTime.getMinutes();
  }

  const currentTotalMinutes = currentHours * 60 + currentMinutes;

  // After Maghrib on the same evening
  if (currentTotalMinutes >= maghribMinutes) return true;

  // Past midnight but before Fajr -- still "after Maghrib"
  // Maghrib is always in the evening (>= ~17:00), so any time
  // before 6 AM is part of the previous night's post-Maghrib period
  if (currentHours < 6) return true;

  return false;
}
```

### `src/contexts/CalendarContext.tsx` -- Gregorian date for post-midnight

When it's past midnight and `isAfterMaghrib` returns true, the `gregorianToBohra()` conversion is called with `now` which is already Feb 9. The `preMaghribHijri` will be for Feb 9, and `postMaghribHijri` will advance that by one day. But the Hijri date that should display at 12:24 AM on Feb 9 is the **post-Maghrib date from Feb 8's evening**, which is 22 Shaban.

The current logic computes:
- `preMaghribHijri = gregorianToBohra(Feb 9)` = 22 Shaban
- `postMaghribHijri = advance(22 Shaban)` = 23 Shaban
- Since `isAfterMaghrib = true`, it shows `postMaghribHijri` = 23 Shaban

But the correct display at 12:24 AM Feb 9 should be **22 Shaban** (the Islamic day that began at Maghrib on Feb 8). The fix: when it's past midnight (before ~6 AM) and after Maghrib, the "base" Gregorian date for the Bohra conversion should be the **previous** Gregorian day.

Update `refreshDate()` in CalendarContext:

```typescript
const afterMaghrib = isAfterMaghrib(now, maghrib, location.timezone);

// If past midnight but still "after Maghrib", the Islamic day started
// the previous Gregorian evening. Use yesterday for Bohra conversion.
let baseDate = now;
if (afterMaghrib) {
  const currentHour = /* extract hour in timezone */;
  if (currentHour < 6) {
    // Past midnight -- use previous Gregorian day as base
    baseDate = new Date(now);
    baseDate.setDate(baseDate.getDate() - 1);
  }
}

const preMaghribHijri = gregorianToBohra(baseDate, location.timezone);
const postMaghribHijri = advanceHijriDay(preMaghribHijri);
```

This ensures:
- At 12:24 AM Feb 9: baseDate = Feb 8, preMaghribHijri = 21 Shaban, postMaghribHijri = 22 Shaban, display = 22 Shaban (correct)
- At 10:30 AM Feb 9: baseDate = Feb 9, preMaghribHijri = 22 Shaban, postMaghribHijri = 23 Shaban, display = 22 Shaban (correct, not after Maghrib)
- At 7:00 PM Feb 9 (after Maghrib): baseDate = Feb 9, preMaghribHijri = 22 Shaban, postMaghribHijri = 23 Shaban, display = 23 Shaban (correct)

## Impact

This fix affects all views that rely on CalendarContext: Dashboard (Today), Namaz page, and any component using `useCalendar()`. The Hijri date will now correctly show the advanced date during the midnight-to-Fajr window.

