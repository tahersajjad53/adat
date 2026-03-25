

## Liquid Fill Tasbeeh Counter

Replace the radial ring progress indicator with a full-page liquid fill effect that rises from the bottom based on completion percentage.

### Visual concept

```text
┌──────────────────┐
│  ← Title     ⋯   │  ← header (z-10, always on top)
│                   │
│                   │  ← unfilled area (page background)
│       42          │  ← count number (contrast-aware text)
│   42 / 100        │
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  ← fill rises from bottom
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│     (42% filled = 42% of viewport)
└──────────────────┘
```

### Changes to `src/pages/TasbeehCounter.tsx`

1. **Remove SVG ring** — delete the radial ring SVG and its size/stroke/circumference calculations

2. **Add liquid fill background** — a `div` positioned `fixed inset-0` with `bottom: 0` and `height: {percentage}%`, using `hsl(var(--primary))` as fill color. Smooth CSS transition on height (`transition-all duration-300`). When no target is set, show a subtle 10% fill at 25% opacity (matching current ring behavior)

3. **Contrast-aware text color** — compute whether the count text sits above or below the fill line:
   - Calculate the fill boundary as a percentage of viewport height from the bottom
   - The count is positioned ~center of the page. If the fill level reaches the count position, switch text to white (`text-primary-foreground`); otherwise keep `text-foreground`
   - Use a simple threshold: if `percentage > 45` the count is "inside" the liquid → use light text
   - Header buttons also get contrast treatment when `percentage > 85`

4. **Make the entire page tappable** — the tap button expands to fill the viewport (the whole page is the tap target), removing the fixed 260×260 constraint

5. **Keep existing behavior** — confetti, haptics, reset button, edit/delete dialogs, target label all remain unchanged

### Layout structure

```tsx
{/* Fixed liquid fill behind everything */}
<div className="fixed inset-x-0 bottom-0 bg-primary transition-all duration-300"
     style={{ height: `${percentage}%` }} />

{/* Page content on top */}
<div className="relative z-10 flex flex-col min-h-dvh">
  {/* Header */}
  {/* Full-page tap button (flex-1) with centered count */}
  {/* Target label */}
</div>
```

### Text contrast logic

```ts
const isInFill = hasTarget && percentage > 45;
const isHeaderInFill = hasTarget && percentage > 85;
const countColor = isInFill ? 'text-primary-foreground' : 'text-foreground';
const headerColor = isHeaderInFill ? 'text-primary-foreground' : '';
```

