

# Fix Header Card Layout + Add Color-Coded Progress Bar

## Problems Identified

1. **"DAILY PROGRESS" wraps onto two lines** -- the uppercase tracked text is too wide for the available space on the right side of the header card
2. **Hijri date text may wrap** on narrower screens due to long month names like "Shaban Karim"
3. **Progress bar is missing from the header card** -- the reference image (noise level UI) shows a colored fill bar with hatched/striped patterns, which would add visual interest

## Fixes

### 1. DailyMeter compact mode -- prevent label wrapping (`src/components/namaz/DailyMeter.tsx`)
- Add `whitespace-nowrap` to the "Daily Progress" label so it stays on one line
- Slightly reduce percentage size from `text-4xl` to `text-3xl` on mobile to give more breathing room
- Use responsive sizing: `text-3xl sm:text-4xl`

### 2. DateDisplay compact mode -- prevent Hijri date wrapping (`src/components/calendar/DateDisplay.tsx`)
- Add `whitespace-nowrap` to the Hijri date span
- Use responsive font size: `text-sm sm:text-base` for the Hijri date to scale down on very narrow screens

### 3. Add a color-coded progress bar inside the header card (`src/pages/Dashboard.tsx`)
Inspired by the noise-level reference, add a thin progress bar between the date/progress row and the prayer section. The bar will:
- Use `bg-white/20` track with a lime/accent-colored fill (`bg-[hsl(75,70%,55%)]`) for a pop of color against the gradient background
- Add diagonal stripe pattern via a CSS background on the fill indicator using repeating-linear-gradient (similar to the hatched pattern in the reference)
- This requires a small addition to the Progress component: accept optional `indicatorClassName` prop, or simply render a custom inline bar in Dashboard

### 4. Custom striped progress bar in Dashboard (`src/pages/Dashboard.tsx`)
Instead of modifying the shared Progress component, render a simple custom bar directly in the TimeOfDayCard:
```
<div className="mt-3 h-2 w-full rounded-full bg-white/20 overflow-hidden">
  <div
    className="h-full rounded-full bg-[hsl(75,70%,55%)] transition-all"
    style={{
      width: `${overallPercentage}%`,
      backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(255,255,255,0.2) 3px, rgba(255,255,255,0.2) 6px)',
    }}
  />
</div>
```
This goes right after the date/progress flex row and before the divider line.

## Files Changed
- `src/components/namaz/DailyMeter.tsx` -- whitespace-nowrap on label, responsive percentage size
- `src/components/calendar/DateDisplay.tsx` -- whitespace-nowrap and responsive font on Hijri date
- `src/pages/Dashboard.tsx` -- add striped progress bar between header row and prayer section, remove the plain `border-t` divider (the bar acts as the visual separator)

