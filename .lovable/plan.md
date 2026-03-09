

## Bug: Nisful Layl prayer completion doesn't persist

### Root Cause

The `prayer_logs` table has a CHECK constraint on the `prayer` column that only allows 5 values:

```sql
CHECK (prayer IN ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha'))
```

`'nisfulLayl'` is rejected by the database. The error is caught and logged silently in the `catch` block, so the UI optimistically updates but the data never persists. On page navigation, the re-fetch returns no row, and it appears unticked.

### Fix

1. **Add a migration** to alter the CHECK constraint to include `'nisfulLayl'`:

```sql
ALTER TABLE public.prayer_logs
  DROP CONSTRAINT prayer_logs_prayer_check,
  ADD CONSTRAINT prayer_logs_prayer_check
    CHECK (prayer IN ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'nisfulLayl'));
```

That's the only change needed. Both `usePrayerLog` and `useCalendarDay` already handle `nisfulLayl` correctly in their application logic.

