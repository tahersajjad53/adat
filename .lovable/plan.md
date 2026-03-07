

## Handling Overlapping Goals and Namaz

Currently, timed goals and prayer cards are both absolutely positioned at their time slot with `left-12 right-0`, meaning if a goal is scheduled at the same time as a prayer (e.g., a Quran goal at Fajr time), they stack on top of each other with only z-index differentiating them.

### Recommended Approach: Offset timed goals that fall within a prayer's time range

**Logic:**
- For each timed goal, check if its `preferred_time` falls within any prayer's time window (prayer start → next prayer start).
- If it overlaps, nudge the goal card down to sit just below the prayer card (prayer top + prayer height + small gap).
- If multiple goals overlap the same prayer, stack them sequentially below.

**Visual result:**
```text
│5 AM│ ┌── FAJR ───────────┐
│    │ │ gradient-fajr      │
│    │ └────────────────────┘
│    │  ┌─ Quran goal ─────┐   ← nudged below
│    │  └──────────────────-┘
│6 AM│
```

### Implementation

**`CalendarTimeline.tsx`** — adjust the timed goals rendering section:

1. Build a list of prayer time ranges: `{ start: timeMinutes, end: start + cardHeight }` for each prayer.
2. For each timed goal, if its minute position falls within a prayer range, set its top to `prayerTop + prayerHeight + 4px` gap. If multiple goals collide, stack them with additional offsets.
3. This keeps prayers visually dominant while goals tuck neatly beneath overlapping prayers.

### Alternative considered but not recommended
- **Side-by-side columns** (prayer left half, goal right half): Adds complexity and makes both elements narrower on mobile. Not ideal for the current single-column layout.

### Scope
Single file change to `CalendarTimeline.tsx` — ~20 lines of collision-detection logic in the timed goals map.

