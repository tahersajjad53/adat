

# Fix iOS Keyboard Auto-Opening on Goal Form Sheet

## Problem
Removing `autoFocus` from the input wasn't enough. The Radix Dialog primitive (which powers the Sheet component) automatically focuses the first focusable element when it opens. On iOS, this triggers the keyboard.

## Solution
Add `onOpenAutoFocus={(e) => e.preventDefault()}` to the `SheetContent` component in the mobile branch of `GoalFormSheet.tsx`. This tells Radix not to auto-focus any element when the sheet opens.

## Files
- **Edit**: `src/components/goals/GoalFormSheet.tsx` -- add `onOpenAutoFocus` handler to `SheetContent` (around line 163)

## Technical Detail
The `SheetContent` wraps Radix `Dialog.Content`, which supports an `onOpenAutoFocus` event. Calling `preventDefault()` on it stops the default focus behavior entirely, so the keyboard only appears when the user explicitly taps an input.

