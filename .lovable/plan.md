

# Update Elan Admin Goal CRUD to Match User Goal UX

## Overview

The admin goal form (`AdminGoalForm.tsx`) currently uses basic Select dropdowns for recurrence configuration, while the user goal form uses the polished `DateRecurrenceTimePopover` (with date presets, calendar picker, time selector, and recurrence presets). The admin card is also plain compared to the user's `GoalCard`. This plan brings the admin experience in line with the user experience.

## Changes

### 1. Modernize AdminGoalForm to use DateRecurrenceTimePopover

**File: `src/components/elan/AdminGoalForm.tsx`**

Replace the manual recurrence Select dropdowns (Daily/Weekly/Custom/One-time/Annual) and their conditional sub-fields (day pickers, interval inputs, calendar type selects, etc.) with the same `DateRecurrenceTimePopover` component used in the user form.

- Remove all recurrence-specific state: `customPatternType`, `interval`, `intervalUnit`, `monthlyDay`, `calendarType`, `annualMonth`, `annualDay`, `annualCalendar` -- replace with a single `recurrencePattern` state
- Import and use `DateRecurrenceTimePopover` from `@/components/goals/DateRecurrenceTimePopover`
- Keep admin-specific fields: Published toggle, Start date, End date toggle
- Default new admin goals to one-time with today's date (matching user form)
- Add the `preferred_time` field support (admin_goals table already has this column)
- Wire up the mobile sheet to use `max-h-[85vh] flex flex-col` layout (matching the user form fix)

### 2. Improve AdminGoalCard display

**File: `src/components/elan/AdminGoalCard.tsx`**

- Use `getRecurrenceDescription` from `@/lib/recurrence` for the recurrence badge instead of raw `goal.recurrence_type` -- this will show labels like "Daily", "29 Shaban", "21 Feb" etc. matching user cards
- Pass the current Hijri date via `useCalendar` to `getRecurrenceDescription`
- Show `preferred_time` if set

### 3. Update AdminGoal type for preferred_time

**File: `src/types/adminGoals.ts`**

Add `preferred_time?: string | null` to the `AdminGoal` interface (column already exists in DB).
Add `preferred_time?: string | null` to `AdminGoalInput`.

### 4. Update useAdminGoals hook

**File: `src/hooks/useAdminGoals.ts`**

Pass `preferred_time` through in the create mutation.

---

## Suggested Admin-Level Functionalities

Here are some admin features that would be useful for creating dynamic goals:

1. **Duplicate Goal** -- Add a "Duplicate" option in the AdminGoalCard dropdown to quickly clone an existing goal with a different date or title. Useful for seasonal goals that repeat annually with slight variations.

2. **Bulk Publish/Unpublish** -- Add a "Select All" checkbox or multi-select mode to publish or unpublish multiple goals at once, useful during seasonal transitions (e.g., publishing all Ramadan goals at once).

3. **Preview as User** -- A button that shows how the dynamic goal will appear to end users in their goal list, including the recurrence label and description rendering.

4. **Schedule Publishing** -- Set a future publish date so goals auto-publish at the right time (e.g., schedule Ramadan goals to appear on 1st Ramadan).

---

## Technical Details

### AdminGoalForm.tsx -- Key structural change

The form content section will change from ~130 lines of manual recurrence selects to:

```text
Title input (unchanged)
Description textarea (unchanged)
DateRecurrenceTimePopover (replaces ~80 lines of recurrence selects)
Published toggle (unchanged)
Start date (handled by popover now)
End date toggle (unchanged)
```

### AdminGoalCard.tsx -- Recurrence label change

```typescript
// Before:
<Badge variant="secondary">{goal.recurrence_type}</Badge>

// After:
const { currentDate } = useCalendar();
const label = getRecurrenceDescription(goal as any, currentDate?.hijri);
<Badge variant="secondary">{label}</Badge>
```

### Files changed

| File | Change |
|------|--------|
| `src/types/adminGoals.ts` | Add `preferred_time` to both interfaces |
| `src/components/elan/AdminGoalForm.tsx` | Replace manual recurrence UI with `DateRecurrenceTimePopover`; fix mobile sheet layout |
| `src/components/elan/AdminGoalCard.tsx` | Use `getRecurrenceDescription` for labels; show preferred time |
| `src/hooks/useAdminGoals.ts` | Pass `preferred_time` in create mutation |

