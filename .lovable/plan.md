

## Plan: Hide Completed Goals + Improve Completed Goals Page

### 1. Hide completed goals on the Goals page

**File: `src/pages/Goals.tsx`**
- Filter `mergedGoals` to exclude goals where `isCompleted === true` before rendering in `GoalList`.
- This applies to both user goals and dynamic goals.

### 2. Show Hijri date alongside Gregorian date on Completed Goals page

**File: `src/hooks/useCompletedGoalsHistory.ts`**
- The `completion_date` field already stores the Hijri date (as YYYY-MM-DD). Include it in the mapped output (already present as `completion_date`).

**File: `src/pages/CompletedGoals.tsx`**
- In the date header, append the Hijri date from `completion_date` using the `HIJRI_MONTHS` data from `src/lib/hijri.ts` to format it as "Day MonthName Year AH" (e.g. "3 Moharram 1447 AH").
- Format: `"Wednesday, 2 July 2025 · 3 Moharram 1447 AH"`

### 3. Add delete button per completed task

**File: `src/hooks/useCompletedGoalsHistory.ts`**
- Add a `deleteCompletion(id: string)` mutation that deletes from `goal_completions` by id, then invalidates the query.

**File: `src/pages/CompletedGoals.tsx`**
- Add a trash icon button on each completion entry row.
- Wire it to `deleteCompletion`.

### 4. Add "Clear All" button with confirmation

**File: `src/hooks/useCompletedGoalsHistory.ts`**
- Add a `clearAllCompletions()` mutation that deletes all `goal_completions` for the current user.

**File: `src/pages/CompletedGoals.tsx`**
- Add a "Clear All" button in the header row opposite the "Completed" title.
- Wrap in an `AlertDialog` for confirmation before executing.

### Files changed

| File | Change |
|------|--------|
| `src/pages/Goals.tsx` | Filter out completed goals from `mergedGoals` |
| `src/hooks/useCompletedGoalsHistory.ts` | Add `deleteCompletion` and `clearAllCompletions` mutations |
| `src/pages/CompletedGoals.tsx` | Add Hijri date display, per-item delete, "Clear All" with confirmation dialog |

