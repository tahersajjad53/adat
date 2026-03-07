

## Add Tag Filter Pills to Goals Page

### Overview
Add a horizontally scrollable row of tag filter pills below the Goals title/subtitle. Default selection is "All". Selecting a tag filters the goal list to only show goals with that tag.

### Changes

**`src/pages/Goals.tsx`**
- Import `useTags` hook
- Add `activeFilter` state: `string | null` (null = "All")
- Below the title/subtitle block, render a row of pill buttons: "All" + one per active tag + "Unlisted" (for untagged goals)
- Style: horizontally scrollable `flex` row with `gap-2`, `overflow-x-auto`, pills use a compact rounded style (e.g. `rounded-full px-3 py-1 text-sm`), active pill gets `bg-primary text-primary-foreground`, inactive gets `bg-secondary text-secondary-foreground`
- Filter `mergedGoals` by `activeFilter` before passing to `GoalList`:
  - `null` → show all (no filter)
  - `'__untagged__'` → show goals where `tag` is null/undefined
  - Otherwise → show goals where `tag === activeFilter`
- The empty state should reflect the filter (e.g. if filtering by "Quran" and no Quran goals exist, show appropriate message)

### UI Layout
```text
Goals
Rooted in Niyat, completed with Ikhlas.

[All] [Quran] [Dua] [Tasbeeh] [Sadakah] [Unlisted]

── goal cards ──
```

