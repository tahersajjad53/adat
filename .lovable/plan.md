

# Rounded Buttons + Colour Palette Refresh

## Overview

Two changes inspired by the reference health app UI: make all buttons pill-shaped (fully rounded) and refine the colour palette to be warmer, softer, and more aligned with the beige/lime reference.

## 1. Rounded Buttons

Change the global `--radius` from `0.5rem` to `1rem` so all UI elements (cards, inputs, dialogs) get rounder corners. Then update the Button component to use `rounded-full` (pill shape) instead of `rounded-md`, matching the reference's approachable, capsule-style buttons.

### Files
- **`src/index.css`**: Change `--radius: 0.5rem` to `--radius: 1rem`
- **`src/components/ui/button.tsx`**: Replace `rounded-md` with `rounded-full` in the base CVA class and in the `sm`/`lg` size variants

## 2. Colour Palette Update

The reference uses:
- A warm off-white/beige background (less green tint than current)
- Darker, more neutral foreground text (near-black rather than forest green)
- Lime-yellow accents on feature cards
- Softer, warmer greys for borders and muted elements

### Adjusted light-mode CSS variables in `src/index.css`:

| Token | Current | New | Rationale |
|-------|---------|-----|-----------|
| `--background` | `45 30% 92%` | `40 30% 94%` | Slightly lighter, warmer cream |
| `--foreground` | `160 50% 18%` | `150 10% 15%` | Near-black, less green tint for readability |
| `--card` | `45 25% 96%` | `40 25% 97%` | Brighter card surface |
| `--card-foreground` | `160 50% 18%` | `150 10% 15%` | Match foreground |
| `--muted` | `45 15% 88%` | `40 20% 90%` | Warmer muted bg |
| `--muted-foreground` | `160 30% 35%` | `150 10% 40%` | More neutral grey text |
| `--border` | `160 15% 80%` | `40 15% 82%` | Warmer border, less green |
| `--input` | `160 15% 85%` | `40 15% 87%` | Warmer input bg |
| `--accent` | `75 70% 50%` | `68 75% 55%` | Slightly warmer, brighter lime (closer to the reference yellow-lime) |
| `--secondary` | `45 20% 90%` | `40 20% 91%` | Warmer secondary |

Primary, destructive, popover, ring, and sidebar tokens remain unchanged since the forest green identity and dark mode are intentional.

### Dark mode
No changes -- the dark palette already works well and isn't represented in the reference.

## Files Changed
- `src/index.css` -- update `--radius` and ~10 light-mode colour variables
- `src/components/ui/button.tsx` -- change `rounded-md` to `rounded-full` in CVA base + size variants
