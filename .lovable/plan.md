

## Reset Progress Meter at Gregorian Midnight

### Problem
The previous fix made the meter continue showing the *previous* Islamic day's progress after midnight. The user wants the meter to reset at Gregorian 12 AM — reflecting a fresh day with no completions.

### Root Cause
After midnight (12 AM – 4 AM), three hooks all roll back to yesterday:
- **`usePrayerLog`** — fetches prayer logs by yesterday's gregorian_date → shows yesterday's completed prayers
- **`useGoalCompletions`** — uses `preMaghribHijri` → shows yesterday's goal completions  
- **`useTodayProgress`** — rolls back gregorian date → finds yesterday's goals

All three need to use the **current** Gregorian day after midnight so the meter starts fresh.

### Changes

**1. `src/hooks/useTodayProgress.ts`** — Revert the date rollback
- Use `currentDate.hijri` directly (not `preMaghribHijri`)
- Use `currentDate.gregorian` directly (no midnight rollback)
- Change `goalsPercentage` default from 100% to 0% when no goals are due (prevents false 100%)

**2. `src/hooks/usePrayerLog.ts`** — Remove midnight rollback
- Remove the `if (hour < 4) effectiveDate.setDate(...)` logic in the `gregorianDate` memo
- After midnight, fetch logs for the *current* Gregorian date (which will be empty — fresh start)

**3. `src/hooks/useGoalCompletions.ts`** — Use current Hijri date after midnight
- Use `currentDate.hijri` instead of `currentDate?.preMaghribHijri ?? currentDate?.hijri`
- This ensures completions are tracked against the current Islamic date, not yesterday's

### Result
At 12:01 AM: prayers = 0/5, goals = 0/N, meter = 0%. Users see a clean slate for the new day.

