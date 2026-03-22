

## Fix Condensed Hijri Date + Percentage Layout

**Problem**: The Hijri date text and percentage indicator are cramped on the same line, with text running into each other (visible in screenshot: "4 Shawwal Mukarram 1447**60%**").

**Solution**: Move the percentage and progress bar into a single row below the date display, with the percentage taking ~20% width and the progress bar taking ~80%.

### Current layout
```text
┌─────────────────────────────────┐
│ [DateDisplay]        [60%]      │  ← cramped
│ ▓▓▓▓▓▓▓▓▓░░░░░░░              │  ← separate row
│ NEXT NAMAZ                      │
```

### New layout
```text
┌─────────────────────────────────┐
│ [DateDisplay - full width]      │
│ 60%  ▓▓▓▓▓▓▓▓▓░░░░░░░         │  ← percentage + bar inline
│ NEXT NAMAZ                      │
```

### Changes

**`src/pages/Dashboard.tsx`** (lines 156-172):
- Remove `DailyMeter` from the `flex justify-between` row with `DateDisplay`
- Give `DateDisplay` the full width
- Replace the standalone progress bar div with a new inline row: percentage label (shrink-0) + progress bar (flex-1), using roughly 20%/80% split

The `DailyMeter` compact mode is no longer needed here; we'll render the percentage text and bar directly inline in the card.

