

# Fix PWA Status Bar to Match Theme

## Problem
The iOS status bar (battery, wifi, time) still shows a mismatched background because:
1. The PWA manifest in `vite.config.ts` hardcodes `theme_color` and `background_color` to `#1a1a2e` (doesn't match any theme)
2. The `index.html` also hardcodes `#1a1a2e` as the initial theme-color
3. Missing the iOS-specific `apple-mobile-web-app-status-bar-style` meta tag, which controls how the status bar renders in standalone PWA mode

## Changes

### File: `index.html`
- Change the hardcoded `<meta name="theme-color" content="#1a1a2e">` to `#ece4d4` (Oudh, the default theme) so it matches on first load
- Add `<meta name="apple-mobile-web-app-capable" content="yes">` to enable standalone mode
- Add `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">` -- this makes the iOS status bar transparent and overlay the page background, so the page's own background color shows through seamlessly. On dark backgrounds (Bhukur), iOS automatically renders the system icons (time, battery, wifi) in white

### File: `vite.config.ts`
- Update `theme_color` from `#1a1a2e` to `#ece4d4` (Oudh default)
- Update `background_color` from `#1a1a2e` to `#ece4d4` (Oudh default)
- These are baked into the PWA manifest at build time and used as the initial/splash screen color

### How it works together
- On app launch, the PWA manifest and initial meta tag show the Oudh (default) background
- Once the user's saved theme loads from Supabase, `applyThemeClass()` dynamically updates the `<meta name="theme-color">` to match (already implemented)
- The `black-translucent` status bar style ensures the page background bleeds into the status bar area on iOS, creating the seamless look
- On Bhukur (dark), iOS automatically switches system icons to white for visibility

