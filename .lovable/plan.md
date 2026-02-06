
# Batch 4: Dashboard Reminders & Payment Tracking (Updated)

## Key Update: Hijri Context for Gregorian Dates

When displaying reminders with Gregorian calendar preference, we will show the Gregorian due date **with Hijri context**. This maintains the app's Hijri-first approach while supporting salary-aligned payment cycles.

### Display Format Examples

```text
Hijri Calendar Type:
  "Sabeel T0046A · ₹5,000 · Due 30 Shaban"

Gregorian Calendar Type (with Hijri context):
  "FMB Hub · ₹2,000 · Due Feb 25 (7 Shaban)"
```

---

## Implementation Plan

### 1. Calendar Utility Updates (`src/lib/calendarUtils.ts`)

Add functions to:
- Get current period based on calendar type
- Format due dates with optional Hijri context
- Calculate days remaining for both calendar types

```typescript
// New function for dual display
function formatDueDateWithContext(
  calendarType: CalendarType,
  dueDay: number,
  currentHijri: HijriDate,
  currentGregorian: Date
): string {
  if (calendarType === 'hijri') {
    return `${dueDay} ${getHijriMonthName(currentHijri.month)}`;
  }
  // Gregorian with Hijri context
  const gregorianMonth = GREGORIAN_MONTHS[currentGregorian.getMonth()];
  const hijriContext = `${currentHijri.day} ${getHijriMonthName(currentHijri.month)}`;
  return `${gregorianMonth} ${dueDay} (${hijriContext})`;
}
```

### 2. Payment Tracking Hook (`src/hooks/useDuePayments.ts`)

```typescript
interface UseDuePaymentsReturn {
  payments: DuePayment[];
  isLoading: boolean;
  markAsPaid: (input: DuePaymentInput) => Promise<void>;
  isPaymentMadeThisMonth: (
    dueType: DueType, 
    referenceId: string, 
    calendarType: CalendarType
  ) => boolean;
}
```

### 3. Reminders Hook (`src/hooks/useDueReminders.ts`)

```typescript
interface UseDueRemindersReturn {
  reminders: DueReminder[];
  activeCount: number;
  isLoading: boolean;
  markAsPaid: (reminder: DueReminder) => Promise<void>;
}
```

Logic flow:
1. Fetch all active Sabeels with nested FMB/Khumus/Zakat
2. For each due, check if reminder should trigger based on calendar type
3. Filter out dues already paid this month
4. Sort by urgency (overdue → due_today → upcoming)
5. Add Hijri context to Gregorian dates in display

### 4. DueRemindersCard Component (`src/components/dues/DueRemindersCard.tsx`)

**Design with Hijri Context:**

```text
┌─────────────────────────────────────────────────────────┐
│ 🔔 Dues Reminders                                  (3) │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ⚠️ Sabeel T0046A                      5 days  🌙   │ │
│ │    ₹5,000 · Due 30 Shaban                 [✓ Paid] │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🔴 FMB Hub                            Today  ☀️    │ │
│ │    ₹2,000 · Due Feb 28 (23 Shaban)        [✓ Paid] │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 💰 Khumus (Ahmed)                      7 days  🌙   │ │
│ │    ₹4,000 · Due 30 Shaban                 [✓ Paid] │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Monthly Progress: ████████░░░ 2/4 paid                 │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Urgency colors: amber (upcoming), red (due today/overdue), green (paid)
- Calendar badge: 🌙 for Hijri, ☀️ for Gregorian
- Gregorian dates show Hijri context in parentheses
- "Mark Paid" button records payment for current month
- Monthly progress bar at bottom
- Empty state when no active reminders

### 5. Dashboard Integration (`src/pages/Dashboard.tsx`)

Replace the "Dues & Khumus - Coming Soon" card with:
```tsx
<DueRemindersCard />
```

---

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/calendarUtils.ts` | Modify | Add `formatDueDateWithContext()`, `getCurrentPeriod()` |
| `src/hooks/useDuePayments.ts` | Create | CRUD for due_payments table |
| `src/hooks/useDueReminders.ts` | Create | Calculate reminders with dual calendar logic |
| `src/components/dues/DueRemindersCard.tsx` | Create | Dashboard reminder card with Hijri context |
| `src/pages/Dashboard.tsx` | Modify | Replace coming soon card with DueRemindersCard |

---

## Technical Notes

### Hijri Context Logic

For Gregorian dues, we always append the current Hijri date as context:
- Shows users where they are in the Islamic calendar
- Maintains spiritual awareness even for salary-aligned payments
- Consistent with app's Hijri-first design philosophy

### Payment Tracking

When marking paid:
1. Determine current month/year based on due's calendar_type
2. Create `due_payments` record with:
   - `calendar_type` matching the due
   - `due_month`/`due_year` for the current period
   - `amount_paid = amount_due`
   - `paid_at = now()`

### Reminder Visibility

A reminder shows when:
1. Due is active (`is_active = true`)
2. Current period is within start/end range
3. Reminder condition met (7 days before, last day, or custom day)
4. Not already paid for current month

