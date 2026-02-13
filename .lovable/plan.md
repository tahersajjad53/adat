

## Rebrand: Adat to Ibadat

### Changes

1. **Replace logo file** -- Copy `user-uploads://logo.svg` to `src/assets/ibadat-logo.svg` and update all imports across the app (AuthLayout, AppLayout, AppSidebar) to use the new logo file instead of `adat-logo.svg`.

2. **Replace favicon** -- Copy `user-uploads://fav.svg` to `public/favicon.svg` and update `index.html` to reference it.

3. **Update index.html metadata** -- Change the document title and og:title from "Lovable App" to "Ibadat", and update the description to match the app's purpose.

4. **Update text references** -- Replace any remaining "Adat" alt-text references in components with "Ibadat".

### Files Modified
- `index.html` -- favicon link, title, meta tags
- `src/components/auth/AuthLayout.tsx` -- logo import
- `src/components/layout/AppLayout.tsx` -- logo import
- `src/components/layout/AppSidebar.tsx` -- logo import

### Files Added
- `src/assets/ibadat-logo.svg` (copied from upload)
- `public/favicon.svg` (copied from upload)

