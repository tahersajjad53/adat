

## Fix: iOS PWA Status Bar Color Across All Themes

### Root cause

The `applyThemeClass` function in `ThemeContext.tsx` uses `document.querySelector('meta[name="theme-color"]')` which only selects the **first** `<meta name="theme-color">` tag. There are now three such tags in `index.html`. iOS PWA reads the media-query variants, which never get updated by JavaScript — so the status bar color stays stale after theme switching.

### Changes

**`src/contexts/ThemeContext.tsx`** — `applyThemeClass` function

Update the meta tag logic to set **all three** `theme-color` meta tags to the active theme's color. This overrides the media-query variants so iOS always picks up the correct value regardless of system appearance:

```ts
const metas = document.querySelectorAll('meta[name="theme-color"]');
metas.forEach(meta => meta.setAttribute('content', THEME_COLORS[theme]));
```

This is a single-line change (line 26-27) replacing the existing `querySelector` + `setAttribute`.

### Why this works

iOS Safari respects `media` attributes on `theme-color` meta tags. When we only updated the first (no-media) tag, iOS continued reading the `prefers-color-scheme: light` or `dark` variant with the old color. By updating all three tags to the active theme's color, iOS always sees the correct value regardless of which meta tag it prioritizes.

