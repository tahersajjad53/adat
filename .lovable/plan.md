## Fix mobile header overlap with iOS status bar

After enabling `viewport-fit=cover` (for the bottom nav safe-area fix), the page now extends under the iOS status bar, pushing the "ibadat" logo header out of view at the top.

### Change

**`src/index.css`** — Add a `.pt-safe-min` utility mirroring `.pb-safe-min`:
```css
.pt-safe-min {
  padding-top: max(0.5rem, env(safe-area-inset-top, 0px));
}
```

**`src/components/layout/AppLayout.tsx`** — On the mobile `<header>`, apply `pt-safe-min` so the header content sits below the status bar/notch on devices that need it, with no extra padding on devices that don't.

No changes to desktop layout, bottom nav, or any business logic.