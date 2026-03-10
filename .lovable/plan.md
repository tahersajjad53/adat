

## Radial Tasbeeh Counter Cards (Instagram Stories Style)

Replace the current list-style TasbeehCards with circular radial cards that sit in a horizontal scrollable row, inspired by Instagram Stories.

### TasbeehCard.tsx — Full Rewrite

Each counter becomes a circular element:
- **Size**: ~72px diameter circle
- **Gradient ring**: Each counter gets a gradient border (Instagram-style ring using an SVG circle or CSS `conic-gradient`). Use a rotating set of gradients so adjacent counters look distinct (e.g., amber→orange, blue→purple, green→teal, pink→rose)
- **Inner circle**: Solid background (card color), with the **count number in large bold text** centered inside
- **Close button**: Small `×` button (16px) positioned absolute at top-right of the circle, semi-transparent background
- **Title**: Small truncated label below the circle (like Instagram username under story)
- Tap circle → navigate to `/tasbeeh/:id`

### Dashboard.tsx — Layout Change

Replace the vertical `space-y-2` list with a horizontal flex row:
```
<div className="flex gap-4 overflow-x-auto scrollbar-none px-1">
  {counters.map(c => <TasbeehCard ... />)}
</div>
```

Remove the "Tasbeeh" section header — the circles are self-explanatory. Each card is a flex column: circle on top, title below.

### Gradient Assignment

Cycle through a palette based on index:
```typescript
const GRADIENTS = [
  ['#f59e0b', '#ef4444'],  // amber → red
  ['#8b5cf6', '#6366f1'],  // violet → indigo  
  ['#10b981', '#06b6d4'],  // emerald → cyan
  ['#ec4899', '#f43f5e'],  // pink → rose
];
```

Use SVG `<circle>` with `stroke` set via a `<linearGradient>` def for the ring, with `stroke-dashoffset` showing progress if target exists.

