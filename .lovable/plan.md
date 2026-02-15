
# Add Annual Recurrence Option to Goal Creation

## Overview
The annual recurrence type is already fully supported in the backend logic (recurrence checking, descriptions, types) but is missing from the user-facing goal creation form. The admin goal form already has this UI, so we just need to add it to the `RecurrenceSelector` component.

## Changes

### File: `src/components/goals/RecurrenceSelector.tsx`
- Add "Annual" as a new `SelectItem` in the "Repeats" dropdown (after "One-time")
- Add a new UI section (visible when `recurrenceType === 'annual'`) with:
  - A calendar type selector (Hijri / Gregorian) -- defaulting to Hijri
  - A month selector dropdown (12 Hijri month names or 12 Gregorian month names, depending on calendar choice)
  - A day input (number, 1-30)
- Wire up handlers to call `onRecurrencePatternChange` with `{ type: 'annual', annualMonth, monthlyDay, calendarType }`
- Add Hijri month names array: Muharram, Safar, Rabi I, Rabi II, Jumada I, Jumada II, Rajab, Shabaan, Ramadan, Shawwal, Dhul Qadah, Dhul Hijjah
- Gregorian month names: Jan through Dec

### Technical Details
- The `RecurrencePattern` type already has `type: 'annual'`, `annualMonth`, `monthlyDay`, and `calendarType` fields
- The `isAnnualDue()` function in `recurrence.ts` already handles the logic
- The `getRecurrenceDescription()` function already formats annual goals
- No database or backend changes needed -- just the UI selector

This mirrors the existing annual UI in `src/components/elan/AdminGoalForm.tsx` but integrated into the shared `RecurrenceSelector` component.
