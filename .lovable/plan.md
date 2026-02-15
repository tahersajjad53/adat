
# Khalaf Accent Color + Status Bar Theme Adaptation

## Changes

### 1. Khalaf accent color -- switch to steely slate/grey
**File: `src/index.css`** (`.theme-khalaf` block)
- Change `--accent: 16 80% 48%` to a cool slate: `--accent: 215 20% 50%` (a steely blue-grey)
- Change `--accent-foreground: 0 0% 100%` stays white for contrast
- This gives Khalaf a sophisticated, neutral feel instead of the warm orange accent

**File: `src/components/profile/ThemeSelector.tsx`**
- Update the Khalaf swatch preview `accent` color from `hsl(16 80% 48%)` to `hsl(215 20% 50%)` so the theme picker accurately reflects the new look

### 2. Status bar (battery/wifi toolbar) adapts to active theme
The status bar color on mobile is controlled by the `<meta name="theme-color">` tag in `index.html`. Currently it's hardcoded to `#1a1a2e` which doesn't match any theme.

**File: `src/contexts/ThemeContext.tsx`**
- In `applyThemeClass()`, also update the `<meta name="theme-color">` tag dynamically:
  - Oudh: `#ece4d4` (warm beige -- `hsl(40 30% 94%)` converted)
  - Khalaf: `#ffffff` (white -- `hsl(0 0% 100%)`)
  - Bhukur: `#171717` (near-black -- `hsl(0 0% 9%)`)
- This ensures the phone's status bar matches the active theme background

### Technical Details

**`src/index.css`** -- line 73:
- `--accent: 16 80% 48%` becomes `--accent: 215 20% 50%`

**`src/contexts/ThemeContext.tsx`** -- in `applyThemeClass()`:
- Add a mapping of theme to hex color
- Query `document.querySelector('meta[name="theme-color"]')` and update its `content` attribute

**`src/components/profile/ThemeSelector.tsx`** -- line 27:
- Update `accent: 'hsl(16 80% 48%)'` to `accent: 'hsl(215 20% 50%)'`
