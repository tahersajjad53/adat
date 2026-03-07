

## Hourly Time-Slot Calendar Timeline

### Feasibility
Fully feasible. The current timeline is a flat list sorted by `timeMinutes`. Replacing it with a fixed hourly grid where items are absolutely positioned (or placed in their hour slot) is a well-known calendar UI pattern. Prayer times from Aladhan already have exact `HH:MM` values, and goals store `preferred_time` the same way.

### Approach
Replace `CalendarTimeline` internals with a **24-hour slot grid** (we can render a practical range like 3 AM to 1 AM to cover Fajr through Nisful Layl). Each hour gets a labeled row. Prayers and goals are positioned within their respective hour slot.

### Changes

**`src/components/calendar/CalendarTimeline.tsx`** (rewrite layout)

1. **Hour grid**: Render hour labels (e.g., "4 AM", "5 AM" ... "12 AM") as a left-side gutter with horizontal divider lines, similar to Google Calendar's day view.

2. **Prayer cards**: Each prayer is placed at its hour slot, spanning a taller height (~80px) with its gradient class applied as the background. The card shows prayer name, time, Hijri date, checkbox, and status. These are visually prominent blocks that break the hour grid with color.

3. **Goal cards**: Timed goals slot into their hour position (compact, no gradient). All-day goals remain at the top above the grid.

4. **Layout structure**:
```text
┌─────────────────────────────┐
│  ALL DAY: [goal] [goal]     │
├────┬────────────────────────┤
│4 AM│                        │
│    │ ┌── FAJR ───────────┐  │
│5 AM│ │ gradient-fajr      │  │
│    │ │ ☑ Fajr  5:12 AM   │  │
│    │ └───────────────────-┘  │
│6 AM│                        │
│... │                        │
│12  │ ┌── ZUHR ───────────┐  │
│    │ │ gradient-zuhr      │  │
│1 PM│ └───────────────────-┘  │
│... │   [goal card @ 2pm]    │
│3 PM│ ┌── ASR ────────────┐  │
│... │                        │
└────┴────────────────────────┘
```

5. **Hour range**: Dynamically compute from earliest prayer (Fajr, typically ~4-5 AM) minus 1 hour through latest (Nisful Layl, typically ~midnight) plus 1 hour. This avoids rendering empty predawn hours.

6. **Prayer card styling**: Use the existing `.gradient-fajr`, `.gradient-zuhr`, etc. classes as the card background. White text on the gradient. Taller cards (~80-100px) so they dominate the timeline visually. Include checkbox overlay for toggling completion.

7. **Current time indicator**: For today, render a thin accent-colored horizontal line at the current time position, auto-scrolled into view on mount.

**No other files change** -- the props interface stays the same, so `Calendar.tsx` requires no edits.

### Key Details
- Hour slot height: ~60px per hour (total scrollable height ~1200px for 20 hours)
- Prayer cards span based on duration to next prayer (or a minimum of ~80px)
- Qaza and fulfilled qaza cards retain their current destructive/primary styling but are placed at their time slot
- Goal cards are compact (~40px) at their time position
- The view auto-scrolls to the current prayer window on mount (for today) or to Fajr (for other days)

