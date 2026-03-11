

## Display Hijri Days in Al-Kanz Font in Month View

### Approach

Use **Eastern Arabic numerals** (٠١٢٣٤٥٦٧٨٩) for the Hijri day numbers. Since these fall within the Arabic unicode range (U+0600-06FF), the existing `unicode-range` CSS rule will automatically apply Al-Kanz font — no extra font-family overrides needed.

To compensate for Al-Kanz rendering visually smaller at the same CSS font size, bump the Hijri number up (e.g. `text-xs` or `text-[11px]` vs the Gregorian `text-sm`).

### Changes

**`src/components/calendar/MonthView.tsx`**

1. Import `gregorianToBohra` from `@/lib/hijri`
2. Add a small utility to convert Latin digits to Eastern Arabic numerals:
   ```ts
   function toArabicNumerals(n: number): string {
     return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
   }
   ```
3. Use `useMemo` to precompute a `Map<string, HijriDate>` for all dates in the displayed month via `gregorianToBohra`
4. In each day cell, add the Hijri day below the Gregorian number:
   ```text
   ┌───────┐
   │  15   │  ← Gregorian (text-sm, Latin)
   │  ١٧   │  ← Hijri (text-xs, auto Al-Kanz via unicode-range)
   │  ● ●  │  ← dots
   └───────┘
   ```
   When Hijri day is 1, show abbreviated month name too (e.g. "١ رجب")
5. Update the month header to include the Hijri month span (e.g. "March 2026 · رجب ١٤٤٧")
6. The Hijri number uses `text-xs` (or `text-[11px]`) with `text-muted-foreground` — visually balanced against the `text-sm` Gregorian number since Al-Kanz renders smaller

### No other files need changes
- Al-Kanz font is already loaded with Arabic unicode-range
- `gregorianToBohra` already converts any Gregorian date to Hijri
- `HijriDate` already has `monthNameArabic` for Arabic month names

