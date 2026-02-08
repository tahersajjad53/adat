
# Bohra Calendar Calibration and Gregorian-First Day View

## Overview

This plan addresses two interconnected changes:
1. Replace the current Hijri calculation engine (Aladhan API + offset hack) with a proper **tabular Bohra/Misri calendar** using the provided month lengths and leap year formula
2. Restructure the "day view" so tracking is **Gregorian-day-first**, with each prayer showing its correct Hijri date (split at Maghrib)

---

## Part 1: Bohra Tabular Calendar Engine

### What changes

The current system uses `Intl.DateTimeFormat` with `islamic-umalqura` plus a hardcoded `BOHRA_CALENDAR_OFFSET = 1`. This is fragile and can drift. We will replace it with a deterministic mathematical conversion.

### Bohra calendar rules (as provided)

| Month | Name | Days |
|-------|------|------|
| 1 | Moharram | 30 |
| 2 | Safar | 29 |
| 3 | Rabiul Awwal | 30 |
| 4 | Rabiul Akhar | 29 |
| 5 | Jamadal Ula | 30 |
| 6 | Jamadal Ukra | 29 |
| 7 | Rajab | 30 |
| 8 | Shaban Karim | 29 |
| 9 | Ramadan | 30 |
| 10 | Shawwal Mukarram | 29 |
| 11 | Zilqad | 30 |
| 12 | Zilhaj | 29 (or 30 in leap years) |

### Leap year formula

```text
remainder = year - (round(year / 30) * 30)
If remainder is in {2, 5, 8, 10, 13, 16, 19, 21, 24, 27, 29} --> leap year
Leap year: Zilhaj = 30 days instead of 29
```

### Algorithm: Gregorian to Bohra Hijri

We will use the **Julian Day Number (JDN)** as an intermediary:

1. **Gregorian date to JDN** -- standard well-known formula
2. **JDN to Bohra Hijri** -- using the tabular Islamic calendar with Bohra leap year cycle

The tabular Islamic calendar epoch is JDN 1948439 (July 16, 622 CE Julian = 1 Moharram 1 AH). A normal Hijri year has 354 days; a leap year has 355. A 30-year cycle has exactly 10631 days.

The Bohra leap year positions `[2,5,8,10,13,16,19,21,24,27,29]` are 11 years out of 30 -- this matches the standard tabular calendar intercalation count but with a specific distribution.

### Files changed

**`src/lib/hijri.ts`** -- Major rewrite:
- Remove `BOHRA_CALENDAR_OFFSET` constant
- Remove `gregorianToHijri()` (Intl-based) -- replace with `gregorianToBohra()`
- Update `advanceHijriDay()` to use `getDaysInBohraMonth()` which checks leap years
- Add `getDaysInBohraMonth(month, year)` function
- Add `isBohraLeapYear(year)` function
- Add `bohraToJDN(hijri)` and `jdnToBohra(jdn)` conversion functions
- Add `gregorianToJDN(date)` helper
- Keep month name arrays but update transliterations to match Bohra usage (e.g., "Moharram" not "Muharram", "Shaban Karim" not just "Shaban")

**`src/contexts/CalendarContext.tsx`** -- Simplify:
- Remove the Aladhan Hijri date dependency (still use Aladhan for prayer **times** only)
- Compute Hijri directly from Gregorian using the new `gregorianToBohra()` function
- Expose both `preMaghribHijri` and `postMaghribHijri` (the Hijri date before and after Maghrib)
- The `DualDate` interface gains a new field: `preMaghribHijri`

**`src/lib/calendarUtils.ts`**:
- Update `getDaysInHijriMonth()` to call `getDaysInBohraMonth()` (needs the year for leap check)

---

## Part 2: Gregorian-First Day View with Split Hijri Tracking

### Core concept

Currently, the app treats each "day" as a single Hijri date. All 5 prayers + Nisful Layl share one Hijri date key.

**New model**: The day view is anchored to the **Gregorian date**. Within that day, prayers are split across two Hijri dates:

| Time window | Prayers | Hijri Date |
|-------------|---------|------------|
| Before Maghrib | Fajr, Zuhr, Asr | Pre-Maghrib Hijri (e.g., 21 Shaban) |
| After Maghrib | Maghrib, Isha | Post-Maghrib Hijri (e.g., 22 Shaban) |
| After midnight | Nisful Layl | Post-Maghrib Hijri (22 Shaban), but Gregorian date advances |

### DualDate interface changes

```typescript
interface DualDate {
  gregorian: Date;
  hijri: HijriDate;              // The "current" Hijri (post-Maghrib if applicable)
  preMaghribHijri: HijriDate;    // The Hijri date for the daytime portion
  postMaghribHijri: HijriDate;   // The Hijri date for evening portion (= preMaghrib + 1)
  isAfterMaghrib: boolean;
}
```

For any given Gregorian date, the two Hijri dates are always:
- `preMaghribHijri` = `gregorianToBohra(gregorianDate)`
- `postMaghribHijri` = `advanceHijriDay(preMaghribHijri)`

### Prayer log changes

**`src/hooks/usePrayerLog.ts`** -- Key structural change:
- Currently uses a single `dateKey` (Hijri) for all prayers
- New approach: each prayer gets its **own Hijri date key** based on its time window
  - Fajr, Zuhr, Asr use `preMaghribHijri` as their `prayer_date`
  - Maghrib, Isha use `postMaghribHijri` as their `prayer_date`
  - Nisful Layl uses `postMaghribHijri` as its `prayer_date`
- The `gregorian_date` column remains the current Gregorian day for all prayers
- Fetching: query by `gregorian_date` (the Gregorian day) instead of a single `prayer_date`
- Writing: each prayer writes its correct Hijri `prayer_date`

**Database impact**: No schema migration needed. The `prayer_logs` table already has both `prayer_date` (Hijri) and `gregorian_date` columns. We just change which Hijri date gets written per prayer.

**Important**: Historical data written with the old single-Hijri-date approach will remain as-is. For days going forward, the new split logic applies. A brief comment in code will document this transition.

### Prayer card UI changes

**`src/components/namaz/PrayerCard.tsx`** and **`src/components/namaz/PrayerList.tsx`**:
- Each prayer card will display a small Hijri date label (e.g., "21 Shaban" or "22 Shaban") to show which Islamic day it belongs to
- Group visually: a subtle separator or label between "pre-Maghrib" and "post-Maghrib" prayers

### Goal completions

**`src/hooks/useGoalCompletions.ts`**:
- Goals are conceptually tied to the Gregorian day (the user's functional anchor)
- The `completion_date` (Hijri) should use the `preMaghribHijri` as the canonical Hijri date for that Gregorian day, since the goal "belongs to" the Gregorian day
- Minor update to use the new `preMaghribHijri` from context

### Dues reminders

**`src/hooks/useDueReminders.ts`** and **`src/lib/calendarUtils.ts`**:
- `getDaysInHijriMonth()` must now accept a `year` parameter to check leap years
- All references updated to pass the year through

### Missed prayers

**`src/hooks/useMissedPrayers.ts`**:
- Currently uses `gregorianToHijri()` to generate Hijri keys for historical dates
- Update to use `gregorianToBohra()` instead
- Historical missed prayer detection logic remains the same (it generates expected prayers per day and checks against logs)

### DateDisplay

**`src/components/calendar/DateDisplay.tsx`**:
- After Maghrib, continue showing the advanced Hijri date (current behavior, unchanged)
- No structural change needed -- it already reads `currentDate.hijri` which will be the "current" Hijri

---

## Part 3: Aladhan API role reduction

The Aladhan API will **only** be used for **prayer times** (Fajr, Zuhr, Asr, Maghrib, Isha, Midnight). It will no longer be used for Hijri date calculation.

**`src/lib/prayerTimes.ts`**:
- `fetchPrayerTimesWithHijri()` still returns Hijri from Aladhan, but `CalendarContext` ignores it
- The function signature can remain for backwards compatibility, but the Hijri data is unused

**`src/contexts/CalendarContext.tsx`**:
- After getting Maghrib time from the API, compute Hijri dates locally using the new Bohra engine
- Remove the `BOHRA_CALENDAR_OFFSET` import and application logic

---

## Implementation Sequence

### Step 1: Bohra calendar engine
- Rewrite `src/lib/hijri.ts` with `isBohraLeapYear()`, `getDaysInBohraMonth()`, `gregorianToBohra()`, and reverse functions
- Update `advanceHijriDay()` to be leap-year-aware
- Update month name transliterations

### Step 2: CalendarContext update
- Compute Hijri dates using the new engine instead of Aladhan + offset
- Expose `preMaghribHijri` and `postMaghribHijri` on `DualDate`

### Step 3: Prayer log refactor
- Update `usePrayerLog.ts` to assign per-prayer Hijri dates
- Fetch by `gregorian_date` instead of single `prayer_date`
- Write correct Hijri `prayer_date` per prayer

### Step 4: UI updates
- Add Hijri date labels to prayer cards
- Update `calendarUtils.ts` to pass year for leap-year-aware month length

### Step 5: Dependent hooks
- Update `useGoalCompletions.ts` to use `preMaghribHijri`
- Update `useMissedPrayers.ts` to use `gregorianToBohra()`
- Update `useDueReminders.ts` / `calendarUtils.ts` for leap-year-aware Hijri month lengths

---

## Technical Details

### Julian Day Number conversion

```typescript
// Gregorian to JDN (standard algorithm)
function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y
    + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

// JDN to Bohra Hijri (tabular calendar)
function jdnToBohra(jdn: number): HijriDate {
  // Epoch: JDN 1948440 = 1 Moharram 1 AH (evening of July 15, 622 CE Julian)
  const epochJDN = 1948440;
  const cycleLength = 10631; // days in a 30-year cycle
  // ... calculate 30-year cycles, then year within cycle, then month/day
}
```

### Bohra leap year check

```typescript
function isBohraLeapYear(year: number): boolean {
  const leapPositions = [2, 5, 8, 10, 13, 16, 19, 21, 24, 27, 29];
  const remainder = year - Math.round(year / 30) * 30;
  // Handle negative remainders
  const normalized = ((remainder % 30) + 30) % 30;
  return leapPositions.includes(normalized);
}
```

### Per-prayer Hijri date mapping

```typescript
function getHijriDateForPrayer(
  prayer: AllPrayerName,
  preMaghribHijri: HijriDate,
  postMaghribHijri: HijriDate
): HijriDate {
  const postMaghribPrayers = ['maghrib', 'isha', 'nisfulLayl'];
  return postMaghribPrayers.includes(prayer) ? postMaghribHijri : preMaghribHijri;
}
```

---

## Risk Assessment

- **Historical data consistency**: Old prayer logs used a single Hijri date for all prayers in a day. New logs will use split dates. This is a one-way forward migration -- old data remains valid but follows old logic. No database migration needed.
- **Anchor point accuracy**: The tabular calendar is deterministic. We will verify the output against known Bohra dates (e.g., current date) before deploying.
- **Leap year edge case**: Zilhaj 30 only exists in leap years. The `advanceHijriDay` function must check this correctly to avoid creating invalid dates.
