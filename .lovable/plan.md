

# Fix End Date Being Exclusive Instead of Inclusive

## Problem
When a user sets a goal's end date to Feb 16, the goal doesn't appear on Feb 16. This happens because of a timezone mismatch in date comparison:

- `end_date` is stored as a date string like `"2025-02-16"`, and `new Date("2025-02-16")` creates a Date at **UTC midnight** (00:00:00 UTC).
- `gregorianDate` comes from `new Date()` which includes the **local time** -- e.g., 10:00 AM local time.
- On the end date itself, the local-time Date is "greater than" the UTC-midnight Date, so the goal is excluded.

The same bug also affects `start_date` -- a goal could appear a day early depending on timezone.

## Solution
Normalize both sides of the comparison to date-only (strip time) before comparing.

## Technical Details

### File: `src/lib/recurrence.ts` (lines 28-35)

Replace the current start/end date comparison with normalized date-only comparisons:

```typescript
// Normalize to date-only strings for comparison (avoid timezone issues)
const gregDateStr = `${gregorianDate.getFullYear()}-${String(gregorianDate.getMonth() + 1).padStart(2, '0')}-${String(gregorianDate.getDate()).padStart(2, '0')}`;

if (gregDateStr < goal.start_date) return false;

if (goal.end_date) {
  if (gregDateStr > goal.end_date) return false;
}
```

This compares date strings directly (YYYY-MM-DD format), completely avoiding any timezone or time-of-day issues. Since `start_date` and `end_date` are already stored as `YYYY-MM-DD` strings, this is a clean and reliable comparison.

