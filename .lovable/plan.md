

# Fix FMB Hub Payment Bug + Remove Toast Close Icon

## Issue 1: Remove the X close icon from the celebration toast

Simple removal of the close button in `src/components/ui/celebration-toast.tsx`. The toast already auto-dismisses after 5 seconds, so the close button is unnecessary.

### File: `src/components/ui/celebration-toast.tsx`
- Remove the `X` import from iconoir-react
- Remove the `onDismiss` prop from the component interface
- Remove the close button element entirely
- Remove the `onDismiss` callback from the `toast.custom()` call

## Issue 2: FMB Hub due not getting marked as paid (BUG)

### Root Cause

There are **two separate instances** of `useDuePayments()` that don't share state:

1. **Instance 1** -- inside `useDueReminders()` hook (line 67 of `useDueReminders.ts`). This is the one that performs `markAsPaid` and refetches payments after recording.
2. **Instance 2** -- called directly in `DueRemindersCard` (line 19-20 of `DueRemindersCard.tsx`). This is the one used to check `isPaymentMadeThisMonth` for rendering the checkbox state.

When the user ticks FMB Hub:
- `markAsPaid` runs via Instance 1 -- the payment is recorded in the database and Instance 1 refetches its internal `payments` state.
- But the checkbox's `checked` prop reads `isPaymentMadeThisMonth` from Instance 2 -- which has **stale state** and never refetched. So the checkbox stays unchecked.
- The toast fires because `markAsPaid` succeeded, creating the confusing situation where the toast says "marked as paid" but the checkbox is still empty.

### Fix

Expose `isPaymentMadeThisMonth` from the `useDueReminders` hook (which already has access to it internally) and remove the redundant second `useDuePayments()` call from `DueRemindersCard`.

### File: `src/hooks/useDueReminders.ts`
- Add `isPaymentMadeThisMonth` to the `UseDueRemindersReturn` interface
- Return `isPaymentMadeThisMonth` from the hook

### File: `src/components/dues/DueRemindersCard.tsx`
- Remove the separate `import { useDuePayments }` and the `useDuePayments()` call
- Destructure `isPaymentMadeThisMonth` from `useDueReminders()` instead

## Files Changed
- `src/components/ui/celebration-toast.tsx` -- remove close button
- `src/hooks/useDueReminders.ts` -- expose `isPaymentMadeThisMonth` in return value
- `src/components/dues/DueRemindersCard.tsx` -- use single source of truth for payment state

