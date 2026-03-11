

## Reposition Tasbeeh Counter & Thicken Radial Ring

### Changes in `src/pages/TasbeehCounter.tsx`

1. **Bottom-heavy positioning**: Change the tap area container from `justify-center` with `minHeight: 50vh` to use `justify-end` with `pb-[15vh]` and `flex-1` so the circle sits below center, closer to thumb reach.

2. **Thicker radial ring**: Increase `strokeWidth` from `10` to `18` (and adjust `radius` accordingly so the circle stays the same outer size).

### Specific edits

- Line 68: `strokeWidth = 10` → `strokeWidth = 18`
- Lines 91-93: Change container to `className="flex flex-col items-center justify-end pb-[15vh] select-none flex-1"` and remove the `style={{ minHeight: '50vh' }}`
- The outer container `div` (line 89 area) should also get `flex min-h-0` or similar to allow flex-1 to work, or simply use `min-h-[calc(100vh-8rem)]` on the tap area to fill available space.

