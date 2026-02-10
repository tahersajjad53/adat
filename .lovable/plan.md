

# Add "New Goal" CTA to Navigation

## Overview

Add a `+` button to the mobile bottom tab bar (center position, inspired by the reference) and a labeled "Add Goal" button to the desktop sidebar. Both trigger the existing `GoalFormSheet` for goal creation, accessible from any page.

## Mobile: Center `+` Button in Bottom Tab Bar

Inspired by the reference image, add a prominent `+` button in the center of the bottom nav bar between Namaz and Goals tabs.

```text
[ Today ]  [ Namaz ]  [ + ]  [ Goals ]  [ Profile ]
```

- Circular button with a `Plus` icon, visually elevated (larger size, primary background)
- Tapping it opens the `GoalFormSheet` in create mode
- The existing FAB on the Goals page will be removed since this new CTA replaces it globally

## Desktop: "Add Goal" Button in Sidebar

Add a labeled sidebar menu item below the navigation group (or as a separate action group) with a `Plus` icon and "Add Goal" label. Clicking it opens the same `GoalFormSheet`.

## Architecture

Since the form sheet needs to be triggered from layout-level components (bottom nav / sidebar), the `GoalFormSheet` and its open state need to be lifted. The cleanest approach:

- Add `goalFormOpen` state and the `GoalFormSheet` render inside `AppLayout`
- Pass an `onAddGoal` callback down to `MobileBottomNav` and `AppSidebar` (via props or a simple context)
- The `GoalFormSheet` in `AppLayout` handles creation via `useGoals().createGoal`
- Remove the FAB from `Goals.tsx` since the global CTA replaces it

## Changes

### 1. `src/components/layout/AppLayout.tsx`
- Import `GoalFormSheet`, `useGoals`, and `useState`
- Add `formOpen` state and `createGoal` from `useGoals()`
- Render `GoalFormSheet` at the layout level
- Pass `onAddGoal={() => setFormOpen(true)}` to both `MobileBottomNav` and `AppSidebar`

### 2. `src/components/layout/MobileBottomNav.tsx`
- Accept `onAddGoal` prop
- Insert a center `+` button between Namaz and Goals tabs
- Style it as a circular elevated button (e.g., `h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-md -mt-4`) to make it visually prominent like the reference
- Split `navItems` into left two and right two, with the `+` button in the middle

### 3. `src/components/layout/AppSidebar.tsx`
- Accept `onAddGoal` prop
- Add a new sidebar menu item or button below the navigation group labeled "Add Goal" with `Plus` icon
- Styled as a secondary action within the sidebar

### 4. `src/pages/Goals.tsx`
- Remove the mobile FAB (the `fixed bottom-20 right-4` button) since the global nav CTA replaces it
- Keep the desktop "Add Goal" button in the page header as-is (it's contextual and useful)

## Files Changed

- `src/components/layout/AppLayout.tsx` -- add GoalFormSheet state and rendering, pass callback to nav components
- `src/components/layout/MobileBottomNav.tsx` -- add center `+` button
- `src/components/layout/AppSidebar.tsx` -- add "Add Goal" sidebar item
- `src/pages/Goals.tsx` -- remove mobile FAB

