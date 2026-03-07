

## Group Today's Goals by Tags + Tag Order Preferences

### Overview
Group goals on the Today page by their tag, with overdue goals placed at the top of their respective tag group (not in a separate section). Add a Profile sub-section for reordering tag groups via drag-and-drop.

### Database
Add `tag_sort_order` JSONB column to `user_preferences`:
```sql
ALTER TABLE user_preferences ADD COLUMN tag_sort_order jsonb DEFAULT '[]'::jsonb;
```

### Changes

**1. `src/hooks/useUserPreferences.ts`**
- Read `tag_sort_order` from the query result, expose as `tagSortOrder: string[]`
- Add `setTagSortOrder` mutation (upsert, same pattern as `setGoalSortOrder`)

**2. `src/components/goals/TodaysGoals.tsx`** — Major refactor:
- Accept new props: `tags` (from `useTags`) and `tagSortOrder` (from `useUserPreferences`)
- Remove the separate overdue goals rendering block at the top
- Group all goals (today + overdue) by tag into a `Map<string, Array<GoalWithStatus | OverdueGoal>>`
- For each tag group: render overdue goals first (red border styling), then today's goals
- Render groups in the user's `tagSortOrder`; tags not in the order appended in admin sort order
- Untagged goals (tag is null) grouped under `"__untagged__"`, rendered with label "Other"
- Tag group header: small uppercase text label (e.g., `QURAN`, `DUA`)
- Hide tag groups that have zero goals (no today goals AND no overdue goals)
- Overdue goals within a tag group keep their red border and overdue date label

**3. `src/pages/Dashboard.tsx`**
- Import `useTags` and pass `tags` + `tagSortOrder` to `TodaysGoals`
- Pass overdue goals with their tag info so they can be grouped

**4. New: `src/components/profile/TagOrderPreferences.tsx`**
- Drag-and-drop reorderable list using `@dnd-kit/sortable`
- Shows all active tags + an "Unlisted" item (for `__untagged__`)
- Each row: drag handle + tag label
- On reorder, calls `setTagSortOrder`
- Default order: admin tag sort order, "Unlisted" last

**5. `src/pages/Profile.tsx`**
- Add `'today-view'` to `ProfileSection` type
- Add "Today View" menu item (with `ViewGrid` or `Archery` icon)
- Render `TagOrderPreferences` in the `'today-view'` sub-section

**6. `src/integrations/supabase/types.ts`**
- Add `tag_sort_order` to `user_preferences` table type

### Grouping Logic (TodaysGoals)
```text
tagSortOrder = ['quran', 'dua', 'tasbeeh', '__untagged__']

For each tag in order:
  ┌─ TAG HEADER (e.g. "QURAN") ─────────────┐
  │ [overdue] Goal A — overdue from Yesterday │
  │ [overdue] Goal B — overdue from 3 Mar     │
  │ [ ] Goal C — due today                    │
  │ [✓] Goal D — completed today              │
  └──────────────────────────────────────────┘

Tags with 0 goals → hidden entirely
```

