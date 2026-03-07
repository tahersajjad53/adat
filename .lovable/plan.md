

## Pastel Prayer Gradients with Dark Text

### Problem
The current gradients use high saturation and mid-to-low lightness, requiring white text for contrast. Shifting to pastel shades means raising lightness and lowering saturation, which will make white text unreadable. We need to switch text to dark foreground colors.

### Changes

**1. `src/index.css` — Update all 6 gradient definitions to pastel shades**

Keep the same hue families, reduce saturation ~30-40%, raise lightness to ~75-85%:

| Prayer | Current | Pastel |
|--------|---------|--------|
| Fajr | `hsl(210 50% 42%)` → `hsl(200 55% 52%)` | `hsl(210 35% 80%)` → `hsl(200 40% 85%)` |
| Zuhr | `hsl(45 85% 55%)` → `hsl(35 80% 50%)` | `hsl(45 50% 82%)` → `hsl(35 45% 78%)` |
| Asr | `hsl(40 75% 50%)` → `hsl(25 70% 50%)` | `hsl(40 45% 80%)` → `hsl(25 40% 78%)` |
| Maghrib | `hsl(20 85% 55%)` → `hsl(350 60% 55%)` | `hsl(20 50% 82%)` → `hsl(350 40% 80%)` |
| Isha | `hsl(270 50% 35%)` → `hsl(250 55% 30%)` | `hsl(270 30% 78%)` → `hsl(250 35% 75%)` |
| Nisful Layl | `hsl(240 55% 25%)` → `hsl(230 60% 20%)` | `hsl(240 30% 75%)` → `hsl(230 35% 72%)` |

**2. `src/components/calendar/CalendarTimeline.tsx` — Switch text from white to dark**

In `PrayerSlotCard`:
- `text-white` → `text-foreground`
- `text-white/70`, `text-white/80` → `text-foreground/70`
- `border-white/30`, `border-white/50` → `border-foreground/20`
- Checkbox border/checked styles: swap `white` references to `foreground` equivalents

**3. `src/pages/Dashboard.tsx` and `src/pages/Namaz.tsx` — Update text on TimeOfDayCard**

These pages render children inside `TimeOfDayCard` with `text-white` classes. Update:
- `text-white`, `text-white/80`, `text-white/70` → `text-foreground`, `text-foreground/70`

Also check `DateDisplay` and `DailyMeter` which accept a `variant="light"` prop — may need a new variant or switch to default.

**4. Theme-specific overrides for Bhukur (dark mode)**

Pastel backgrounds on dark mode may look washed out. Add `.theme-bhukur .gradient-*` overrides that keep lightness lower (~40-50%) so the cards still feel rich in dark mode while remaining softer than the current vibrant versions. Text stays light (`text-foreground` which is already light in Bhukur).

### Scope
- `src/index.css` — gradient values
- `src/components/calendar/CalendarTimeline.tsx` — text color classes
- `src/pages/Dashboard.tsx` — TimeOfDayCard children text
- `src/pages/Namaz.tsx` — TimeOfDayCard children text
- Possibly `DateDisplay` and `DailyMeter` if they have hardcoded white text in `variant="light"`

