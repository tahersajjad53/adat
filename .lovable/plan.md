

## Only Track Qaza From Day After Signup

### Problem
Three hooks currently flag qaza for days before the user even signed up:
1. **`useMissedPrayers.ts`** — uses `profile.created_at` as start date but includes the signup day itself (user may not have had the app for all prayers that day)
2. **`useWeekQazaIndicators.ts`** — no signup date filter at all
3. **`useMonthIndicators.ts`** — no signup date filter at all

### Solution
In all three hooks, only consider days **strictly after** the signup date (i.e., from the day after `profile.created_at`). This ensures no qaza is tracked for the signup day or any day before it.

### Changes

**`src/hooks/useMissedPrayers.ts`** (line 66-98):
- Change `startDate` to be the day **after** `profile.created_at` instead of the signup day itself
- `startDate.setDate(startDate.getDate() + 1)` before using it as the scan start

**`src/hooks/useWeekQazaIndicators.ts`**:
- Add a query for `profile.created_at`
- In the `qazaDays` memo, filter `pastDates` to only include dates after the signup date

**`src/hooks/useMonthIndicators.ts`**:
- Add a query for `profile.created_at`  
- In the `qazaDays` memo, filter `pastDates` to only include dates after the signup date

All three changes use the same logic: compute `signupDateKey` (the day the user signed up, formatted as YYYY-MM-DD), then only flag qaza for days where `dateKey > signupDateKey`.

