

## Fix: Vertical text alignment in pill badges and tag buttons

Two issues visible in the screenshot:

### 1. GoalCard badges (recurrence + tag) — `py-0` removes vertical padding, causing text to sit top-heavy

**File:** `src/components/goals/GoalCard.tsx`
- Lines 134, 138, 143: Change `py-0` to `py-0.5` on all Badge components to give text proper vertical centering within the pill shape.

### 2. GoalFormSheet tag pills — text appears top-heavy in the pill buttons

**File:** `src/components/goals/GoalFormSheet.tsx`  
- Line ~199: The tag buttons use `px-3 py-1` — change to `px-3 py-1.5` for better vertical centering, and add `leading-none` to tighten line-height so text sits centered.

### 3. GoalCard items-start alignment
The card uses `items-start` (line 86), which pushes the drag handle and checkbox to use `mt-0.5` for manual alignment. This is fine for multi-line content but the `mt-0.5` on the drag handle (line 96) may need adjusting to `mt-1` to better center with the title text baseline.

