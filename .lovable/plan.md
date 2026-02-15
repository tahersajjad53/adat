

# Fix Android Maskable Icon for PWA

## Problem
The current manifest uses `favicon.svg` with `purpose: "any maskable"` as the maskable icon. SVGs don't work well as Android adaptive/maskable icons -- Android expects a PNG with extra padding (safe zone) so the icon looks correct when cropped into circles, squircles, or rounded squares. This causes the home screen icon to look different (or broken) compared to iOS.

## Solution
Split the icon declarations so the PNG files serve as both regular and maskable icons, and remove the SVG maskable entry.

## Changes

### File: `vite.config.ts` (icons array, lines 32-36)
Replace the current icons config with:

```
icons: [
  { src: "pwa-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
  { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
  { src: "pwa-192x192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
  { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
],
```

- The `purpose: "any"` entries serve as standard icons (used by iOS and browsers)
- The `purpose: "maskable"` entries tell Android to use the same PNG for adaptive icon shapes
- Removes the SVG entry which was causing the mismatch

### Note
After deploying, you'll need to uninstall and reinstall the PWA on Android for the new manifest icons to take effect. If the icon still appears slightly cropped on Android, the PNG itself may need more padding around the logo (Android's safe zone crops ~10% from each edge), but this change should already be a significant improvement.

