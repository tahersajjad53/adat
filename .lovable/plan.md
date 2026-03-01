

## Fix: iOS PWA Status Bar Color

### Problem
The `THEME_COLORS` map in `ThemeContext.tsx` still has the old Bhukur background color (`#171717`) instead of the updated one (`#22272B`). When iOS reads the `theme-color` meta tag, it gets the wrong value, causing a mismatch in the dynamic island / status bar area.

Additionally, iOS PWAs are known to poorly handle dynamic `theme-color` updates via JavaScript. A more robust approach is to also declare multiple `<meta name="theme-color">` tags in `index.html` keyed by `media` attribute, so iOS picks up the right color on initial load based on system preference.

### Changes

**`src/contexts/ThemeContext.tsx`** (line 17)
- Update `bhukur` color from `#171717` to `#22272B`

**`index.html`** (line 10)
- Replace the single `<meta name="theme-color">` with two tags:
  - `<meta name="theme-color" content="#ece4d4" media="(prefers-color-scheme: light)">`
  - `<meta name="theme-color" content="#22272B" media="(prefers-color-scheme: dark)">`
- Keep the non-media fallback tag as well for browsers that don't support the media attribute

**`src/index.css`** — Bhukur theme
- Confirm the header uses `bg-background` so the status bar bleed-through matches the theme-color. No change expected here, just validation.

### Why this fixes it
iOS Safari (and iOS PWA) reads `theme-color` meta tags at page load and respects `media` queries on them. The JS-based update in `applyThemeClass` handles runtime switches. Together, both initial load and dynamic switching are covered.

