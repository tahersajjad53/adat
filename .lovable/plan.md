
# Fix Ordinal Suffix in Recurrence Labels

## Problem
The recurrence label displays "1th of each month (Hijri)" instead of "1st of each month (Hijri)". The code on line 245 of `src/lib/recurrence.ts` hardcodes the "th" suffix for all day numbers.

## Solution
Add an ordinal suffix helper function that returns the correct suffix (st, nd, rd, th) for any number, then use it in the label.

### File: `src/lib/recurrence.ts`

Add a small helper function:
```typescript
function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
```

Then replace line 245:
- **Before:** `` `${pattern.monthlyDay}th of each month (${calType})` ``
- **After:** `` `${ordinal(pattern.monthlyDay)} of each month (${calType})` ``

This fixes all cases: 1st, 2nd, 3rd, 4th, 11th, 12th, 13th, 21st, 22nd, 23rd, etc.
