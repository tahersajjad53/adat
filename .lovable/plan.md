

# Accent-Colored Logo for Khalaf and Bhukur Themes

## Problem
The header logo (mobile centered header) currently shows in its native forest green (`#005240`) regardless of theme. For Khalaf and Bhukur, it should render in their respective accent color (orange tones).

## Approach
Add a CSS utility class in `index.css` that applies a color filter to the logo under each theme scope. The SVG is imported as an `<img>`, so CSS filters are the simplest way to recolor it without converting it to an inline React SVG component.

## Changes

### 1. `src/index.css` -- Add theme-scoped logo filter utilities
Add two utility classes that use CSS `filter` to shift the green logo to the orange accent:

- `.theme-khalaf .logo-themed` -- filters to match the Khalaf accent (warm orange, ~`hsl(24 85% 50%)`)
- `.theme-bhukur .logo-themed` -- filters to match the Bhukur accent (amber orange, ~`hsl(30 90% 50%)`)

The filter chain: `brightness(0) saturate(100%)` to flatten to black, then `invert()`, `sepia()`, `saturate()`, `hue-rotate()` to target the desired orange hue.

### 2. `src/components/layout/AppLayout.tsx` -- Apply the class to the mobile header logo
Add the `logo-themed` class to the `<img>` tag for the centered mobile header logo so the theme-scoped filters take effect on Khalaf and Bhukur. On Oudh (no theme class), no filter is applied and the logo stays green.

### 3. `src/components/auth/AuthLayout.tsx` -- Apply same class to the mobile auth logo
The auth layout also shows the logo on mobile; apply `logo-themed` there too for consistency.

No changes to the sidebar logo -- it already uses `brightness-0 invert` for white rendering on all dark sidebar backgrounds.
