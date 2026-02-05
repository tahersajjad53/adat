

# Namaz Tracker with Missed Prayers Tracking

## Overview

Building a comprehensive prayer tracking system that allows users to:
1. Mark their 5 daily prayers as completed
2. Track missed prayers in a separate tab with full date history
3. Make up missed prayers at any time (without affecting past day meters)
4. See a progress meter showing daily completion percentage

---

## Database Schema

### New Table: `prayer_logs`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (auto-generated) |
| user_id | uuid | References auth.users(id) |
| prayer_date | date | The Hijri date as YYYY-MM-DD string |
| prayer | text | One of: fajr, dhuhr, asr, maghrib, isha |
| completed_at | timestamptz | When originally marked complete |
| qaza_completed_at | timestamptz | When made up later (for missed prayers) |
| gregorian_date | date | Gregorian date for display purposes |
| created_at | timestamptz | Record creation time |

**Key Design Decisions:**
- `completed_at` is set when prayer is marked on the same day (counts toward meter)
- `qaza_completed_at` is set when a past missed prayer is fulfilled later (does NOT affect past meter)
- Unique constraint on `(user_id, prayer_date, prayer)` prevents duplicates

### Schema Addition: `profiles.created_at`

Add a `created_at` column to the profiles table to track when the user joined. This will be used to determine the "tracking start date" for missed prayers.

---

## Missed Prayers Logic

### What Counts as "Missed"

A prayer is considered **missed** if:
1. The prayer time has passed for that day
2. `completed_at` is NULL (was not marked complete on time)
3. The date is >= user's `created_at` date (we don't track before signup)

### Making Up Missed Prayers

When a user marks a past prayer as complete:
- Set `qaza_completed_at` to current timestamp
- Leave `completed_at` as NULL (so it doesn't affect the past day's meter)
- Display shows it as "Made up on [date]"

### Date Range for Missed Prayers

- **Start Date**: User's `profiles.created_at` (or `auth.users.created_at`)
- **End Date**: Yesterday (today's prayers are still "in progress", not "missed")

---

## New Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/usePrayerTimes.ts` | Hook to fetch all 5 prayer times for a given date |
| `src/hooks/usePrayerLog.ts` | Hook to manage prayer completion state (today) |
| `src/hooks/useMissedPrayers.ts` | Hook to fetch and manage missed prayers |
| `src/components/namaz/DailyMeter.tsx` | Progress meter showing % completion |
| `src/components/namaz/PrayerCard.tsx` | Individual prayer with checkbox and time |
| `src/components/namaz/CurrentPrayerCard.tsx` | Highlighted card for current/next prayer |
| `src/components/namaz/PrayerList.tsx` | Full list of 5 prayers for today tab |
| `src/components/namaz/MissedPrayersList.tsx` | List of all missed prayers with make-up option |
| `src/components/namaz/MissedPrayerCard.tsx` | Card for a single missed prayer |
| `src/pages/Namaz.tsx` | Dedicated Namaz page with tabs |

---

## Namaz Page Structure (`/namaz`)

The Namaz page will have **two tabs**:

### Tab 1: Today's Prayers
- Shows all 5 prayers for the current Islamic day
- Each prayer displays:
  - Name (Fajr, Dhuhr, Asr, Maghrib, Isha)
  - Time (from Aladhan API)
  - Checkbox to mark complete
  - Status indicator (upcoming, current window, completed, missed)

### Tab 2: Missed Prayers
- Shows all prayers that were not completed on their scheduled day
- Grouped by date (newest first, or oldest first - TBD)
- Each entry shows:
  - Prayer name
  - Hijri date (e.g., "15 Shaban 1446")
  - Gregorian date (e.g., "February 3, 2026")
  - Prayer time on that day
  - Button to mark as "Made Up"
  - If made up: Shows "Fulfilled on [date]" with checkmark

---

## Dashboard Changes

Replace the placeholder "Namaz Tracker" card with:

1. **Daily Meter** - Prominent percentage at top of dashboard
2. **Current Prayer Widget** - Shows the current/next prayer with:
   - Prayer name and time
   - Checkbox to mark complete
   - Visual indicator if already completed
3. **Quick Stats** - Shows "3 of 5 prayers completed"
4. **Missed Counter** - Shows count of missed prayers (if any)
5. **Link to Namaz page** - "View all prayers"

---

## Daily Meter Component

### Calculation (Current Implementation)
```
percentage = (completed_prayers_today / 5) * 100
```

### Future-Proofing
The meter will accept data from multiple sources:
- Prayers (currently)
- Goals (future)
- Dues (future)

### Encouraging Messages

| Percentage | Message |
|------------|---------|
| 0% | "Start your day with Fajr" |
| 20% | "Great start! Keep going" |
| 40% | "You're on track" |
| 60% | "More than halfway there!" |
| 80% | "Almost complete!" |
| 100% | "Masha'Allah! All prayers complete!" |

---

## Prayer Status Logic

### Today's Prayers

Each prayer can have one of these statuses:
- **upcoming**: Prayer time hasn't arrived yet
- **current**: We're in this prayer's time window
- **completed**: Marked as done (has `completed_at`)
- **missed**: Prayer time passed but not marked (only for today, temporary)

### Missed Prayers (Past Days)

- **missed**: Not completed on the day (`completed_at` is NULL)
- **fulfilled**: Made up later (`qaza_completed_at` is set)

---

## Technical Implementation Details

### Determining "Current" Prayer Window

```typescript
function getPrayerStatus(
  prayerName: string,
  prayerTime: string,
  nextPrayerTime: string | null,
  now: Date,
  isCompleted: boolean
): 'upcoming' | 'current' | 'completed' | 'missed' {
  if (isCompleted) return 'completed';
  
  const prayerMinutes = parseTimeToMinutes(prayerTime);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  if (currentMinutes < prayerMinutes) return 'upcoming';
  
  if (nextPrayerTime) {
    const nextMinutes = parseTimeToMinutes(nextPrayerTime);
    if (currentMinutes < nextMinutes) return 'current';
  }
  
  return 'missed'; // Past this prayer's window, not completed
}
```

### Hijri Date Key Format

Using the adjusted Hijri date for storage (accounts for Maghrib transition):
```typescript
const dateKey = `${hijri.year}-${String(hijri.month).padStart(2, '0')}-${String(hijri.day).padStart(2, '0')}`;
// Example: "1446-08-15"
```

### useMissedPrayers Hook

```typescript
interface MissedPrayer {
  id: string;
  prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  prayerDate: string; // Hijri date key
  gregorianDate: Date;
  hijriDate: HijriDate;
  prayerTime: string; // What time it was scheduled
  qazaCompletedAt: Date | null; // When made up, if ever
}

interface UseMissedPrayersReturn {
  missedPrayers: MissedPrayer[];
  fulfillPrayer: (prayerId: string) => Promise<void>;
  missedCount: number;
  isLoading: boolean;
}
```

### Fetching Missed Prayers Query

```sql
-- Get all prayers that should exist from user creation date to yesterday
-- Compare with actual logged prayers to find gaps
WITH date_range AS (
  SELECT generate_series(
    (SELECT DATE(created_at) FROM profiles WHERE id = $user_id),
    CURRENT_DATE - INTERVAL '1 day',
    '1 day'::interval
  )::date AS prayer_date
),
expected_prayers AS (
  SELECT 
    d.prayer_date,
    p.prayer
  FROM date_range d
  CROSS JOIN (VALUES ('fajr'), ('dhuhr'), ('asr'), ('maghrib'), ('isha')) AS p(prayer)
),
actual_prayers AS (
  SELECT prayer_date, prayer, completed_at, qaza_completed_at
  FROM prayer_logs
  WHERE user_id = $user_id
)
SELECT 
  e.prayer_date,
  e.prayer,
  a.completed_at,
  a.qaza_completed_at
FROM expected_prayers e
LEFT JOIN actual_prayers a ON e.prayer_date = a.prayer_date AND e.prayer = a.prayer
WHERE a.completed_at IS NULL -- Not completed on time
ORDER BY e.prayer_date DESC, 
  CASE e.prayer 
    WHEN 'fajr' THEN 1 
    WHEN 'dhuhr' THEN 2 
    WHEN 'asr' THEN 3 
    WHEN 'maghrib' THEN 4 
    WHEN 'isha' THEN 5 
  END;
```

---

## Files Summary

| Action | File |
|--------|------|
| Create (Migration) | `supabase/migrations/xxx_create_prayer_logs.sql` |
| Create (Migration) | `supabase/migrations/xxx_add_profiles_created_at.sql` |
| Create | `src/hooks/usePrayerTimes.ts` |
| Create | `src/hooks/usePrayerLog.ts` |
| Create | `src/hooks/useMissedPrayers.ts` |
| Create | `src/components/namaz/DailyMeter.tsx` |
| Create | `src/components/namaz/PrayerCard.tsx` |
| Create | `src/components/namaz/CurrentPrayerCard.tsx` |
| Create | `src/components/namaz/PrayerList.tsx` |
| Create | `src/components/namaz/MissedPrayersList.tsx` |
| Create | `src/components/namaz/MissedPrayerCard.tsx` |
| Create | `src/pages/Namaz.tsx` |
| Modify | `src/pages/Dashboard.tsx` |
| Modify | `src/App.tsx` |
| Update | `src/integrations/supabase/types.ts` (auto-generated) |

---

## Implementation Order

1. **Database Migrations**
   - Add `created_at` column to `profiles` table
   - Create `prayer_logs` table with RLS policies

2. **Core Hooks**
   - `usePrayerTimes` - Fetch prayer times from Aladhan API
   - `usePrayerLog` - Today's prayer CRUD operations
   - `useMissedPrayers` - Historical missed prayer queries

3. **Components**
   - `DailyMeter` - Progress display with encouragement
   - `PrayerCard` - Reusable prayer item with checkbox
   - `CurrentPrayerCard` - Dashboard widget for current prayer
   - `PrayerList` - Today's prayers tab content
   - `MissedPrayerCard` - Single missed prayer display
   - `MissedPrayersList` - Missed prayers tab content

4. **Pages**
   - `Namaz.tsx` - Full prayer page with tabs

5. **Integration**
   - Update `Dashboard.tsx` with meter and current prayer
   - Add `/namaz` route to `App.tsx`

---

## UI/UX Considerations

### Missed Prayers Tab
- Group by date with clear date headers showing both calendars
- Show prayer time from that day for context
- "Mark as Fulfilled" button with confirmation
- Fulfilled prayers show with strikethrough or checkmark + fulfillment date
- Option to filter: "Show all" vs "Show unfulfilled only"

### Visual Hierarchy
- Today's tab is default/primary
- Missed prayers tab shows badge with count (if > 0)
- Missed prayers sorted newest first (most recent misses at top)

### Accessibility
- All checkboxes have proper labels
- Color is not the only indicator of status
- Icons accompany status text

---

## RLS Policies for prayer_logs

```sql
-- Enable RLS
ALTER TABLE prayer_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own prayer logs
CREATE POLICY "Users can view own prayers"
  ON prayer_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own prayer logs
CREATE POLICY "Users can insert own prayers"
  ON prayer_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own prayer logs
CREATE POLICY "Users can update own prayers"
  ON prayer_logs FOR UPDATE
  USING (auth.uid() = user_id);
```

