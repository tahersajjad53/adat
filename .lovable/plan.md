
## What’s happening (step-by-step)

1. **Your UI shows the moon icon + “New Islamic day began”**, which means `isAfterMaghrib(...)` is returning `true`.
2. Even though `isAfterMaghrib === true`, the displayed Hijri date is still **18 Shaban**.
3. That means the second half of the logic is failing: in `getAdjustedHijriDate()` we attempt to advance the “conversion date” by one day, but the conversion still yields the prior Hijri date.
4. There are two common reasons this happens in JS date code:
   - **Timezone missing / not actually being used** (e.g., `location.timezone` is null/undefined for some users; older profiles often don’t have it saved).
   - **Date math performed in the wrong timezone** (using `setDate(getDate()+1)` depends on the browser’s local timezone and can behave unexpectedly vs. the timezone we pass to `Intl.DateTimeFormat`, especially across offsets/DST and when the browser timezone differs from the saved location timezone).

## Goal

Make “after Maghrib” always advance the Hijri day reliably, regardless of:
- user profile timezone being missing,
- browser timezone differing from saved location,
- date arithmetic quirks.

---

## Implementation plan

### 1) Make the +1 day shift timezone-safe in `getAdjustedHijriDate` (core fix)
**File:** `src/lib/hijri.ts`

**Change:**
- Replace `setDate(getDate() + 1)` with a millisecond-based addition:
  - `new Date(currentTime.getTime() + 24 * 60 * 60 * 1000)`

**Why this helps:**
- It avoids “calendar day” mutation in the browser timezone.
- It guarantees we move forward one full civil day for the conversion timestamp, and then `Intl.DateTimeFormat(..., { timeZone })` interprets that moment in the user’s timezone.

**Expected outcome:**
- When `isAfterMaghrib === true`, the Hijri conversion should consistently reflect the *next* civil Hijri date (thus showing **19 Shaban** in your scenario).

---

### 2) Only set `timeZone` option when it is present and valid
**File:** `src/lib/hijri.ts`

**Change:**
- Update `gregorianToHijri` to pass `timeZone` only when `timezone` is truthy (and ideally trimmed).
  - This prevents edge cases where an empty/invalid timezone string causes fallback behavior or throws in some browsers.

---

### 3) Ensure `location.timezone` is never missing (backfill for existing users)
**File:** `src/contexts/CalendarContext.tsx`

**Change:**
- In `loadUserLocation()`, if latitude/longitude exists but `data.timezone` is missing:
  - Derive timezone from the browser: `Intl.DateTimeFormat().resolvedOptions().timeZone`
  - Set it into `locationState` as a fallback so the calendar logic becomes consistent immediately.
  - Optionally (recommended), persist it back to the user profile with a best-effort `supabase.from('profiles').update({ timezone }).eq('id', user.id)` so future sessions are correct.

**Why this helps:**
- If timezone is missing, the Hijri conversion + Maghrib comparison can silently fall back to browser-local assumptions and drift for users traveling or whose device timezone differs from saved location.

---

### 4) Add lightweight debug instrumentation (DEV-only) to confirm the actual inputs
**File:** `src/components/calendar/DateDisplay.tsx` (or `CalendarContext.tsx`)

**Change:**
- In development builds only (`import.meta.env.DEV`), log:
  - `location.timezone`
  - `maghribTime`
  - `currentDate.isAfterMaghrib`
  - `currentDate.gregorian.toISOString()`
- This will let us verify whether the app is truly using `Asia/Colombo` (or the intended timezone) and confirm the computed state.

**Why this helps:**
- If it still shows 18 after these fixes, the next likely cause would be calendar-system mismatch (Umm al-Qura vs Bohra calendar rules), and these logs will prove whether we’re looking at a conversion issue or a rules issue.

---

## Testing checklist (what you should verify in the UI)

1. On `/dashboard`, confirm it now shows:
   - Hijri: **19 Shaban 1447**
   - Still shows: “Maghrib was at 18:20 · New Islamic day began”
2. Confirm the location shows “Colombo” and (in logs) timezone is `Asia/Colombo` (or your expected IANA timezone).
3. Hard refresh the page (to avoid any stale cached state).
4. Optional: change device/browser timezone temporarily and confirm the display remains correct as long as the saved location timezone is used.

---

## If it still shows “18” after this
Then the issue is not timezone/date-math, but **calendar definition**:
- `Intl`’s `islamic-umalqura` is a specific civil calendar and can differ from Dawoodi Bohra observance.
If that happens, the next step would be to switch the Hijri source to:
- Aladhan’s returned Hijri date (already in API response), or
- a Bohra-specific calendar source/ruleset if you have one.
But first we should complete the timezone-safe +1 day and timezone backfill, because your UI already indicates we’re intended to “advance by one day after Maghrib”.

