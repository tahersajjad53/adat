

## Two Changes: Hide Paid Dues from Today Feed + Payment History per Sabeel

### Change 1: Hide Paid Dues from Today Feed (Next Day)

**Problem**: Currently in `useDueReminders.ts`, the condition `if (shouldShow || isPaid)` keeps paid dues visible indefinitely. Once marked as paid, they should only remain visible on their due day, not carry over to the next day.

**Solution**: In `src/hooks/useDueReminders.ts`, change the filter logic so that paid items are excluded from the reminders list entirely. The reminder should only appear when `shouldShow` is true (meaning it's within the reminder window). Once paid, it no longer needs to be displayed as a reminder -- the checkmark state is already derived from `isPaymentMadeThisMonth`, so if the reminder happens to show on the due day and is already paid, it will appear checked. But once the day passes and `shouldShowReminder` returns false, it disappears.

**File**: `src/hooks/useDueReminders.ts`
- Line 100: Change `if (shouldShow || isPaid)` to `if (shouldShow && !isPaid)` for sabeel
- Line 157: Same change for FMB Hub
- Line 197: Same change for Khumus
- Line 238: Same change for Zakat
- Update `paidCount`/`totalCount` logic accordingly since paid items are no longer in the list

### Change 2: Payment History per Sabeel

**New component**: `src/components/dues/PaymentHistory.tsx`
- A sheet/dialog that shows a paginated list of all `due_payments` belonging to a specific Sabeel
- Queries `due_payments` where `reference_id` matches the sabeel ID, or any of its child entity IDs (fmb_hub, khumus entries, zakat entries)
- Displays 10 items at a time with a "Show More" button to load the next 10
- Each item shows: due type label (Sabeel/FMB Hub/Khumus/Zakat), person name where applicable, amount paid, and the payment date

**Updated component**: `src/components/dues/SabeelCard.tsx`
- Add a "History" button inside the collapsible content area (below the Zakat section)
- Clicking it opens the PaymentHistory sheet for that sabeel

**Updated component**: `src/components/dues/DuesSection.tsx`
- Add state management for the history sheet (open/close, selected sabeel ID)

### Technical Details

**PaymentHistory.tsx structure**:
- Uses a Sheet (bottom sheet on mobile) triggered from SabeelCard
- Fetches from `due_payments` table using Supabase client
- Filter: `reference_id` IN (sabeel.id, sabeel.fmb_hub?.id, ...sabeel.khumus_list.map(k => k.id), ...sabeel.zakats.map(z => z.id))
- Order by `paid_at` descending
- Pagination via `range(offset, offset + 9)` with a "Show More" button
- Maps `due_type` to human-readable labels and resolves person names from the sabeel data
- Each row: type badge, title/person name, amount, formatted date

**Files modified**:
- `src/hooks/useDueReminders.ts` -- filter out paid dues
- `src/components/dues/SabeelCard.tsx` -- add History button
- `src/components/dues/DuesSection.tsx` -- wire up history sheet state

**Files created**:
- `src/components/dues/PaymentHistory.tsx` -- paginated payment log sheet

