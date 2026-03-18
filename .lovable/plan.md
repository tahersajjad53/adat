

## Remove all `(supabase as any)` casts

All 8 files cast `supabase` to `any` before calling `.from()` or `.rpc()`, but every table and function they reference (`admin_goals`, `admin_goal_completions`, `tags`, `user_preferences`, `user_roles`, `get_admin_users`) is already defined in the generated `types.ts`. The casts are unnecessary and hide type errors.

### Changes

Replace every `(supabase as any)` with `supabase` in these 8 files:

| File | Occurrences |
|---|---|
| `src/hooks/useAdminGoals.ts` | 4 |
| `src/hooks/useAdminGoalCompletions.ts` | 3 |
| `src/hooks/useAdminTags.ts` | 4 |
| `src/hooks/useDynamicGoals.ts` | 1 |
| `src/hooks/useTags.ts` | 1 |
| `src/hooks/useUserPreferences.ts` | 4 |
| `src/hooks/useUserRole.ts` | 1 |
| `src/pages/admin/AdminUsers.tsx` | 1 |

Each is a straightforward find-and-replace of `(supabase as any)` → `supabase`. No logic changes. This restores full TypeScript type-checking on all Supabase queries so schema mismatches and typos are caught at build time.

