

# Frosted Glass Effect on Mobile Bottom Tab Bar

## Change

### File: `src/components/layout/MobileBottomNav.tsx`

Update the `nav` element's classes to replace the solid `bg-background` with a frosted glass effect:

- Remove `bg-background`
- Add `bg-background/70 backdrop-blur-xl backdrop-saturate-150`
- Keep the existing `border-t border-border` but optionally soften it to `border-t border-border/50` for a more glass-like feel

The result: a translucent, blurred background that lets content scroll underneath with a subtle frosted appearance, while keeping nav items readable.

## Files Changed

- `src/components/layout/MobileBottomNav.tsx` -- update nav background classes

