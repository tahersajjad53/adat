

## Improve Plus Button Popover Menu

The reference image shows a macOS-style popover with each option having an icon on the left, generous padding, and a clean card-like appearance. The current menu is small text-only buttons.

### Changes

**`src/components/layout/MobileBottomNav.tsx`**
- Widen popover from `w-44` to `w-56`, increase padding to `p-2`
- Add icons: `Archery` for New Goal, a counter/repeat icon for Tasbeeh Counter (e.g. `Restart` or similar from Iconoir)
- Each menu item: icon + label in a row, with `px-4 py-3.5 text-base` for larger tap targets
- Add a subtle separator between items

**`src/components/layout/AppSidebar.tsx`**
- Match the same icon treatment for the sidebar "Add Goal" and "Tasbeeh Counter" buttons (already has icons, just ensure consistency)

