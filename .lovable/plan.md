

## Make Auth Page the Index Page

Update the routing so that visiting `/` shows the Auth page directly instead of redirecting to `/auth`.

### Changes

**File: `src/App.tsx`**
- Change the `/` route from `<Navigate to="/auth" replace />` to render `<Auth />` directly
- Keep the `/auth` route as well (so existing links still work), or redirect `/auth` to `/`

This ensures users landing on `ibadat.app` see the login page immediately without a redirect.

### File Modified
- `src/App.tsx` -- update the `/` route to render Auth directly, redirect `/auth` to `/`

