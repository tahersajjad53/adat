## Goal
Replace the hard bottom edge of the sticky mobile header with a soft feathered fade so the frosted blur blends into the page content (matching the Lovable mobile app reference).

## Approach
Instead of applying `backdrop-blur` + `border-b` directly to the `<header>` (which always produces a crisp cut-off line), split the header into two layers:

1. **A feathered background layer** (absolutely positioned, behind the controls) that owns the blur, tint, and saturation. It extends ~16–24px past the bottom of the header and uses a CSS `mask-image: linear-gradient(to bottom, black 0, black 65%, transparent 100%)` so the blur and color tint fade smoothly into the content below.
2. **The header content layer** (logo, menu buttons) stays as-is, sharp and fully opaque, sitting above the feathered layer.

The hard `border-b` is removed entirely — the feather replaces it as the visual separator.

## Changes
- File: `src/components/layout/AppLayout.tsx`
  - Mobile `<header>` (dashboard + non-dashboard variants): remove `bg-background/40 backdrop-blur-xl backdrop-saturate-150 border-b border-border/50` from the header element.
  - Add an absolutely positioned child `<div>` inside the header that:
    - Spans `inset-x-0 top-0`, height = header height + ~20px feather (`-bottom-5` or `h-[calc(100%+20px)]`)
    - Carries the blur classes: `bg-background/40 backdrop-blur-xl backdrop-saturate-150`
    - Uses inline style `maskImage` / `WebkitMaskImage`: `linear-gradient(to bottom, hsl(0 0% 0%) 0%, hsl(0 0% 0%) 65%, transparent 100%)`
    - Sits behind content (`-z-10` within the header's stacking context, or place it before the content div with `pointer-events-none`)
  - On dashboard, toggle the feather layer's opacity via the existing `scrolled` state (fade in on scroll, hidden at top) using `transition-opacity duration-200`. Non-dashboard pages keep it always visible.
  - Keep `sticky top-0 z-40 pt-safe-min` and the inner `container flex h-14` content untouched.

## Out of scope
- Desktop header (unchanged — it has a sidebar layout and solid background).
- Bottom navigation, dashboard content, or any other components.
