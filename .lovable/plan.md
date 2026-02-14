

# Fix: Seed Admin Role for app.ibadat@gmail.com

## Problem

The original migration tried to insert the admin role for `app.ibadat@gmail.com`, but the account did not exist yet at migration time. Now the account exists (user ID: `18a8d9d7-4bc9-439b-860e-ff30ec506e1f`) but the `user_roles` table is empty, so the `/elan` page redirects to `/today`.

## Solution

Run a single database migration to insert the admin role for the existing user:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('18a8d9d7-4bc9-439b-860e-ff30ec506e1f', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

This is a one-line fix. After this, logging in with `app.ibadat@gmail.com` and navigating to `/elan` will work correctly.

## Technical Detail

- File changed: New migration file only (no code changes needed)
- The `useUserRole` hook queries `user_roles` for the current user's admin status -- once the row exists, `/elan` will load the admin panel
