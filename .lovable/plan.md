
# Remove Orange from Khalaf Theme -- Replace with Grey Hues

## Overview
Replace all remaining orange (`24 85% 50%` / `24 85% 55%`) references in the Khalaf theme with sophisticated grey tones, creating a fully monochromatic white-and-grey theme.

## Changes

### File: `src/index.css` (`.theme-khalaf` block)
Replace orange primary and ring with dark charcoal grey, and sidebar primary with a lighter grey:

| Variable | Current (orange) | New (grey) |
|---|---|---|
| `--primary` | `24 85% 50%` | `0 0% 20%` (dark charcoal) |
| `--primary-foreground` | `0 0% 100%` | `0 0% 100%` (stays white) |
| `--ring` | `24 85% 50%` | `0 0% 20%` |
| `--sidebar-primary` | `24 85% 55%` | `0 0% 75%` (light grey for contrast on dark sidebar) |
| `--sidebar-primary-foreground` | `0 0% 100%` | `0 0% 5%` (near-black text on light grey) |
| `--sidebar-ring` | `24 85% 55%` | `0 0% 75%` |

### File: `src/index.css` (logo filter, line 162)
Update the `.theme-khalaf .logo-themed` CSS filter from the current warm/orange hue-rotate to a simple dark grey filter:
- New filter: `brightness(0) saturate(0)` -- renders the logo as pure black, matching the grey-only palette

### File: `src/components/profile/ThemeSelector.tsx` (line 26)
Update the Khalaf swatch preview:
- `primary`: from `hsl(24 85% 50%)` to `hsl(0 0% 20%)`
