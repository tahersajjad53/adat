

## Feasibility: Goal Tags

### Verdict: Fully feasible, straightforward to implement.

### What's needed

**1. Database** — Add a `tag` text column to the `goals` table (nullable, default null). No new table needed since tags are from a fixed preset list, not user-defined.

```sql
ALTER TABLE goals ADD COLUMN tag text DEFAULT NULL;
```

**2. Types** — Add a `GoalTag` type and `tag` field to `Goal` and `GoalInput`:

```typescript
export type GoalTag = 'quran' | 'dua' | 'tasbeeh' | 'sadakah' | 'nazrul_maqam';
```

**3. Goal Form** — Add a row of selectable pill/chip buttons (similar to the existing day-of-week picker pattern) below the title or description field. Single-select, optional. Each pill shows the tag name; selected pill gets accent styling.

**4. Hook (`useGoals.ts`)** — Pass `tag` through in create/update mutations. No other hook changes needed.

**5. Goal Card** — Display the tag as a small badge next to the recurrence badge (e.g., `<Badge variant="secondary">Quran</Badge>`).

**6. Future dashboard use** — With tags stored, you can later query `goal_completions` joined with `goals.tag` to build category-level analytics (completion rates by tag, streaks per category, etc.). No additional schema needed for that.

### Complexity
- 1 migration (add column)
- 4 file edits (types, form, hook, card)
- ~1 hour of implementation effort
- Zero risk to existing data — nullable column, no breaking changes

