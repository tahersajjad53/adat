

# Add Rounded Top Corners to Bottom Sheet Overlay

## Problem
The "Add Goal" bottom sheet on mobile has sharp top corners, which doesn't match the app's rounded design language.

## Change

### SheetContent in `src/components/ui/sheet.tsx`
- Update the `bottom` variant in `sheetVariants` to include `rounded-t-2xl` (large top-corner rounding), adding it to the existing bottom side class string.

This is a one-line change in the sheet variants that will apply to all bottom sheets across the app (goal form, sabeel form, etc.).

