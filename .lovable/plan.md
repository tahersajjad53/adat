

# Move Namaz 3-Dot Menu to App Header

## Problem
The Namaz page currently renders its own 3-dot menu in a separate row below the app header, wasting vertical space. It should sit in the header bar alongside the centered logo, matching how the Goals page menu works.

## Changes

### 1. `src/components/layout/AppLayout.tsx`
- Add `isNamazPage` check: `location.pathname === '/namaz'`
- Expand the header right-side conditional to handle both Goals and Namaz pages
- For Namaz: render a `DropdownMenu` with a single `DropdownMenuItem` labeled "Clear Qaza Namaz"
- This menu item needs to trigger a callback, so we'll accept an optional prop or use a simple event/state pattern
- **Approach**: Add a state `clearQazaRequested` and pass it down via children or use a simpler pattern -- since the Namaz page already has the `AlertDialog` and `clearAllQaza` logic, the cleanest approach is to expose a callback. We'll use a lightweight event: the header sets a state flag, and the Namaz page reads it.
- **Simpler approach**: Add a `namazMenuAction` state in AppLayout. When the Namaz menu item is clicked, set it. Pass it to children via a React context or render prop. Actually, the simplest: just render the menu trigger in the header and have the Namaz page provide its menu content via a portal or shared state.

**Cleanest solution**: Move just the trigger button to the header, and keep the dropdown content + AlertDialog in the Namaz page by using a shared state approach:
- AppLayout exposes a "header action slot" -- but this adds complexity.

**Actually simplest**: 
- Import `useMissedPrayers` in AppLayout (only the `unfulfilledCount` and `clearAllQaza`)
- Render the full Namaz dropdown menu + AlertDialog in AppLayout for the Namaz page, mirroring the Goals page pattern
- Remove the menu and AlertDialog from `src/pages/Namaz.tsx`

### File: `src/components/layout/AppLayout.tsx`
- Import `DropdownMenuItem` from dropdown-menu components
- Import `AlertDialog` and related components
- Import `useMissedPrayers` hook
- Add `isNamazPage` check
- Add `clearConfirmOpen` state
- In the header right-side conditional: extend to `isGoalsPage || isNamazPage`
  - For Goals page: render the Dynamic Goals toggle dropdown (existing)
  - For Namaz page: render a dropdown with "Clear Qaza Namaz" item (disabled when `unfulfilledCount === 0`)
- Add the `AlertDialog` for clear confirmation (same content as currently in Namaz.tsx)

### File: `src/pages/Namaz.tsx`
- Remove the entire header row with the 3-dot menu (the `flex items-center justify-end` div)
- Remove the `AlertDialog` for clear confirmation
- Remove `clearConfirmOpen` state
- Remove `MoreHoriz`, `Button`, `DropdownMenu`, `AlertDialog` imports that are no longer needed
- Keep `clearAllQaza` and `unfulfilledCount` destructured from `useMissedPrayers` -- actually these will move to AppLayout, so remove them from Namaz.tsx if no longer used there

This keeps the pattern consistent: page-specific header menus live in AppLayout, and pages focus on their content.
