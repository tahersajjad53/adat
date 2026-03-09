

## Conditionally Show "Today" Button

The "Today" button in the header should only appear when the user has navigated away from the current date on the calendar page.

### Approach

Since the header (`AppLayout`) doesn't know the calendar's current state, we'll use a lightweight state mechanism:

**`src/pages/Calendar.tsx`** — Dispatch a custom event whenever `showingToday` changes, so the header knows whether to show the button.

**`src/components/layout/AppLayout.tsx`** — Listen for that event and conditionally render the "Today" button only when the calendar is NOT showing today.

Alternatively (simpler): use a small shared state via `CalendarContext` or a DOM attribute on `document.body` (e.g., `data-calendar-showing-today`).

### Changes

**`src/pages/Calendar.tsx`**
- Add a `useEffect` that sets `document.body.dataset.calendarShowingToday = showingToday ? 'true' : 'false'` whenever `showingToday` changes, and cleans up on unmount.

**`src/components/layout/AppLayout.tsx`**
- Add state `showTodayButton` defaulting to `false`.
- Use a `MutationObserver` on `document.body` attributes (or simpler: listen for a custom event `calendar:dateChanged`) to track when `data-calendar-showing-today` changes.
- Only render the "Today" button when `isCalendarPage && !showingToday`.

**Simpler alternative using custom events (preferred):**

**`src/pages/Calendar.tsx`** — Dispatch `calendar:showingTodayChanged` with `detail: { showingToday }` whenever `showingToday` changes.

**`src/components/layout/AppLayout.tsx`** — Listen for that event, store in state, conditionally render button.

