

## Remove Circle Icon from Goal Form Title

### Changes in `src/components/goals/GoalFormSheet.tsx`

1. **Remove the `Circle` icon** from line 188
2. **Remove the `gap-3`** from the flex container (line 187) since there's no icon anymore
3. **Remove `pl-8`** from the recurrence summary (line 205) and tag selector (line 208) since they no longer need to align with the icon offset

This gives the title input full width and more visual prominence.

