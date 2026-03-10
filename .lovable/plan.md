

## Fix: Ada Meter Showing 100% After Midnight

### Bug
After midnight (12 AM – 4 AM), the overall progress meter shows 100% even when nothing is done. This happens because of a date mismatch:

- **Prayer log** fetches yesterday's completions (correct — Islamic day spans Maghrib to Maghrib)
- **Goal recurrence** checks against the new gregorian date (March 11) + postMaghribHijri — finding no goals due
- **Goal completions** checks against preMaghribHijri — a different Hijri date
- **Result:** 0 goals total + 5 completed prayers from yesterday = 5/5 = 100%

### Fix — `src/hooks/useTodayProgress.ts`

Use the same effective dates that `useGoalCompletions` and `usePrayerLog` use:

1. Use `preMaghribHijri` instead of `currentDate.hijri` for goal due-date checks (aligns with how completions are stored)
2. Compute an effective gregorian date that rolls back 1 day during the midnight–4AM "after Maghrib" window (aligns with how prayer logs work)

```typescript
// Before (broken):
const hijriDate = currentDate?.hijri;
const gregorianDate = currentDate?.gregorian;

// After (fixed):
const hijriDate = currentDate?.preMaghribHijri ?? currentDate?.hijri;
const gregorianDate = useMemo(() => {
  if (!currentDate) return null;
  const greg = currentDate.gregorian;
  if (currentDate.isAfterMaghrib && greg.getHours() < 4) {
    const adjusted = new Date(greg);
    adjusted.setDate(adjusted.getDate() - 1);
    return adjusted;
  }
  return greg;
}, [currentDate]);
```

This ensures goals due today and goal completions are checked against the same dates, and the meter reflects the correct Islamic day's progress.

