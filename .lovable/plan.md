

## Full-Width Plus Button Menu on Mobile

Change the PopoverContent from fixed `w-56` to full-width with horizontal margins, consistent with the app's mobile popup geometry pattern (`w-[calc(100%-2rem)]`).

### Change: `src/components/layout/MobileBottomNav.tsx`

- Line 57: Replace `className="w-56 p-2"` with `className="w-[calc(100vw-2rem)] p-2"` on PopoverContent
- This gives the menu full viewport width minus 1rem margin on each side, matching the existing mobile popup convention

