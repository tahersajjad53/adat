

# Simplify Missed Namaz Filter Labels

## Changes

### `src/components/namaz/MissedPrayersList.tsx`

1. **Rename "unfulfilled" to "qaza"** -- change the label from `"{count} unfulfilled"` to `"{count} qaza"`
2. **Remove the fulfilled count indicator** -- delete the `{fulfilledCount > 0 && ...}` span entirely
3. **Remove the filter toggle button** -- delete the `<Button>` that toggles `showFulfilled` state
4. **Remove the `showFulfilled` state** -- since fulfilled prayers are always shown, the `useState` and filtering logic can be removed; `filteredPrayers` simply becomes `prayers`
5. **Clean up unused imports** -- remove `Button` and `Filter` imports since the toggle is gone

