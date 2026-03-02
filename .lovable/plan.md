

## Plan: Make TimeOfDayCard tappable to navigate to Namaz page

**File: `src/pages/Dashboard.tsx`**

Wrap the `TimeOfDayCard` content in a click handler that navigates to `/namaz`, but stop propagation on the Checkbox so it continues to toggle the prayer without navigating.

1. Import `useNavigate` from `react-router-dom` (likely already imported)
2. Add `onClick={() => navigate('/namaz')}` and `cursor-pointer` to the `TimeOfDayCard` wrapper
3. Add `e.stopPropagation()` on the Checkbox's `onCheckedChange` and its parent container to prevent navigation when tapping the checkbox

Specifically:
- Wrap `TimeOfDayCard` in a `<div onClick={() => navigate('/namaz')} className="cursor-pointer">`
- On the checkbox container div (line 195), add `onClick={(e) => e.stopPropagation()}` so checkbox taps don't trigger navigation

