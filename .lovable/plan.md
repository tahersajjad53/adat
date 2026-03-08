

## Add Spacing and Top-Align Description Icon

### Changes

1. **`src/components/goals/GoalFormSheet.tsx`**
   - Increase `space-y-2` on the form to `space-y-4` for more breathing room between sections
   - Increase `space-y-1` on the title+tags block to `space-y-3` for padding between title and tags
   - Pass `className="items-start pt-2"` to the description's `CondensedAttributeRow` to top-align the icon with the textarea

2. **`src/components/goals/CondensedAttributeRow.tsx`** — No changes needed; it already accepts `className` which merges via `cn()`, so `items-start` will override `items-center`.

