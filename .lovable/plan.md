

# PWA Install Prompt

## Overview
Add a dismissible banner just above the mobile bottom navigation bar that prompts browser users to install the app as a PWA.

## How It Works

1. **Create a custom hook** `src/hooks/usePWAInstall.ts` that:
   - Listens for the browser's `beforeinstallprompt` event and stores it
   - Checks if the app is already installed via `display-mode: standalone` media query
   - Tracks dismissal state in `localStorage` (`pwa-install-dismissed`)
   - On iOS (no `beforeinstallprompt` support), detects via user agent to show alternative instructions
   - Exposes `canPrompt`, `isIOS`, `promptInstall()`, and `dismiss()`

2. **Create a banner component** `src/components/pwa/InstallBanner.tsx`:
   - A slim, dismissible banner with frosted glass styling matching the existing bottom nav aesthetic (`bg-background/40 backdrop-blur-xl`)
   - Text: "Install Ibadat for a better experience"
   - "Install" primary pill button + dismiss "X" button
   - On iOS: shows "Tap Share then 'Add to Home Screen'" hint instead of the Install button

3. **Place the banner in `src/components/layout/MobileBottomNav.tsx`** -- rendered directly above the nav bar (inside the same fixed container or as a sibling positioned just above it), so it sits between the page content and the bottom tab bar. This keeps it visible and accessible without overlapping content.

## Files
- **Create**: `src/hooks/usePWAInstall.ts`
- **Create**: `src/components/pwa/InstallBanner.tsx`
- **Edit**: `src/components/layout/MobileBottomNav.tsx` -- render InstallBanner above the nav tabs
- **Edit**: `src/components/layout/AppLayout.tsx` -- pass-through or integrate the banner (if needed for state management)

