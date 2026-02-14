

# Full PWA Setup with vite-plugin-pwa

## Overview
Install `vite-plugin-pwa`, copy the provided icon assets, configure the service worker, and remove the old manual manifest.

## Changes

### 1. Copy icon assets to `public/`
- `user-uploads://icon-192.png` -> `public/pwa-192x192.png`
- `user-uploads://icon-512.png` -> `public/pwa-512x512.png`

### 2. Install `vite-plugin-pwa`

### 3. Update `vite.config.ts`
Add the `VitePWA` plugin:
- Inline manifest with name, theme_color, icons referencing the new PNGs and existing SVG favicon
- Workbox config with `navigateFallbackDenylist: [/^\/~oauth/]` to keep OAuth working
- `registerType: 'autoUpdate'` for seamless updates

### 4. Update `index.html`
- Remove `<link rel="manifest" href="/manifest.json" />`
- Add `<link rel="apple-touch-icon" href="/pwa-192x192.png" />`

### 5. Update `src/main.tsx`
Add service worker registration:
```ts
import { registerSW } from 'virtual:pwa-register';
registerSW({ immediate: true });
```

### 6. Delete `public/manifest.json`
The plugin auto-generates the manifest, so the manual file is no longer needed.

## Files Summary
- **Copy**: `icon-192.png` -> `public/pwa-192x192.png`
- **Copy**: `icon-512.png` -> `public/pwa-512x512.png`
- **Install**: `vite-plugin-pwa`
- **Edit**: `vite.config.ts` -- add VitePWA plugin
- **Edit**: `index.html` -- swap manifest link for apple-touch-icon
- **Edit**: `src/main.tsx` -- register service worker
- **Delete**: `public/manifest.json`

