
# Simplify UI - Compact Date & Progress Header

## Current Layout (Vertical Stack)
```text
        [Sun] 12 Rajab 1447
         Wednesday, Feb 5
             📍 London
    
    ┌──────────────────────────┐
    │  40%      Daily Progress │
    │  ████████░░░░░░░░░░░░░░░ │
    │  You're on track         │
    └──────────────────────────┘
    
    [Tabs...]
```

## New Layout (Single Row)
```text
┌────────────────────────────────────────┐
│ [Sun] 12 Rajab 1447              40%   │
│ Wed, Feb 5 · London        Daily Progress │
└────────────────────────────────────────┘

[Tabs...]
```

**Changes:**
- Date and location left-aligned in a stacked format
- Percentage number right-aligned with "Daily Progress" label below it
- Remove: progress bar, encouragement messages
- Saves ~100px of vertical space

## Files to Modify

### 1. `src/components/namaz/DailyMeter.tsx`

Create a new `compact` prop variant that shows only:
- Large percentage number
- "Daily Progress" label centered below

```tsx
// Add compact variant
interface DailyMeterProps {
  percentage: number;
  className?: string;
  showMessage?: boolean;
  compact?: boolean;  // New prop
}

// When compact=true, render:
<div className="flex flex-col items-end">
  <span className="text-3xl font-bold font-display">{percentage}%</span>
  <span className="text-xs text-muted-foreground">Daily Progress</span>
</div>
```

### 2. `src/components/calendar/DateDisplay.tsx`

The existing `compact` mode already left-aligns, but we need to adjust for the new row layout:
- Add location inline with date (e.g., "Wed, Feb 5 · London")
- Keep Hijri date prominent on first line

Update compact mode to include location inline:
```tsx
// compact mode with inline location
<div className="flex flex-col items-start">
  <div className="flex items-center gap-2">
    <SunLight className="h-4 w-4" />
    <span className="font-display font-semibold">{hijriFormatted}</span>
  </div>
  <span className="text-sm text-muted-foreground">
    {gregorianFormatted}{location?.city ? ` · ${location.city}` : ''}
  </span>
</div>
```

### 3. `src/pages/Namaz.tsx`

Replace separate DateDisplay and DailyMeter with a single row container:

```tsx
{/* Compact Header Row */}
<div className="flex items-start justify-between">
  <DateDisplay showLocation compact />
  <DailyMeter percentage={percentage} compact />
</div>

{/* Tabs... */}
```

### 4. `src/pages/Dashboard.tsx` (Optional)

Apply same compact header pattern for consistency, or keep the current card-based layout for the main dashboard. We can leave Dashboard unchanged initially since it has different information density requirements.

## Visual Result

```text
┌───────────────────────────────────────────┐
│ ☀ 12 Rajab 1447                      40%  │
│ Wed, Feb 5 · London           Daily Progress │
├───────────────────────────────────────────┤
│  📿 Today's Namaz  │  ⚠ Missed Namaz [2]  │
│  ═══════════════   │                       │
├───────────────────────────────────────────┤
│  ○ Fajr         05:30                     │
│  ● Zuhr         12:15  ✓                  │
│  ...                                       │
└───────────────────────────────────────────┘
```

## Summary

| File | Change |
|------|--------|
| `DailyMeter.tsx` | Add `compact` prop - percentage + label only, right-aligned |
| `DateDisplay.tsx` | Update compact mode to include location inline |
| `Namaz.tsx` | Single row layout with flexbox `justify-between` |
