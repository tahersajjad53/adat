

## Improve Namaz Tracker Card Layout

Two layout tweaks to the Dashboard's TimeOfDayCard to make it more compact and readable.

### 1. Merge Gregorian date + location into one line with dot separator

**File: `src/components/calendar/DateDisplay.tsx`** (compact variant, lines 57-66)

Replace the two separate lines (date and city) with a single line:

```
MAR 11, 2026 · COLOMBO
```

- Use a `·` (middle dot) separator with slightly increased opacity (`text-foreground/50`) and `mx-1.5` spacing so it's pronounced but not heavy.
- Both remain `text-xs uppercase tracking-widest`.

### 2. Prayer name and time on one horizontal line

**File: `src/pages/Dashboard.tsx`** (lines 190-199)

Currently the prayer icon, name, and time are stacked vertically inside a nested div. Change so the name and time sit on one line:

```
[icon]  Fajr  05:10
```

- Keep the icon in its circular bg as-is
- Move the time to be inline with the name: `<h3>Fajr</h3> <span>05:10</span>` in a `flex items-baseline gap-2` row
- Retain existing font sizes (text-2xl bold for name, text-sm for time)

