

# Confirmation Dialog Before Marking Dues as Paid

## Overview

Add a branded confirmation dialog that appears when a user taps a dues checkbox. Since marking a due as paid cannot be undone, this gives the user a moment to verify before committing. The dialog will mirror the celebration toast's visual style -- decorative pattern banner at the top, warm tones, and friendly copy.

## Design

```text
+----------------------------------+
|  /////////////////////////////// |
|  //  Gradient + Pattern Banner // |
|  //  (same pattern-celebration)// |
|  /////////////////////////////// |
|                                  |
|  Confirm Payment                 |
|  Mark [Due Name] ([Amount]) as   |
|  paid? This cannot be undone.    |
|                                  |
|  [Cancel]           [Yes, Paid]  |
+----------------------------------+
```

- Same `pattern-celebration` banner as the toast for visual consistency
- Gentle, clear copy: title "Confirm Payment", description mentioning the due name and amount, with a note that it cannot be undone
- Two pill-shaped buttons: ghost "Cancel" and primary "Yes, Paid"
- Uses the existing Radix AlertDialog (already installed) for accessible modal behavior

## Changes

### 1. Create `src/components/dues/PaymentConfirmDialog.tsx`

A new component wrapping `AlertDialog` with branded styling:
- Props: `open`, `onOpenChange`, `dueName`, `amount`, `onConfirm`, `isLoading`
- Decorative `.pattern-celebration` banner at the top of the dialog content
- Title: "Confirm Payment" in display font
- Description: "[Due Name] - [Amount] will be marked as paid for this month. This cannot be undone."
- Footer with Cancel (ghost) and "Yes, Paid" (primary) buttons
- Rounded corners (`rounded-2xl`) matching the app's design language

### 2. Update `src/components/dues/DueRemindersCard.tsx`

- Add state for the pending reminder: `pendingReminder` (the reminder awaiting confirmation)
- When checkbox is tapped, instead of immediately calling `markAsPaid`, set `pendingReminder` to open the dialog
- On dialog confirm: run the existing `handleToggle` logic (confetti, markAsPaid, celebration toast)
- On dialog cancel: clear `pendingReminder`, no action taken

## Files Changed

- `src/components/dues/PaymentConfirmDialog.tsx` -- new branded confirmation dialog component
- `src/components/dues/DueRemindersCard.tsx` -- intercept checkbox tap to show confirmation first
