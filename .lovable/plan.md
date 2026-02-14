

# Add Bottom Padding to Mobile Navigation Bar

## Problem
The mobile bottom navigation bar sits too close to the native OS swipe-up-to-home gesture area, making it feel cramped and easy to accidentally trigger the OS gesture.

## Solution
Add a small fixed bottom padding (e.g. `pb-2`) inside the nav bar container, in addition to the existing `pb-safe` (which handles the safe area inset on notched devices). This provides extra breathing room even on devices where `safe-area-inset-bottom` is zero or minimal.

## Files
- **Edit**: `src/components/layout/MobileBottomNav.tsx` -- add `pb-2` to the inner nav `div` (the one with `h-16`)

This is a one-line CSS class addition.

