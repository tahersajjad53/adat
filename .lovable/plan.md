

## Replace Arrow Buttons with Swipe Gesture on WeekRow

### Changes — `src/components/calendar/WeekRow.tsx`

**Remove**: Arrow buttons (`NavArrowLeft`/`NavArrowRight`), `Button` import, `iconoir-react` import.

**Add**: Touch swipe detection using `onTouchStart`/`onTouchEnd` handlers on the row container. Track start X position; on end, if delta > 50px, call `onShiftWeek(-1)` (swipe right) or `onShiftWeek(1)` (swipe left). No external library needed — simple `useRef` for touch start coordinates.

**Layout**: The outer `div` drops `gap-1` and the arrow buttons. The day buttons container changes from `flex-1` to full width, giving each day cell equal space across the entire row.

### Implementation sketch

```tsx
const touchStartX = useRef(0);

const onTouchStart = (e: React.TouchEvent) => {
  touchStartX.current = e.touches[0].clientX;
};

const onTouchEnd = (e: React.TouchEvent) => {
  const delta = e.changedTouches[0].clientX - touchStartX.current;
  if (Math.abs(delta) > 50) {
    onShiftWeek(delta > 0 ? -1 : 1);
  }
};
```

Container becomes:
```tsx
<div className="flex w-full justify-between" onTouchStart={...} onTouchEnd={...}>
```

Each day cell gets `flex-1` so they distribute evenly across the full width.

### Files
- `src/components/calendar/WeekRow.tsx` — only file changed

