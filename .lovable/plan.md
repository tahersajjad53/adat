
# Fix: Onboarding Loop - Profile Row Not Being Created

## Problem Summary

Users cannot access the dashboard after completing onboarding. They are redirected back to the onboarding page with an empty city field in an infinite loop.

---

## Root Cause Analysis

After investigating the network requests and database state, I identified the following chain of issues:

1. **Missing profile rows**: The `handle_new_user` trigger was created AFTER users had already signed up. The profiles table is empty despite having 2 users in `auth.users`.

2. **Onboarding uses UPDATE instead of UPSERT**: The current code attempts to update a profile row that doesn't exist. PostgreSQL's UPDATE on non-existent rows returns success (0 rows affected), so no error is thrown but no data is saved.

3. **Dashboard redirect logic**: When the dashboard fetches the profile and gets an empty result, it sets `needsOnboarding = true`, redirecting back to onboarding.

---

## Evidence from Investigation

**Network Request Evidence:**
- PATCH to `/profiles` returns status 204 (success) but updates 0 rows
- Subsequent GET to `/profiles` returns `[]` (empty array)
- Dashboard sees no profile data and redirects to onboarding

**Database Evidence:**
- `auth.users` table has 2 users (including `8367e76f-fbcf-4e09-aab7-4d662c0101ed`)
- `profiles` table has 0 rows
- Trigger `on_auth_user_created` exists but only fires for NEW users

---

## Solution

### Part 1: Fix Onboarding Page

Change from `.update()` to `.upsert()` so the profile row is created if it doesn't exist.

**File:** `src/pages/Onboarding.tsx`

**Changes:**
- Replace `.update(locationData).eq('id', user.id)` with `.upsert({ id: user.id, ...locationData })`
- This creates the row if it doesn't exist, or updates it if it does
- Apply the same fix to the `handleSkip` function

### Part 2: Database Migration for Existing Users

Create a one-time migration to insert profile rows for any existing users who don't have profiles. This ensures existing users aren't stuck.

**SQL Migration:**
```sql
INSERT INTO public.profiles (id, updated_at)
SELECT id, now()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Onboarding.tsx` | Change `.update()` to `.upsert()` in `handleContinue` and `handleSkip` |
| New migration file | Insert missing profile rows for existing users |

---

## Code Changes

### Onboarding.tsx - handleContinue function

```typescript
// Before (line 78-81):
const { error } = await supabase
  .from('profiles')
  .update(locationData)
  .eq('id', user.id);

// After:
const { error } = await supabase
  .from('profiles')
  .upsert({ 
    id: user.id,
    ...locationData,
    updated_at: new Date().toISOString()
  });
```

### Onboarding.tsx - handleSkip function

```typescript
// Before (line 111-119):
await supabase
  .from('profiles')
  .update({...})
  .eq('id', user.id);

// After:
await supabase
  .from('profiles')
  .upsert({
    id: user.id,
    latitude: mecca.latitude,
    longitude: mecca.longitude,
    city: mecca.name,
    timezone: mecca.timezone,
    updated_at: new Date().toISOString()
  });
```

---

## Why This Fix Works

1. **UPSERT creates or updates**: Unlike UPDATE which only modifies existing rows, UPSERT will INSERT the row if it doesn't exist, or UPDATE if it does.

2. **Migration backfills existing users**: The one-time migration ensures all existing users get profile rows, even if they signed up before the trigger was created.

3. **Future users are covered**: The existing `handle_new_user` trigger will create profiles for new signups automatically.

---

## Testing After Fix

1. Refresh the onboarding page
2. Select a city (e.g., Colombo, Sri Lanka)
3. Click "Continue to Dashboard"
4. Verify you land on the dashboard and stay there
5. Verify the date display shows your location
