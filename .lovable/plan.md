

# Add Pending Database Columns

Three straightforward schema migrations to prepare for notifications and time-based goal scheduling.

## Changes

### 1. Add `preferred_time` to `goals` table
- Column: `preferred_time TEXT`, nullable, no default
- Purpose: Stores user's preferred time for a goal (format: `HH:mm`, 24h clock)
- No frontend changes needed yet -- this just provisions the column

### 2. Add `preferred_time` to `admin_goals` table
- Same column definition for consistency
- Allows admins to set suggested times for community goals

### 3. Add `push_token` to `profiles` table
- Column: `push_token TEXT`, nullable, no default
- Purpose: Stores FCM/APNS device token for server-side push notifications
- No frontend changes needed yet -- the existing `pushNotifications.ts` placeholder will be wired up later

## Technical Details

All three changes will be executed as a single SQL migration:

```sql
ALTER TABLE public.goals
ADD COLUMN preferred_time TEXT;

ALTER TABLE public.admin_goals
ADD COLUMN preferred_time TEXT;

ALTER TABLE public.profiles
ADD COLUMN push_token TEXT;
```

- No RLS policy changes needed -- existing policies already cover these tables
- No code changes required -- columns are nullable so existing inserts/updates continue to work
- The generated Supabase types will auto-update after migration

