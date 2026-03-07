

## Fix Nisful Layl Hijri Date Assignment

### The Problem
Nisful Layl occurs around midnight (e.g., 00:22), at the **start** of a Gregorian day. It belongs to the **previous evening's** Islamic night. On March 6 (18 Ramadan), the pre-Maghrib Hijri = 18 Ramadan, post-Maghrib = 19 Ramadan. Currently Nisful Layl is in `POST_MAGHRIB_PRAYERS`, so it incorrectly gets 19 Ramadan. It should get 18 Ramadan (same as Fajr), since both occur before the next Maghrib.

### The Fix
Remove `'nisfulLayl'` from `POST_MAGHRIB_PRAYERS` in two files:

**`src/hooks/useCalendarDay.ts` (line 31)**
```typescript
// Before
const POST_MAGHRIB_PRAYERS: AllPrayerName[] = ['maghrib', 'isha', 'nisfulLayl'];
// After
const POST_MAGHRIB_PRAYERS: AllPrayerName[] = ['maghrib', 'isha'];
```

**`src/hooks/usePrayerLog.ts` (line 35)**
```typescript
// Before
const POST_MAGHRIB_PRAYERS: AllPrayerName[] = ['maghrib', 'isha', 'nisfulLayl'];
// After
const POST_MAGHRIB_PRAYERS: AllPrayerName[] = ['maghrib', 'isha'];
```

This makes Nisful Layl use `preMaghribHijri` (same as Fajr, Zuhr, Asr), which correctly assigns it to the same Islamic night it belongs to.

