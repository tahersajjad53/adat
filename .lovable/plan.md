

## Relax the Calendar Timeline UI

### Problem
The current hourly grid layout crams too much into small text sizes (`text-[10px]`, `text-xs`, `text-[9px]`) with tight padding (`p-2.5`). It feels dense compared to the cozy card layouts on the Today and Goals pages where titles use `text-base`, cards have `p-4`, and there's generous spacing. The reference image shows a relaxed, card-based day view with normal-sized text and breathing room.

### Approach
**Drop the hourly grid lines.** Instead of a Google Calendar-style absolute-positioned timeline, switch to a **sequential card list** (like the reference image). Prayers and goals render as stacked cards in chronological order, each with comfortable padding and consistent font sizes matching the rest of the app. This eliminates the dense hour-label gutter and cramped absolute positioning.

### Changes — `CalendarTimeline.tsx`

**Layout**: Replace the absolute-positioned hourly grid with a simple vertical stack (`space-y-3`). Items (prayers + timed goals) are sorted by time and rendered sequentially. No hour labels, no grid lines.

**Prayer cards**:
- Increase padding: `px-3` → `px-4 py-4` (matching GoalCard's `p-4`)
- Prayer name: `text-sm` → `text-base font-semibold` (matching GoalCard title)
- Time display: `text-xs` → `text-sm`
- Hijri date: `text-[10px]` → `text-xs`
- Checkbox: keep `h-5 w-5`
- Rounded corners: `rounded-lg` → `rounded-xl` (matching GoalCard)
- Remove fixed `height`/`minHeight` constraints — let content breathe naturally
- Keep gradient backgrounds

**Goal cards**:
- Padding: `p-2.5` → `p-4`
- Title: `text-xs` → `text-base font-medium` (matching GoalCard)
- Tag badge: `text-[9px]` → `text-[10px]`
- Time: `text-[10px]` → `text-xs`
- Checkbox: `h-4 w-4` → keep consistent
- Rounded: `rounded-lg` → `rounded-xl`

**Qaza / fulfilled cards**: Same padding and text size bump.

**Current time indicator**: A subtle badge or divider between cards showing "Now" rather than an absolute-positioned line (since we no longer have pixel-positioned slots).

**All-day section**: Keep as-is but apply the same card styling updates.

**Auto-scroll**: Scroll to the current/next prayer card using `scrollIntoView` instead of pixel math.

### What stays the same
- Gradient backgrounds for each prayer
- Checkbox toggling behavior
- Context menu delete on goals
- Props interface (no changes to `Calendar.tsx`)

### Result
A cozy, card-based chronological list that matches the visual language of the Today and Goals pages — consistent `text-base` titles, `p-4` padding, `rounded-xl` cards, and generous spacing.

