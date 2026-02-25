

# Fix: iOS Keyboard Obscuring Goal Form Input

## Problem

On iOS PWA, when the keyboard opens after tapping the title input in the "Add Goal" bottom sheet, the `max-h-[85vh]` constraint is based on the full viewport height — but iOS doesn't resize the viewport when the keyboard appears (especially in standalone PWA mode). The sheet stays at 85% of the full screen, and the keyboard covers the bottom half, hiding the input field and the form content.

## Solution

Use the CSS `dvh` (dynamic viewport height) unit instead of `vh`. On iOS, `100dvh` shrinks to account for the on-screen keyboard, so `max-h-[85dvh]` will automatically reduce the sheet height when the keyboard is visible, keeping the input in view.

Additionally, add a scroll-into-view behavior so the focused input scrolls into the visible area when the keyboard opens.

## Changes

**File: `src/components/goals/GoalFormSheet.tsx`**

1. Change `max-h-[85vh]` to `max-h-[85dvh]` on the mobile `SheetContent` (line 285). The `dvh` unit is supported on iOS 15.4+ and all modern browsers — it dynamically accounts for the keyboard.

2. Add an `onFocus` handler to the title `Input` that calls `scrollIntoView({ block: 'center' })` after a short delay (to wait for the keyboard animation). This ensures the focused field scrolls into view even if the layout shift is slow.

**File: `src/components/elan/AdminGoalForm.tsx`**

Apply the same `max-h-[85dvh]` fix to the admin form's mobile sheet for consistency.

## Technical Details

```
// Line 285 of GoalFormSheet.tsx
// Before:
<SheetContent side="bottom" className="max-h-[85vh] flex flex-col" ...>

// After:
<SheetContent side="bottom" className="max-h-[85dvh] flex flex-col" ...>
```

```
// Title Input — add onFocus scroll
<Input
  ...
  onFocus={(e) => {
    setTimeout(() => {
      e.target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 300);
  }}
/>
```

### Files changed

| File | Change |
|------|--------|
| `src/components/goals/GoalFormSheet.tsx` | `max-h-[85dvh]` + `scrollIntoView` on title input focus |
| `src/components/elan/AdminGoalForm.tsx` | `max-h-[85dvh]` on mobile sheet |

