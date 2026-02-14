

# Add Theme Selector to Profile Page

## Overview
Add a "Theme" section to the Profile page with three selectable themes: **Oudh** (current warm beige/green), **Khalaf** (pure white with orange/grey), and **Bhukur** (dark with grey/orange). The selected theme is persisted in the database and applied globally via CSS custom properties.

## Theme Definitions

### 1. Oudh (Current)
The existing warm beige/cream + forest green palette with lime accents. No changes needed -- this is the default.

### 2. Khalaf (Light / White + Orange)
- Background: pure white (`0 0% 100%`)
- Cards: very light grey (`0 0% 98%`)
- Primary: warm orange (`24 85% 50%`)
- Accent: burnt orange (`16 80% 48%`)
- Muted/secondary: cool greys
- Sidebar: dark charcoal with orange highlights
- Foreground: near-black

### 3. Bhukur (Dark / Grey + Orange)
- Background: deep charcoal (`0 0% 9%`)
- Cards: dark grey (`0 0% 13%`)
- Primary: warm orange (`24 85% 55%`)
- Accent: amber-orange (`30 90% 50%`)
- Muted/secondary: medium greys
- Sidebar: slightly lighter dark grey with orange accent
- Foreground: off-white

## Changes Required

### 1. Database: Add `theme` column to `profiles`
- New migration: `ALTER TABLE profiles ADD COLUMN theme text DEFAULT 'oudh';`
- Accepted values: `'oudh'`, `'khalaf'`, `'bhukur'`

### 2. `src/index.css` -- Add two new theme scopes
- Add `.theme-khalaf` scope with all CSS custom properties for the white/orange palette
- Add `.theme-bhukur` scope with all CSS custom properties for the dark/orange palette
- The existing `:root` variables become the Oudh defaults
- Remove the `.dark` class (it will be replaced by Bhukur)
- Update `.pattern-celebration` to use CSS variables instead of hardcoded HSL so it adapts per theme

### 3. New context: `src/contexts/ThemeContext.tsx`
- Provides `theme` (string) and `setTheme` (function)
- On mount, reads the user's saved theme from their profile
- When theme changes, applies the CSS class (`theme-khalaf` or `theme-bhukur`) to `<html>` element and persists to the profiles table
- Default theme is `'oudh'` (no extra class on `<html>`)

### 4. `src/App.tsx` -- Wrap with ThemeProvider
- Add `<ThemeProvider>` inside `<AuthProvider>` so theme context has access to the user

### 5. `src/pages/Profile.tsx` -- Add "Theme" menu item and section
- Add a new menu button (with a palette/color icon) for "Theme" between Account and Sign Out
- New sub-section showing three theme cards in a grid:
  - Each card is a small preview swatch (rounded rectangle) with the theme's primary colors
  - Shows theme name below
  - Active theme has a ring/check indicator
  - Tapping a card immediately switches the theme

### 6. Hardcoded color audit -- items to make theme-aware
These use hardcoded HSL values that need to reference CSS variables or adapt per theme:

| Location | Current | Fix |
|---|---|---|
| `Dashboard.tsx` progress bar | `hsl(75, 70%, 55%)` | Use `hsl(var(--accent))` |
| `index.css` `.pattern-celebration` | Hardcoded `hsl(68 75% 55%)` and `hsl(160 45% 22%)` | Use `hsl(var(--accent) / 0.1)` and `hsl(var(--primary) / 0.2)` |
| `confetti.tsx` particle colors | Hardcoded `hsl(142 50% 55%)` and `hsl(45 90% 60%)` | Use CSS variable references |
| Prayer gradients in `index.css` | Hardcoded per-prayer colors | Keep as-is -- these are contextual (time-of-day) not theme-dependent |
| Sidebar logo `brightness-0 invert` | Only works on dark bg | Conditional: keep for Oudh/Bhukur sidebar, adjust for Khalaf if sidebar is also dark (it will be, so no change needed) |

### 7. Component-level checks

| Page / Component | Concern | Resolution |
|---|---|---|
| **Auth pages** (AuthLayout) | Left panel uses `bg-primary` | Will naturally adapt since primary changes per theme |
| **TimeOfDayCard** | Uses prayer gradients (time-contextual) | No change -- these are fixed atmospheric gradients, not theme colors |
| **PrayerCard** | Uses semantic classes (`border-primary`, `bg-primary/5`, `text-destructive`) | Automatically adapts via CSS variables |
| **GoalCard** | Uses `bg-card`, `border-border`, `text-muted-foreground` | Automatically adapts |
| **MobileBottomNav / Header** | Uses `bg-background/40` with blur | Adapts automatically; on Bhukur the glass effect will show dark tones |
| **AppSidebar** | Uses sidebar-* variables | Each theme defines sidebar variables, so it adapts |
| **Checkbox** | Uses `bg-accent` when checked | Adapts (lime in Oudh, orange in Khalaf/Bhukur) |
| **Progress bar** | Uses `bg-primary` | Adapts |
| **Confetti** | Particle colors | Will be updated to use CSS variables |
| **DailyMeter** | Uses `text-foreground`, `text-muted-foreground` | Adapts |
| **Celebration toast** | `.pattern-celebration` | Will be updated to use variables |
| **Buttons (pill-shaped)** | Use `bg-primary text-primary-foreground` | Adapts |
| **Badge** | Uses semantic variants | Adapts |
| **Spinner/loading** | `border-foreground` | Adapts |

## Technical Details

### Theme application strategy
- Class-based theming on `<html>`: no class = Oudh, `.theme-khalaf` = Khalaf, `.theme-bhukur` = Bhukur
- All CSS variable overrides in `index.css` within the respective class scope
- No `next-themes` dependency needed; a lightweight custom context handles persistence and class toggling

### Theme persistence flow
1. User taps a theme card in Profile
2. ThemeContext updates local state and applies class to `<html>`
3. ThemeContext fires an async upsert to `profiles.theme`
4. On next login, ThemeContext reads the profile and applies the saved theme

### Profile page UI for theme selector
Three cards in a horizontal row, each showing:
- A small color swatch strip (background + primary + accent colors as horizontal bands)
- Theme name underneath
- A check icon or ring border on the active theme

