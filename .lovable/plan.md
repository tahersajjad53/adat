

## Fix Mobile Keyboard Overlap on Bottom Sheets

The issue: when a user focuses an input in a bottom sheet on mobile, the virtual keyboard pushes up but the sheet stays pinned to the bottom, causing the form content to be hidden behind the keyboard.

### Solution

Use the `visualViewport` API to detect when the keyboard is open and adjust the sheet's bottom padding accordingly. This is the most reliable cross-browser approach for handling mobile keyboards.

### Changes

**`src/components/ui/sheet.tsx`**
- For the `bottom` variant, add a CSS custom property `--keyboard-offset` that shifts the sheet content above the keyboard
- Alternatively, simpler approach: add `pb-[env(safe-area-inset-bottom)]` and use a small hook

**Better approach — a shared hook `src/hooks/use-keyboard-offset.ts`**
- Uses `window.visualViewport` resize events to compute `keyboardHeight = window.innerHeight - visualViewport.height`
- Returns the keyboard height as a number

**`src/components/tasbeeh/TasbeehFormSheet.tsx`**
- On the mobile `SheetContent`, apply `style={{ paddingBottom: keyboardOffset }}` using the hook
- This pushes form content above the keyboard

**`src/components/goals/GoalFormSheet.tsx`**
- Same treatment — apply keyboard offset padding to the mobile SheetContent
- The existing `max-h-[85dvh]` already constrains height; the scroll container will adapt

**`src/components/dues/SabeelFormSheet.tsx`**
- Same treatment for consistency

This is a lightweight, non-invasive fix — a ~15-line hook and a one-line style addition per form sheet.

