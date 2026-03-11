

## Align TasbeehFormSheet UI with GoalFormSheet

The Tasbeeh form currently uses a basic layout with `Label` + `Input` pairs, a single action button on mobile, and no subtitle. The Goal form uses a more polished pattern: title + description in the header, inline title input (large, no label), a two-button footer (Cancel + action), and `SheetDescription`/`DialogDescription`.

### Changes to `src/components/tasbeeh/TasbeehFormSheet.tsx`

1. **Add subtitle** — Import `SheetDescription` and `DialogDescription`, add "Create a new tasbeeh to track" (new) or "Update your tasbeeh details" (edit) below the title, matching the Goal form's pattern.

2. **Remove labels, use inline inputs** — Remove the `Label` components. Make the name input large (`h-11 text-lg font-medium`) with just a placeholder, matching the Goal form's title input style. Keep the target count input as a regular input but without its label — use placeholder text only.

3. **Two-button footer on mobile** — Change the mobile footer from a single full-width button to match the Goal form's footer: Cancel (outline) + Create/Update side by side with `flex gap-3`, both `flex-1`.

4. **Add `onOpenAutoFocus` prevention** — Add `onOpenAutoFocus={(e) => e.preventDefault()}` to `SheetContent` to match the Goal form behavior.

5. **Add `max-h-[85dvh] flex flex-col`** to mobile `SheetContent` for consistency.

