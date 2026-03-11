

## Add Hijri Numerals & Arabic Month to Week View

### Changes

**`src/components/calendar/WeekRow.tsx`**:
1. Import `gregorianToBohra` from `@/lib/hijri`
2. Add `toArabicNumerals` helper (same as MonthView)
3. Compute Hijri dates for all 7 week dates via `useMemo`
4. Inside each day button, add the Hijri numeral below the Gregorian date at `text-lg` size using `toArabicNumerals(hijri.day)`, styled as `text-muted-foreground`

**`src/pages/Calendar.tsx`** (lines 178-184):
1. Compute the Hijri month span for the visible week (similar to MonthView's `hijriHeader`) — check first and last day's Hijri months, show Arabic month name(s)
2. Replace the right-side `selectedHijriLabel` (text-sm) with the Arabic Hijri month header at `text-2xl` size, matching the Month View's style
3. Keep the left side ("Today" / date label) as-is

The week header area will look like:
```text
Today                          محرم ١٤٤٧
```
or when spanning two months:
```text
Today                   محرم – صفر ١٤٤٧
```

