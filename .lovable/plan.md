

## Remove Redundant scrollIntoView Workaround from GoalFormSheet

The `useKeyboardOffset` hook now properly handles keyboard avoidance by adjusting the sheet's bottom padding. The older `scrollIntoView` workaround on the title input's `onFocus` (lines 198-203) is no longer needed and causes the "overcompensating" behavior visible in the screenshot — the form jumps too aggressively when the keyboard appears.

### Change: `src/components/goals/GoalFormSheet.tsx`

- **Remove** the `onFocus` handler from the title `<Input>` (lines 198-203) that does `scrollIntoView` with a 300ms delay
- The `useKeyboardOffset` + `paddingBottom` on `SheetContent` is sufficient to keep inputs visible

