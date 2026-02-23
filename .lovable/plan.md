

# Improve Recurrence Labels in Goal Cards

## Changes

All changes are in **`src/lib/recurrence.ts`**, specifically in `getRecurrenceDescription` and `getCustomDescription`.

### 1. One-time label: "21 Feb" instead of "One-time (21/02/2026)"

Update the `one-time` case (lines 207-217) to format the date as `d MMM` (e.g., "21 Feb") and drop the "One-time" prefix. Keep "Today" for same-day goals.

### 2. Monthly Hijri label: "29 Shaban" instead of "29th of each month (Hijri)"

The function currently doesn't receive the current Hijri date, so it can't resolve the month name. The fix:

- Add an optional `hijriDate?: HijriDate` parameter to `getRecurrenceDescription`
- For monthly Hijri goals, if `hijriDate` is provided, show `"{day} {hijriDate.monthName}"` (e.g., "29 Shaban")
- Fallback to `"{ordinal(day)} monthly"` if no hijri date provided
- For monthly Gregorian goals, show `"{ordinal(day)} monthly"` (compact, no "(Gregorian)" suffix)
- Pass this through from `getCustomDescription`

### 3. Update callers to pass Hijri date (GoalCard, DynamicGoalDetailSheet)

Both callers need to obtain the current Hijri date from `CalendarContext` and pass it to `getRecurrenceDescription`.

---

## Technical Details

### `src/lib/recurrence.ts`

**`getRecurrenceDescription` signature change:**
```typescript
export function getRecurrenceDescription(
  goal: RecurrenceCheckable,
  hijriDate?: HijriDate
): string
```

**One-time case (line 215):**
```typescript
case 'one-time':
  if (goal.due_date) {
    const date = new Date(goal.due_date + 'T00:00:00');
    const now = new Date();
    const isToday = date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();
    if (isToday) return 'Today';
    const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
    return `${date.getDate()} ${monthShort}`;
  }
  return 'One-time';
```

**Monthly Hijri case in `getCustomDescription` (line 253-256):**
```typescript
case 'monthly':
  if (!pattern.monthlyDay) return 'Monthly';
  if ((pattern.calendarType || 'hijri') === 'hijri' && hijriDate) {
    return `${pattern.monthlyDay} ${hijriDate.monthName}`;
  }
  return `${ordinal(pattern.monthlyDay)} monthly`;
```

### `src/components/goals/GoalCard.tsx`

- Import `useCalendar` from `@/contexts/CalendarContext`
- Get `dualDate` from `useCalendar()`
- Pass `dualDate?.hijri` to `getRecurrenceDescription(goal, dualDate?.hijri)`

### `src/components/goals/DynamicGoalDetailSheet.tsx`

- Same pattern: import `useCalendar`, pass hijri date to `getRecurrenceDescription`

### Files changed

| File | Change |
|------|--------|
| `src/lib/recurrence.ts` | Update `getRecurrenceDescription` and `getCustomDescription` to accept optional hijri date; improve one-time and monthly labels |
| `src/components/goals/GoalCard.tsx` | Pass current hijri date to `getRecurrenceDescription` |
| `src/components/goals/DynamicGoalDetailSheet.tsx` | Pass current hijri date to `getRecurrenceDescription` |

