
# Fix Hijri Date Not Advancing After Maghrib

## Problem

The display shows "18 Shaban 1447" with "New Islamic day began" message, but it should show **19 Shaban 1447** since it's after Maghrib.

## Root Cause

The `gregorianToHijri()` function in `src/lib/hijri.ts` uses `Intl.DateTimeFormat` without specifying a timezone. This causes the date conversion to use UTC interpretation, which can lead to off-by-one errors when the local time crosses midnight in a different timezone than the browser.

When we do `dateForConversion.setDate(getDate() + 1)`, the date is modified in local time, but the Intl formatter may interpret it differently.

## Solution

Pass the user's timezone to `gregorianToHijri()` so the Intl formatter converts the date in the correct timezone context.

---

## Files to Modify

### 1. `src/lib/hijri.ts`

**Changes:**

1. Update `gregorianToHijri()` to accept an optional timezone parameter
2. Pass the timezone to `Intl.DateTimeFormat` for accurate conversion
3. Update `getAdjustedHijriDate()` to pass timezone through to conversion

```typescript
// Updated function signature
export function gregorianToHijri(date: Date, timezone?: string): HijriDate {
  // Use Intl.DateTimeFormat with islamic-umalqura calendar
  // Include timezone for accurate date interpretation
  const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: timezone, // Add timezone parameter
  });

  const parts = formatter.formatToParts(date);
  // ... rest unchanged
}
```

Update `getAdjustedHijriDate()`:

```typescript
export function getAdjustedHijriDate(
  currentTime: Date, 
  maghribTime: string | null,
  timezone?: string
): DualDate {
  const afterMaghrib = maghribTime 
    ? isAfterMaghrib(currentTime, maghribTime, timezone) 
    : false;
  
  let dateForConversion = currentTime;
  if (afterMaghrib) {
    dateForConversion = new Date(currentTime);
    dateForConversion.setDate(dateForConversion.getDate() + 1);
  }
  
  // Pass timezone to ensure correct conversion
  const hijri = gregorianToHijri(dateForConversion, timezone);
  
  return {
    gregorian: currentTime,
    hijri,
    isAfterMaghrib: afterMaghrib,
  };
}
```

---

## Why This Fixes the Issue

By passing `timezone: 'Asia/Colombo'` to the Intl formatter:

- **Before fix:** `Intl.DateTimeFormat` interprets Feb 6, 2026 in an undefined timezone context
- **After fix:** `Intl.DateTimeFormat` explicitly interprets Feb 6, 2026 as a date in Colombo timezone

This ensures the Gregorian→Hijri conversion happens in the user's local context, giving the correct result of **19 Shaban 1447**.

---

## Testing

After implementation:
1. Verify the dashboard shows "19 Shaban 1447" (after Maghrib)
2. Verify the Arabic date also shows "19 شعبان 1447"
3. Test by refreshing before/after Maghrib to see the date transition
