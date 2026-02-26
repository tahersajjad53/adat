

## Current State

Goal descriptions appear in three places with inconsistent and small sizing:

| Location | Current size | Line clamp |
|----------|-------------|------------|
| `TodaysGoals.tsx` (today's + dynamic goals) | `text-sm` (14px) | `line-clamp-1` |
| `GoalCard.tsx` (goals page) | `text-xs` (12px) for regular, `text-sm` for dynamic | `line-clamp-1` |
| `DynamicGoalDetailSheet.tsx` (detail view) | `text-base` (16px) | None |

For Arabic text with diacritics (tashkeel), `text-sm` and especially `text-xs` are too small — the delicate marks above/below characters become illegible, particularly for elderly users.

## Proposed Changes

### Size recommendations

- **Goal titles** (currently `text-base` / 16px): Keep as-is — already legible.
- **Goal descriptions on Today page** (`TodaysGoals.tsx`): Bump from `text-sm` (14px) → `text-base` (16px). Remove `line-clamp-1` and use `line-clamp-2` to show more of the description without unbounded expansion.
- **Goal descriptions on Goals page** (`GoalCard.tsx`): Bump from `text-xs`/`text-sm` → `text-sm` (14px) uniformly. Change `line-clamp-1` → `line-clamp-2`.
- **Detail sheet** (`DynamicGoalDetailSheet.tsx`): Already `text-base` — no change needed.

### Spacing improvement

Add slightly more vertical gap between title and description (`mt-1` instead of `mt-0.5`) for better visual separation, especially when Arabic text has ascenders/descenders from diacritics.

### Files changed

| File | Change |
|------|--------|
| `src/components/goals/TodaysGoals.tsx` | Lines 208, 288: `text-sm` → `text-base`, `line-clamp-1` → `line-clamp-2`, `mt-0.5` → `mt-1` |
| `src/components/goals/GoalCard.tsx` | Line 142: unify to `text-sm`, `line-clamp-1` → `line-clamp-2`, `mt-0.5` → `mt-1` |

