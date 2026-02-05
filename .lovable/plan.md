

# Font Update Plan

## Overview
Replace the current Zilla Slab font with a dual-font system:
- **Bricolage Grotesque** for headings/titles (bold, distinctive)
- **Inter** for body text (clean, highly readable)

---

## Changes Required

### 1. Update Google Fonts Import (src/index.css)
Replace the current Zilla Slab import with both new fonts:
- Bricolage Grotesque (weights: 400, 500, 600, 700, 800)
- Inter (weights: 400, 500, 600)

### 2. Configure Tailwind Font Families (tailwind.config.ts)
Add two font family definitions:
- `font-sans` (default): Inter for body text
- `font-display`: Bricolage Grotesque for headings

### 3. Apply Heading Font Throughout App
Add utility classes to headings in:
- Auth pages (Welcome Back, Create Account)
- Dashboard page
- Any other title elements

This gives you the flexibility to use `font-display` on any heading element while keeping Inter as the default body font.

