

# Fix Dropdown/Date Fields Exceeding Margins

## Problem
The `SelectTrigger` component (used for dropdowns like "Repeats", pattern selectors, and month/year pickers in FMBHub) still uses `rounded-md`, while the `Input` component was updated to `rounded-full`. This inconsistency causes the select dropdowns to look different from other inputs and may cause visual overflow on mobile.

Native date inputs (`<input type="date">`) with `rounded-full` can also overflow due to browser-rendered date picker controls.

## Changes

### 1. SelectTrigger (`src/components/ui/select.tsx`)
- Update `rounded-md` to `rounded-full` and `px-3` to `px-4` on the trigger element (line 20) to match the Input component styling.

### 2. Date Inputs (`src/components/goals/GoalFormSheet.tsx`)
- Add `className="overflow-hidden"` to the date-type Input elements for start date and end date, ensuring native browser controls stay within bounds.

## Scope
These are base-level UI primitive changes, so all pages using Select dropdowns (Goals, Dues/FMBHub, Dues/Khumus, RecurrenceSelector, Profile) will automatically get the consistent rounded styling.

