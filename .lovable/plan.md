

## Add Swipe Animation to WeekRow

### Approach
Use `useState` to track a slide direction, and apply a CSS transition (translateX) when the week changes. On swipe trigger, set a slide-out class in the swipe direction, then after a short delay update the week data and apply a slide-in from the opposite side.

### Changes — `src/components/calendar/WeekRow.tsx`

1. Add `useState<'left' | 'right' | null>` for `slideDirection`
2. Wrap the day buttons in an inner `div` with `transition-transform duration-200` and conditional `translate-x-full` / `-translate-x-full` / `translate-x-0`
3. On swipe detection, instead of immediately calling `onShiftWeek`:
   - Set `slideDirection` to animate the current week out
   - After ~200ms (`setTimeout`), call `onShiftWeek` and set the opposite entry direction
   - After another frame, reset to `null` (centered) to animate in
4. Use `overflow-hidden` on the outer container to clip the sliding content

### Animation flow
- Swipe left → current row slides out to the left (`-translate-x-full opacity-0`) → new week enters from right (`translate-x-full` → `translate-x-0`)
- Swipe right → mirror

### Files
- `src/components/calendar/WeekRow.tsx` — only file changed

