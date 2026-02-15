

# Add "Clear Qaza Namaz" with Persistent Backend Effect

## What Changes
A 3-dot menu on the Namaz page header with a "Clear Qaza Namaz" option. On confirmation, all unfulfilled missed prayers are marked as fulfilled (`qaza_completed_at` set) in the database. This is persistent -- refreshing will keep the list clear. New missed prayers from future days will still appear.

## How It Works
The existing `fulfillPrayer` function already upserts `qaza_completed_at` into the `prayer_logs` table. Clearing all qaza is simply calling the same logic for every unfulfilled prayer in bulk.

## Technical Details

### 1. `src/hooks/useMissedPrayers.ts`
- Add a `clearAllQaza` async function that:
  - Filters `missedPrayers` to only unfulfilled ones
  - Bulk upserts all of them into `prayer_logs` with `qaza_completed_at` set to now (using Supabase's `.upsert()` with an array)
  - Updates local state to mark all as fulfilled
- Add `clearAllQaza` to the hook's return interface

### 2. `src/pages/Namaz.tsx`
- Import `MoreHoriz` from `iconoir-react`, `DropdownMenu` components, `AlertDialog` components, and `Button`
- Add `clearConfirmOpen` boolean state
- Destructure `clearAllQaza` from `useMissedPrayers()`
- Add a 3-dot dropdown menu at the top-right of the page (matching Goals page pattern) with a single "Clear Qaza Namaz" item
- The item opens an `AlertDialog`:
  - Title: "Clear Qaza Namaz?"
  - Description: "This will mark all missed prayers as completed. New missed prayers will continue to appear going forward."
  - Cancel and Confirm buttons
- On confirm, call `clearAllQaza()`

No database schema changes or migrations needed -- the existing `prayer_logs` table and its `qaza_completed_at` column handle this already.

