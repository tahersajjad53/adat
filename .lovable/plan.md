
# Typography Enhancement -- Stronger Visual Hierarchy

## Inspiration from Reference

The Starlink reference uses extreme contrast between large bold headings and small uppercase labels. We can adopt three key patterns while keeping our existing Bricolage Grotesque + Inter system:

1. **Uppercase tracking labels** for section counters and small metadata
2. **Larger page headings** with tighter tracking for more impact
3. **Bolder percentage displays** to create a strong focal point

## Changes

### 1. Global Utility Class (`src/index.css`)
Add a reusable `.label-caps` utility for uppercase spaced-out labels:
```css
.label-caps {
  @apply text-xs font-semibold uppercase tracking-widest text-muted-foreground;
}
```

### 2. Dashboard (`src/pages/Dashboard.tsx`)
- Change "Current Namaz" / "Next Namaz" label from `text-sm text-white/70` to uppercase tracked style: `text-xs font-semibold uppercase tracking-widest text-white/70`
- Increase prayer name heading from `text-xl` to `text-2xl`

### 3. DailyMeter (`src/components/namaz/DailyMeter.tsx`)
- "Daily Progress" label: apply uppercase tracking (`text-xs font-semibold uppercase tracking-widest`)
- Compact percentage: bump from `text-3xl` to `text-4xl`
- Full percentage: keep `text-5xl` (already strong)

### 4. Section Headers -- TodaysGoals + DueRemindersCard
- Keep current `text-xl font-bold` for section titles (appropriate for sub-sections)
- Change the counter text (e.g., "3/5") to use uppercase tracking style for consistency

### 5. Page Titles (`Goals.tsx`, `Namaz.tsx`, `Profile.tsx`)
- Increase page titles from `text-2xl md:text-3xl` to `text-3xl md:text-4xl` for more visual weight
- Subtitle text stays `text-base text-muted-foreground` for contrast

### 6. DateDisplay (`src/components/calendar/DateDisplay.tsx`)
- In compact mode, change "Gregorian date / city" line to uppercase tracked style
- In full mode, bump Hijri date from `text-2xl` to `text-3xl`

## Files Modified
- `src/index.css` -- add `.label-caps` utility
- `src/components/namaz/DailyMeter.tsx` -- uppercase label, larger percentage
- `src/pages/Dashboard.tsx` -- uppercase prayer label, larger prayer name
- `src/components/goals/TodaysGoals.tsx` -- uppercase counter
- `src/components/dues/DueRemindersCard.tsx` -- uppercase counter
- `src/components/calendar/DateDisplay.tsx` -- uppercase date line, larger Hijri
- `src/pages/Goals.tsx` -- larger page title
- `src/pages/Namaz.tsx` -- no structural change needed (uses shared components)
- `src/pages/Profile.tsx` -- larger page title (if applicable)

All changes are purely CSS class adjustments -- no logic or structural changes.
