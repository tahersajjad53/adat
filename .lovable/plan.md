

# Make Frosted Glass Effect Visible on Mobile Bottom Nav

## Problem

The `bg-background/70` opacity is too high -- at 70% opacity of the same beige background color, the translucency is nearly invisible. The frosted glass effect only becomes apparent when there's a strong contrast between the nav background and the content scrolling underneath.

## Solution

Reduce the background opacity and fine-tune the blur to make the frosted glass effect clearly visible:

### File: `src/components/layout/MobileBottomNav.tsx`

Update the nav classes:
- Change `bg-background/70` to `bg-background/50` for more transparency
- Keep `backdrop-blur-xl backdrop-saturate-150` for the frosted effect
- Add a subtle top shadow (`shadow-[0_-1px_12px_rgba(0,0,0,0.06)]`) to give the glass panel a lifted feel

This ensures the effect is visible even when content shares a similar background color, and becomes more dramatic when cards or colored content scroll underneath.

## Files Changed

- `src/components/layout/MobileBottomNav.tsx` -- reduce bg opacity, add subtle shadow

