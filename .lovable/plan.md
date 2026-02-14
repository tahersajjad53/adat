

# Fix Keyboard Auto-Opening on Mobile Goal Form

## Problem
When tapping the (+) button on the mobile bottom nav, the Goal form sheet opens with `autoFocus` on the title input, which immediately triggers the on-screen keyboard. This causes the form to visually jump/shift as the viewport resizes.

## Solution
Remove the `autoFocus` prop from the title input in `GoalFormSheet.tsx`. The keyboard will only open when the user explicitly taps on an input field.

## Files
- **Edit**: `src/components/goals/GoalFormSheet.tsx` -- remove `autoFocus` from the title Input (line ~104)

This is a one-line change.

