
# Refactor: Implement Accurate Bohra Calendar System

## Problem Summary

The current implementation shows **18 Shaban** when the user expects **19 Shaban** after Maghrib. This is a systematic 1-day offset caused by using incompatible calendar sources.

### Data Flow Analysis:

```
Current Time: Feb 5, 2026, 20:15 Colombo (after Maghrib at 18:20)

Aladhan API returns:  17 Shaban 1447 (using HJCoSA - midnight-based)
After +1 sunset rule: 18 Shaban 1447
User expects:         19 Shaban 1447
```

## Root Cause

The **Aladhan API uses HJCoSA (Hijri Council of Saudi Arabia)** calendar which:
- Transitions at midnight, not Maghrib
- Uses calculated astronomy, not moon sighting
- Does NOT align with Dawoodi Bohra calendar

The Bohra community traditionally uses the **Misri/Fatimid calendar** which:
- Has different month start dates than HJCoSA/Umm al-Qura
- Begins each day at Maghrib (sunset)
- Often runs 1-2 days different from Saudi calendar

## Recommended Solution

### Option A: Apply Bohra Calendar Offset (Recommended - Fastest)

Add a **configurable base offset** (+1 day) to align Aladhan's output with Bohra calendar, then apply the sunset rule:

```
Final Date = Aladhan Hijri + Base Offset + (1 if after Maghrib)
```

For current date: `17 + 1 + 1 = 19 Shaban`

**Pros:**
- Quick to implement
- Works immediately
- Offset can be adjusted if needed

**Cons:**
- Hardcoded offset may drift over time
- Not technically accurate to the calculation method

### Option B: Use Misri Calendar Calculation

Replace Aladhan with a proper **Misri/Fatimid calendar** library that natively:
- Uses the 30-year tabular cycle
- Has sunset-based day transitions built in

**Pros:**
- Technically correct implementation
- No arbitrary offsets needed

**Cons:**
- Requires finding/building a Misri calendar library
- More complex implementation

### Option C: Hybrid Approach (Recommended for Long-term)

1. Use Aladhan for **prayer times only** (accurate for location)
2. Implement **Misri calendar calculation** for Hijri dates
3. Apply sunset rule on top of Misri dates

## Implementation Plan

### Phase 1: Quick Fix with Configurable Offset

#### File: `src/lib/hijri.ts`

Add a constant for Bohra calendar offset:

```typescript
/**
 * Bohra Calendar Offset
 * 
 * The Dawoodi Bohra community uses the Misri/Fatimid calendar
 * which often differs from the Saudi (HJCoSA/Umm al-Qura) calendar
 * by 1-2 days. This offset aligns the API output with Bohra dates.
 * 
 * Set to 1 to add one day to the base Aladhan date before
 * applying the sunset rule.
 */
export const BOHRA_CALENDAR_OFFSET = 1;
```

#### File: `src/contexts/CalendarContext.tsx`

Update `refreshDate` to apply the base offset:

```typescript
import { ..., advanceHijriDay, BOHRA_CALENDAR_OFFSET } from '@/lib/hijri';

// In refreshDate():
let hijri: HijriDate = {
  day: aladhanHijri.day,
  month: aladhanHijri.month,
  year: aladhanHijri.year,
  monthName: aladhanHijri.monthNameEn,
  monthNameArabic: aladhanHijri.monthNameAr,
};

// Apply Bohra calendar base offset (aligns with Misri calendar)
for (let i = 0; i < BOHRA_CALENDAR_OFFSET; i++) {
  hijri = advanceHijriDay(hijri);
}

// Bohra sunset rule: If after Maghrib, advance one more day
if (afterMaghrib) {
  hijri = advanceHijriDay(hijri);
}
```

### Phase 2: Future Enhancement - Misri Calendar

For a more robust solution, implement proper Misri calendar calculation:

```typescript
/**
 * Misri/Fatimid Calendar Calculation
 * 
 * Uses the 30-year tabular cycle with specific leap year pattern:
 * Years 2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29 in each cycle are leap years
 * 
 * Day transition occurs at Maghrib (sunset)
 */
function gregorianToMisri(date: Date, maghribTime: string, timezone: string): HijriDate {
  // Implementation using astronomical calculations
  // or porting from existing Misri calendar libraries
}
```

## Technical Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                     CalendarProvider                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Fetch Aladhan API                                       │
│     └── Get prayer times + base Hijri date                  │
│                                                              │
│  2. Apply Bohra Calendar Offset (+1)                        │
│     └── Aligns with Misri/Fatimid calendar                  │
│                                                              │
│  3. Check isAfterMaghrib()                                  │
│     └── Compare current time vs Maghrib time                │
│                                                              │
│  4. Apply Sunset Rule (+1 if after Maghrib)                 │
│     └── Islamic day begins at sunset                        │
│                                                              │
│  5. Final Result: Correct Bohra Hijri Date                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Files to Modify

1. **`src/lib/hijri.ts`**
   - Add `BOHRA_CALENDAR_OFFSET` constant
   - Export for use in CalendarContext

2. **`src/contexts/CalendarContext.tsx`**
   - Import `BOHRA_CALENDAR_OFFSET`
   - Apply base offset before sunset rule
   - Update fallback logic to also use offset

## Expected Result

After implementation:
- Aladhan returns: 17 Shaban
- After +1 Bohra offset: 18 Shaban
- After +1 sunset rule (it's after Maghrib): **19 Shaban** ✓

## Testing Checklist

- [ ] Verify 19 Shaban displays after Maghrib on Feb 5, 2026
- [ ] Verify 18 Shaban displays before Maghrib on Feb 5, 2026
- [ ] Verify month rollover works correctly (day 30 → day 1 of next month)
- [ ] Verify year rollover works correctly (Dhul Hijjah → Muharram)
- [ ] Clear localStorage cache before testing to avoid stale data
