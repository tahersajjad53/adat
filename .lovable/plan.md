

# Auto-Authenticate and Navigate to Today View

## Current Behavior
The app already auto-authenticates returning users -- Supabase persists the session in localStorage, and `AuthProvider` restores it on load. The Auth page (`/`) checks for an existing user and redirects to `/today` via `/dashboard`.

However, there is a potential flash of the login page while the session is being restored, because the Auth page renders its own loading spinner inline rather than blocking before the page renders.

## What Needs to Change

The fix is small -- on the root route (`/`), wrap the Auth page so it shows a full-screen loading spinner while the auth state is being resolved, and immediately redirects to `/today` if a session exists, without ever rendering the login form.

### Edit: `src/pages/Auth.tsx`
- The existing `if (loading)` block already shows a spinner, and `if (user)` redirects -- this works correctly.
- Change the redirect from `/dashboard` to `/today` directly (skipping the extra redirect hop).

### Edit: `src/App.tsx`
- Change `<Route path="/dashboard" element={<Navigate to="/today" replace />} />` -- this already exists and handles the redirect, but the Auth page should target `/today` directly for a snappier experience.

### Summary of Changes
1. In `Auth.tsx` line 57: change `<Navigate to="/dashboard" replace />` to `<Navigate to="/today" replace />`
2. In `Signup.tsx`: same change if it has a similar redirect after signup

This is a one-line change per file. The PWA already handles session persistence and auto-refresh via Supabase's `persistSession: true` and `autoRefreshToken: true` settings. No additional PWA configuration is needed -- the service worker caches the app shell, and the auth token in localStorage ensures instant re-authentication on return visits.

## Files
- **Edit**: `src/pages/Auth.tsx` -- redirect to `/today` directly
- **Edit**: `src/pages/Signup.tsx` -- same redirect fix if applicable
