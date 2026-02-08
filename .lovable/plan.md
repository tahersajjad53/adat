

# UI/UX Improvements: Today, Goals, and Profile Pages

## 1. Today Page -- Dues Reminders

**Current**: `DueRemindersCard` always renders, showing "No dues reminders right now" when empty.

**Change**: In `Dashboard.tsx`, conditionally render `DueRemindersCard` only when there are active reminders. The `useDueReminders` hook already computes this -- expose it or check `reminders.length > 0` before rendering. If no reminders exist, the card simply won't appear on the Today page.

**Files**: `src/pages/Dashboard.tsx`, `src/components/dues/DueRemindersCard.tsx` (add a prop or export a separate check, or just pass reminders count up)

---

## 2. Today Page -- Goals Styling

**Current**: `TodaysGoals` is wrapped in a `Card` with standard card background. Goal items are plain rows with small text.

**Change**:
- Remove the outer `Card`/`CardHeader`/`CardContent` wrapper
- Make "Today's Goals" a larger, bolder heading (text-xl font-bold font-display)
- Wrap each goal item in its own subtle card (rounded-xl bg-card border border-border p-4) inspired by the reference image -- larger text, more breathing room, prominent checkbox
- Show the completion count as a secondary label next to the title

**Files**: `src/components/goals/TodaysGoals.tsx`

---

## 3. Goals Page -- Mobile FAB

**Current**: "Add Goal" button sits in the header row next to the title, cramping the layout on mobile.

**Change**:
- On mobile (`useIsMobile`), hide the header button and render a floating action button (FAB) fixed at the bottom, positioned above the bottom nav (e.g., `fixed bottom-20 right-4 z-40`)
- This lets the title and subtitle span full width on mobile
- On desktop, keep the current header layout

**Files**: `src/pages/Goals.tsx`

---

## 4. Goals Page -- Styling Consistency

**Current**: Goals are inside a `Card > CardHeader > CardContent` wrapper. Each `GoalCard` has small text.

**Change**:
- Remove the outer `Card` wrapper, use a plain section
- Make the page title larger (text-2xl or text-3xl font-bold font-display) with lighter weight subtitle
- Each `GoalCard` gets the same prominent card treatment as on the Today page: rounded-xl, slightly larger font, more padding
- Ensure consistent typography: bold title, muted recurrence badge, description in lighter weight

**Files**: `src/pages/Goals.tsx`, `src/components/goals/GoalCard.tsx`

---

## 5. Profile Page -- Navigation Restructure

**Current**: All settings (name, email, location, dues, sign out) are in one long scrollable page.

**Change**: Convert Profile into a menu-based navigation with three top-level items:

1. **Sabeel** (first in list) -- opens the existing `DuesSection` (renamed from "Dues and Obligations" to simply "Sabeel")
2. **Account Information** -- contains name, email, location settings, and the Save button
3. **Sign Out** -- a simple action button that logs the user out

Each menu item is a clickable row (like a settings list). Tapping Sabeel or Account Information navigates into that section (can use a simple state toggle to show/hide inline, or a sub-page pattern). The page title follows the same large typography pattern: "Profile" as a bold display heading.

**Files**: `src/pages/Profile.tsx`

---

## 6. Calendar/Hijri Review for Sabeel Management

**Current**: Sabeel forms use `CalendarTypeSelector` and derive month/year from `CalendarContext`. The calendar system recently changed its epoch.

**Review finding**: The Sabeel forms correctly use `currentDate.hijri.month` and `currentDate.hijri.year` from CalendarContext, which now uses the corrected epoch. The `calendarUtils.ts` functions for month options and year ranges don't depend on the epoch directly. No changes needed here -- the epoch fix propagates automatically through CalendarContext.

**Files**: No changes required.

---

## 7. Global Typography Enhancement

Apply across all changed files:
- Page titles: `text-2xl md:text-3xl font-bold font-display tracking-tight`
- Subtitles: `text-base text-muted-foreground font-normal`
- Section headers: `text-lg font-semibold`
- Use varying weights (font-light, font-normal, font-semibold, font-bold) for visual hierarchy

---

## Technical Summary

| File | Changes |
|------|---------|
| `src/pages/Dashboard.tsx` | Conditionally render DueRemindersCard; remove grid wrapper when only goals show |
| `src/components/dues/DueRemindersCard.tsx` | Export hook data or accept a "hide when empty" behavior (return null if no reminders) |
| `src/components/goals/TodaysGoals.tsx` | Remove Card wrapper; larger title; each goal in its own prominent card |
| `src/pages/Goals.tsx` | Remove outer Card; mobile FAB for Add Goal; larger typography |
| `src/components/goals/GoalCard.tsx` | Larger padding, font sizes, more prominent card styling |
| `src/pages/Profile.tsx` | Restructure into menu-based navigation with Sabeel, Account Info, Sign Out |
| `src/components/dues/DuesSection.tsx` | Rename header from "Dues and Obligations" to "Sabeel" |

