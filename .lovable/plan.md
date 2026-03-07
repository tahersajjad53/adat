

## Use Arabic Numerals in Hijri Calendar Grid

### What changes

In `src/components/goals/HijriCalendarGrid.tsx`, convert all displayed numbers to Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩) when rendering the Hijri calendar. The Al-Kanz font is already loaded and auto-applies to Arabic Unicode ranges via `unicode-range`.

### Approach

**1. Add a helper function** to convert Latin digits to Eastern Arabic:

```typescript
function toArabicNumerals(n: number): string {
  return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
}
```

**2. Apply it to three places in `HijriCalendarGrid.tsx`:**

- **Month header** (line 112): Show Arabic month name + Arabic year → `{getHijriMonthName(viewMonth, true)} {toArabicNumerals(viewYear)}`
- **Weekday headers** (line 128): Replace Latin `['Su','Mo',...]` with Arabic day abbreviations `['أح','اث','ثل','أر','خم','جم','سب']`
- **Day cells** (line 154): `{toArabicNumerals(day)}` instead of `{day}`

Since these characters fall within the Arabic Unicode range (U+0600-06FF), the Al-Kanz font will automatically render them — no extra font-family class needed.

**3. Set RTL direction** on the grid container (`dir="rtl"`) so the calendar reads right-to-left naturally for Arabic numerals and day headers.

### Files changed
- `src/components/goals/HijriCalendarGrid.tsx` — ~10 lines modified

