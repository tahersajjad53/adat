

# Simplify Goals 3-Dot Menu

## Problem
The dropdown menu currently mixes a navigational item ("Completed Goals") with an inline settings panel (Dynamic Goals toggle + explanation). "Completed Goals" looks like a title, and the Dynamic Goals section feels bulky inside a dropdown.

## Solution
Make both items simple navigational menu items. Tapping "Dynamic Goals" navigates to a new dedicated settings page with the explanation and toggle.

### Changes

**1. New page: `src/pages/DynamicGoalsSettings.tsx`**
- Simple page with a back button, title, explanation text, and the on/off toggle
- Reuses the existing `useUserPreferences` hook for the toggle state
- Consistent styling with the rest of the app (same container/max-width pattern)

**2. New route in `src/App.tsx`**
- Add `/goals/dynamic-goals` route pointing to the new page

**3. Simplify menu in `src/pages/Goals.tsx` (desktop)**
- Replace the inline Dynamic Goals panel with a simple `DropdownMenuItem` that navigates to `/goals/dynamic-goals`
- Both items ("Completed Goals" and "Dynamic Goals") become identical-looking menu items

**4. Simplify menu in `src/components/layout/AppLayout.tsx` (mobile)**
- Same change: replace the inline panel (lines 79-91) with a simple `DropdownMenuItem` navigating to `/goals/dynamic-goals`
- Remove the `Switch` import and `dynamicGoalsEnabled`/`setDynamicGoalsEnabled` from this file since they move to the new page

### Result
The 3-dot menu becomes a clean, minimal list:
- Completed Goals (navigates to `/goals/completed`)
- Dynamic Goals (navigates to `/goals/dynamic-goals`)

Both look and behave identically as tappable menu items.
