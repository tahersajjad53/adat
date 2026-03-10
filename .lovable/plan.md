

## Improve Dashboard card information layout

### Changes

**1. `src/components/calendar/DateDisplay.tsx`** — Update the compact variant:
- Increase icon size from `h-4 w-4` to `h-6 w-6`
- Increase Hijri date text from `text-sm sm:text-base` to `text-xl sm:text-2xl font-semibold`
- Split the Gregorian date and location onto separate lines instead of combining them with `·`
- Location shown on its own line below the Gregorian date

**2. `src/components/namaz/DailyMeter.tsx`** — Update the compact variant:
- Remove the "Ada" label span entirely
- Keep just the percentage number

