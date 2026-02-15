
# Mobile Dialog and Dropdown Spacing Fixes

## Problem
1. The "Clear Qaza Namaz" AlertDialog and "Did you know?" Dialog are full-width on mobile with no margins, touching screen edges.
2. The Dynamic Goals toggle dropdown overflows the screen on mobile (text gets cut off).

## Changes

### 1. `src/components/ui/alert-dialog.tsx` -- Add mobile margins and bottom positioning
- Update `AlertDialogContent` default classes to add horizontal margins on mobile (`mx-4`) and round corners on all sizes (`rounded-lg`)
- Change mobile positioning: instead of centered (`top-[50%] translate-y-[-50%]`), position near the bottom on mobile using responsive classes: `bottom-6 top-auto translate-y-0` on mobile, reverting to centered on `sm:` breakpoint
- Adjust `w-full` to `w-[calc(100%-2rem)]` on mobile so it respects margins

### 2. `src/components/ui/dialog.tsx` -- Same treatment for the education popup
- Apply the same mobile bottom-positioned, margined styling to `DialogContent`

### 3. `src/components/layout/AppLayout.tsx` -- Fix dropdown overflow
- On the Goals page mobile dropdown, add `max-w-[calc(100vw-2rem)]` or reduce `min-w-[280px]` and add `mr-2` to the `DropdownMenuContent` so text wraps properly within screen bounds

## Technical Details

### File: `src/components/ui/alert-dialog.tsx` (line 37)
Replace the AlertDialogContent className:
- From: `fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] ... sm:rounded-lg`
- To: `fixed left-[50%] z-50 grid w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] bottom-24 rounded-lg sm:bottom-auto sm:top-[50%] sm:translate-y-[-50%] ...`
- This positions the dialog just above the bottom nav on mobile (~bottom-24 accounts for bottom nav height), centered on desktop

### File: `src/components/ui/dialog.tsx` (line 36-37)
Apply the same positional changes to `DialogContent`:
- From: `fixed left-[50%] top-[50%] ... translate-y-[-50%] ... sm:rounded-lg`
- To: `fixed left-[50%] ... w-[calc(100%-2rem)] ... bottom-24 rounded-lg sm:bottom-auto sm:top-[50%] sm:translate-y-[-50%] ...`

### File: `src/components/layout/AppLayout.tsx` (line 74)
Update the mobile Goals dropdown:
- Change `min-w-[280px]` to `min-w-[260px] max-w-[calc(100vw-2rem)]` so the dropdown stays within screen bounds with margins
