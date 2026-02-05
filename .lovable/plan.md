
# Unify Dashboard with Time-Aware Visual Card

## Overview

Bring the same dynamic, time-aware visual card design from the Namaz page to the Dashboard. Merge the date/location, progress meter, and next prayer information into a single unified card experience with dynamic gradient backgrounds and geometric shapes.

## Current Dashboard Layout

```text
        [Sun] 12 Rajab 1447
         Wednesday, Feb 5
             [📍 London]
    
    ┌──────────────────────────┐
    │  40%      Daily Progress │
    │  ████████░░░░░░░░░░░░░░░ │
    │  You're on track         │
    └──────────────────────────┘

    ┌──────────────────────────┐
    │  Next Prayer             │
    │  [☀] Zuhr      12:15  ☐  │
    └──────────────────────────┘

    [ View all prayers → ]        ← REMOVE THIS

    [Coming Soon Cards...]
```

## New Dashboard Layout

```text
┌─────────────────────────────────────────────────┐
│  ☀ 19 Shaban 1447                        40%   │
│  Wed, Feb 6 · Colombo            Daily Progress │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Next Namaz                                     │
│  [☀] Zuhr                          12:15   ☐   │
│                              ◇◇◇                │
│                           ◇◇◇◇◇◇                │
└─────────────────────────────────────────────────┘

[Coming Soon Cards...]
```

**Key changes:**
1. Wrap everything in `TimeOfDayCard` with dynamic gradients
2. Merge date/location, progress, and next prayer into one card
3. Remove "View all prayers" button
4. Rename "Next Prayer" to "Next Namaz"
5. Keep the current prayer formatting (icon, name, time, checkbox)

## Files to Modify

### 1. `src/pages/Dashboard.tsx`

Major refactor to use the unified card design:

**Imports to add:**
- `TimeOfDayCard` from components
- `usePrayerTimes`, `getCurrentPrayerWindow` from hooks
- `Clock`, `Check` icons for inline prayer display

**Remove:**
- Separate DateDisplay section
- Separate DailyMeter card
- Separate CurrentPrayerCard component usage
- "View all prayers" button

**New structure:**
```tsx
// Get current prayer window for theming
const { prayerTimes } = usePrayerTimes();
const currentPrayerWindow = prayerTimes ? getCurrentPrayerWindow(prayerTimes) : null;
const currentPrayerName = currentPrayerWindow?.current || null;

// Determine which prayer to show
const prayerToShow = currentPrayer || nextPrayer;

return (
  <TimeOfDayCard currentPrayer={currentPrayerName}>
    {/* Top row: Date + Progress */}
    <div className="flex items-start justify-between">
      <DateDisplay showLocation compact variant="light" />
      <DailyMeter percentage={percentage} compact variant="light" />
    </div>
    
    {/* Divider */}
    <div className="my-4 border-t border-white/20" />
    
    {/* Next Namaz section - inline within card */}
    {prayerToShow && (
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-white/70">
            {currentPrayer ? 'Current Namaz' : 'Next Namaz'}
          </span>
          <div className="flex items-center gap-3 mt-1">
            <div className="rounded-full p-2 bg-white/20">
              <PrayerIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {prayerToShow.displayName}
              </h3>
              <span className="text-sm text-white/80">{prayerToShow.time}</span>
            </div>
          </div>
        </div>
        
        {/* Checkbox */}
        <Checkbox
          checked={prayerToShow.isCompleted}
          onCheckedChange={() => togglePrayer(prayerToShow.name)}
          className="h-6 w-6 border-white/50 data-[state=checked]:bg-white/30"
        />
      </div>
    )}
  </TimeOfDayCard>
);
```

### 2. `src/components/ui/checkbox.tsx` (Minor update)

May need to support light variant styling for the checkbox to look good on gradient backgrounds. The checkbox should have:
- White/light border when unchecked
- White/light checkmark when checked
- Semi-transparent white background when checked

This can be handled inline with className overrides or by adding a variant prop.

## Visual Result

The Dashboard will now feature a single, cohesive card that:
- Changes gradient based on current prayer time (same as Namaz page)
- Shows decorative geometric shapes (same as Namaz page)
- Contains date/location (left) + progress % (right)
- Has a subtle divider line
- Shows next/current Namaz with icon, name, time, and toggle checkbox
- Uses white/light text throughout for contrast on gradients

## Summary

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Major refactor: Use TimeOfDayCard, merge all info into one card, remove "View all prayers", rename to "Next Namaz" |
| `src/components/ui/checkbox.tsx` | Optional: Add light variant support (or handle inline) |

## Technical Notes

- Reuse `usePrayerTimes` and `getCurrentPrayerWindow` for determining the gradient
- Reuse `TimeOfDayCard` component as-is
- Reuse `DateDisplay` and `DailyMeter` with `variant="light"` and `compact` props
- The prayer icon mapping already exists in `CurrentPrayerCard.tsx` - will inline this in Dashboard
