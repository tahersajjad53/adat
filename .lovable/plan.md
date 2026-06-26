## Feasibility: User-Created Goal Tags

### Current setup
- `tags` table is a single global, admin-curated list (label, slug, sort_order, is_active). RLS lets all authenticated users read active tags; only admins can insert/update/delete.
- Each goal stores a single `tag` slug (string) on `goals.tag` (nullable). The Today page groups by tag, and Profile lets users reorder tag groups via `user_preferences.tag_sort_order`.
- The Goal form already renders tags from the DB (`useTags`) as selectable pills, so adding "user tags" is mostly additive.

### Verdict
**Feasible and low-risk**, with a few decisions to make. The cleanest path is to extend the existing `tags` table with an optional `user_id` (null = global/admin tag, set = personal tag) and let users create/edit/delete their own rows. The Today page grouping, sort-order preference, and goal form pill UI all continue to work unchanged because they key off slug/label.

### Key decisions to confirm with you
1. **Scope of a user tag** — Private to the user (recommended) vs. shared/community. Private is simpler and avoids moderation.
2. **Where users create tags** — Two reasonable options:
   - Inline in the Goal form (an "+ Add tag" pill that opens a tiny input). Fastest, feels native.
   - A dedicated "Manage tags" screen under Profile (mirrors Tag Order page). Better for rename/delete.
   We can do both; inline create + manage screen for edit/delete is the typical pattern.
3. **Limits** — Cap per user (e.g., 15 custom tags), max label length (e.g., 24 chars), and disallow duplicate labels per user. Prevents clutter and abuse.
4. **Slug collisions** — Global admin tags use clean slugs (`quran`). User tags should be namespaced (e.g., `u:<uuid>` or `user:<userId>:<slug>`) so they can never collide with admin slugs, and admins renaming a global tag won't clobber a personal one.
5. **Deletion behaviour** — If a user deletes a tag still attached to goals, do we (a) null the goal's tag, (b) block deletion, or (c) prompt to reassign? Option (a) is simplest.
6. **Visibility of admin tags** — Keep showing admin tags alongside personal ones in the pill picker, with personal tags listed after (or visually distinguished)?

### Technical outline (for reference, not for you to action)
- **Schema:** add nullable `user_id uuid references auth.users` and `is_global boolean generated` (or just rely on `user_id IS NULL`) to `tags`. Replace the UNIQUE on `slug` with a partial unique: `(slug) WHERE user_id IS NULL` + `(user_id, slug) WHERE user_id IS NOT NULL`. Add a label length check.
- **RLS:** keep existing admin policies; add "users can select their own tags", "users can insert/update/delete rows where `user_id = auth.uid()`".
- **Hooks:** `useTags` returns merged list (global + own); add `useUserTags` with create/rename/delete mutations.
- **UI:** add `+ New tag` pill in `GoalFormSheet`; add a "Manage tags" entry in Profile (reuse `TagOrderPreferences` styling) for rename/delete.
- **Sort order:** existing `tag_sort_order` keeps working since it's keyed on slug; new user-tag slugs simply append to the saved order.

### Out of scope
- Multi-tag per goal (still single `goals.tag`).
- Sharing/community tags or merging.
- Backfilling old hardcoded `GoalTag` enum in `src/types/goals.ts` — already loosely typed in practice since `tag` is just a string on the form.

Want me to proceed with the recommended path (private user tags, inline create in the goal form + a manage screen in Profile, soft-null on delete)? If so, confirm the open decisions above (especially #3 limits and #6 ordering) and I'll write the build plan.