

## Add Tag Selection to Elan (Admin Goal) Create/Edit

### Database
Add `tag text` nullable column to `admin_goals` table via migration. Matches the pattern used in the `goals` table.

### Types (`src/types/adminGoals.ts`)
Add `tag?: string | null` to both `AdminGoal` and `AdminGoalInput`.

### Form (`src/components/elan/AdminGoalForm.tsx`)
- Import `useTags` hook
- Add `tag` state (`string | null`)
- Add pill-style tag selector (same UI as `GoalFormSheet` lines 207-222) after the title input
- Include `tag` in the submitted data
- Populate `tag` from goal on edit, reset on create

### Hook (`src/hooks/useAdminGoals.ts`)
- Include `tag` in the `insert` call within `createMutation`
- The `update` call already passes the full `input` object, so it will handle `tag` automatically

### Card (`src/components/elan/AdminGoalCard.tsx`)
- Import `useTags` to resolve slug to label
- Display tag as a `Badge` next to existing badges when present

### Files changed (5)
| File | Change |
|---|---|
| Migration SQL | `ALTER TABLE admin_goals ADD COLUMN tag text` |
| `src/types/adminGoals.ts` | Add `tag` field to interfaces |
| `src/components/elan/AdminGoalForm.tsx` | Add tag pill selector UI + state |
| `src/hooks/useAdminGoals.ts` | Include `tag` in insert payload |
| `src/components/elan/AdminGoalCard.tsx` | Show tag badge |

