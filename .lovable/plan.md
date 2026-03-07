

## Add Prayer Window Tracking to prayer_logs

### Problem
We want to track whether a prayer was completed on time. Currently `completed_at` records when the checkbox was tapped, but we don't store the valid prayer time window, making retroactive on-time analysis impossible.

### Approach
Add two nullable columns to `prayer_logs` and populate them at completion time using the already-available `allPrayerTimes` data from the Aladhan API.

### Database Migration

Add two columns to `prayer_logs`:

```sql
ALTER TABLE public.prayer_logs
  ADD COLUMN prayer_window_start time without time zone,
  ADD COLUMN prayer_window_end time without time zone;
```

Nullable, no defaults — old rows remain `NULL`, new completions get populated. No RLS changes needed (existing policies cover all columns).

### Code Change — `src/hooks/usePrayerLog.ts`

In the `togglePrayer` callback (the upsert branch), compute `prayer_window_start` and `prayer_window_end` from `allPrayerTimes`:

- **Start**: The prayer's own time (e.g., Fajr = 05:30)
- **End**: The next prayer's time in `PRAYER_ORDER`, or `23:59` for Isha
- **Nisful Layl** (optional): start = midnight time, end = Fajr time

Include these two fields in the upsert payload. The values come from `allPrayerTimes` which is already available in the hook via `usePrayerTimes()`.

Helper logic:
```typescript
function getPrayerWindow(prayer: AllPrayerName, times: Record<AllPrayerName, string>) {
  if (prayer === 'nisfulLayl') return { start: times.nisfulLayl, end: times.fajr };
  const idx = PRAYER_ORDER.indexOf(prayer as PrayerName);
  const start = times[prayer];
  const end = idx < PRAYER_ORDER.length - 1 ? times[PRAYER_ORDER[idx + 1]] : '23:59';
  return { start, end };
}
```

### Code Change — `src/integrations/supabase/types.ts`

This file auto-updates from the migration — no manual edit needed.

### Files Changed
1. **Database migration** — add 2 columns
2. `src/hooks/usePrayerLog.ts` — populate window on upsert

