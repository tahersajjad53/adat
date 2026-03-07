

## Hide Scrollbar on Tag Filter Pills

The `scrollbar-none` utility class is already applied to the filter row in `Goals.tsx` but it's never defined in the CSS. I'll add the utility to `src/index.css` so it hides the scrollbar cross-browser.

### Change

**`src/index.css`** — Add a utility class:
```css
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
```

No other files need changes — `Goals.tsx` already uses the class.

