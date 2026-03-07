

## What's New Popup for Returning/New Users

### Overview
Create a visually striking "What's New" dialog that shows after login, listing today's updates with a warm tone. Uses a soft gradient background themed to the user's preference. Shown once per update version via localStorage.

### Updates Content
- 🏷️ Goals are now grouped by tags on your Today page
- 🔀 Reorder your tag groups from Profile settings
- 🔍 Filter goals by tag on the Goals page

### Trigger Logic
- Show 2 seconds after Dashboard mounts (same pattern as education popup)
- Gate via `localStorage.getItem('whats-new-v1')` -- bump version string for future updates
- Only show to authenticated users

### Changes

**New: `src/components/WhatsNewPopup.tsx`**
- Dialog component with theme-aware gradient background (warm peach/green for Oudh, grey for Khalaf, dark orange for Bhukur) using CSS gradients on the DialogContent
- Reads current theme from `useTheme()`
- Header: small uppercase label "WHAT'S NEW" + a warm greeting ("Welcome back!" or similar)
- List of 3 update items, each with emoji + short description
- Single "Got it" dismiss button
- On close, sets `localStorage.setItem('whats-new-v1', 'true')`

**`src/pages/Dashboard.tsx`**
- Import and render `<WhatsNewPopup />` inside the Dashboard
- The popup manages its own open state and timer internally

### UI Design (inspired by reference image)
- Rounded card with soft gradient overlay (not a solid color)
- Gradient examples:
  - Oudh: `linear-gradient(135deg, hsl(40 30% 94%), hsl(160 30% 85%), hsl(40 25% 92%))`
  - Khalaf: `linear-gradient(135deg, hsl(0 0% 98%), hsl(220 15% 94%), hsl(0 0% 97%))`
  - Bhukur: `linear-gradient(135deg, hsl(207 11% 15%), hsl(24 40% 25%), hsl(210 14% 18%))`
- Large readable text for updates, generous padding
- Positioned per existing mobile popup geometry (bottom-24 on mobile, centered on desktop)

