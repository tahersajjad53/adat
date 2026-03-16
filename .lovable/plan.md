

## Bug: Goal completions vanish from Today page after Maghrib

### Root cause

Goal completions are stored against the **pre-Maghrib Hijri date** (e.g., Ramadan 29). After Maghrib, `CalendarContext.currentDate.hijri` advances to the **next Islamic day** (e.g., Shawwal 1). Two hooks use `currentDate.hijri` to query completions, so they look up the wrong date and find nothing:

1. **`useGoalCompletions`** (line 17) — uses `currentDate.hijri` to build `currentHijriDateStr`
2. **`useTodayProgress`** (line 42) — uses `currentDate.hijri` for both goal-due filtering and completion lookup

The Calendar page is unaffected because `useCalendarDayGoals` receives `preMaghribHijri` explicitly.

### Fix

**`src/hooks/useGoalCompletions.ts`** — Change line 17 from `currentDate?.hijri` to `currentDate?.preMaghribHijri`. This ensures the completion query always uses the pre-Maghrib date, matching what was stored.

**`src/hooks/useTodayProgress.ts`** — Change line 42 from `currentDate?.hijri` to `currentDate?.preMaghribHijri` (the date used to determine which goals are due today should also be pre-Maghrib-anchored, consistent with how completions are stored).

Both are single-line changes. No other files affected.

