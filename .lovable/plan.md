
# Add FAB for "Add Sabeel" (matching Goals pattern)

## What Changes

Replace the inline "Add Sabeel" button in the header with:
- **Desktop**: A standard button in the header (same as Goals page)
- **Mobile**: A floating action button (FAB) pinned to the bottom-right corner

This matches the existing Goals page pattern exactly.

## Technical Details

### `src/components/dues/DuesSection.tsx`
1. Import `useIsMobile` from `@/hooks/use-mobile` and `Plus` from `iconoir-react` (replacing the lucide `Plus`)
2. In the header, wrap the "Add Sabeel" button with `{!isMobile && ...}` so it only shows on desktop
3. Add a mobile FAB at the bottom of the component (outside the main content area):
   ```
   {isMobile && (
     <Button
       onClick={handleAddSabeel}
       size="icon"
       className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg"
     >
       <Plus className="h-6 w-6" />
     </Button>
   )}
   ```
4. Update the empty state to also conditionally show the inline "Add Your First Sabeel" button only on desktop (on mobile the FAB serves this purpose)
