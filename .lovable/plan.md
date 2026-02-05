

# Time-Aware Visual Card with Geometric Design

## Concept

Create an immersive header card that dynamically changes its visual identity based on the current prayer window. Using abstract geometric shapes and gradient backgrounds inspired by the reference image - creating a premium, modern aesthetic.

## Visual Design

```text
┌─────────────────────────────────────────────────┐
│                  ╔═══════╗                      │
│   ☀ 19 Shaban   ║░░░░░░░║              40%     │
│   Feb 6 · Colombo╚═══════╝        Daily Progress│
│              ◇◇◇◇◇◇                            │
│           ◇◇◇◇◇◇◇◇◇                            │
└─────────────────────────────────────────────────┘
```

Each prayer period has a unique:
- **Gradient background** (subtle, flowing colors)
- **Geometric shape** (positioned decoratively)
- **Icon color** that matches the theme

## Prayer Period Color Scheme

| Period | Time | Colors | Shape |
|--------|------|--------|-------|
| **Fajr** | Dawn | Steel grey → Slate blue | Diamond/star shape |
| **Dhuhr/Zuhr** | Midday | Warm yellow → Amber | Angular sun rays |
| **Asr** | Afternoon | Golden → Orange tint | Chevron angles |
| **Maghrib** | Sunset | Orange → Coral → Pink | Overlapping circles |
| **Isha** | Night | Deep purple → Indigo | Crescent form |
| **Nisful Layl** | Midnight | Indigo → Deep blue | Geometric stars |

## Implementation

### New Component: `src/components/namaz/TimeOfDayCard.tsx`

A wrapper card component that:
1. Determines current prayer window from prayer times
2. Applies the appropriate gradient background
3. Renders decorative geometric SVG shapes
4. Contains the date display and progress meter

```tsx
interface TimeOfDayCardProps {
  currentPrayer: PrayerName | 'nisfulLayl' | null;
  children: React.ReactNode;
}
```

### Gradient Definitions (CSS)

Add to `src/index.css` or as Tailwind classes:

```css
/* Prayer-time gradients */
.gradient-fajr {
  background: linear-gradient(135deg, 
    hsl(215 25% 35%) 0%, 
    hsl(220 30% 45%) 100%);
}

.gradient-zuhr {
  background: linear-gradient(135deg, 
    hsl(45 85% 55%) 0%, 
    hsl(35 80% 50%) 100%);
}

.gradient-asr {
  background: linear-gradient(135deg, 
    hsl(40 75% 50%) 0%, 
    hsl(25 70% 50%) 100%);
}

.gradient-maghrib {
  background: linear-gradient(135deg, 
    hsl(20 85% 55%) 0%, 
    hsl(350 60% 55%) 100%);
}

.gradient-isha {
  background: linear-gradient(135deg, 
    hsl(270 50% 35%) 0%, 
    hsl(250 55% 30%) 100%);
}

.gradient-nisfulLayl {
  background: linear-gradient(135deg, 
    hsl(240 55% 25%) 0%, 
    hsl(230 60% 20%) 100%);
}
```

### Geometric SVG Shapes

Create abstract decorative shapes for each period:
- Positioned in bottom-right or corner
- Low opacity (10-20%) to not distract from content
- Subtle blur/glow effect

Example shape component:
```tsx
const GeometricShape = ({ variant }: { variant: string }) => {
  // Render different SVG paths based on prayer time
  // Angular diamonds for fajr, sun rays for zuhr, etc.
};
```

### Updated `src/pages/Namaz.tsx`

Wrap the header content in the new TimeOfDayCard:

```tsx
<TimeOfDayCard currentPrayer={currentPrayer?.name || null}>
  <div className="flex items-start justify-between">
    <DateDisplay showLocation compact />
    <DailyMeter percentage={percentage} compact />
  </div>
</TimeOfDayCard>
```

### Updated `src/components/calendar/DateDisplay.tsx`

Add support for light text on dark gradient backgrounds:
- Accept a `variant="light"` prop for white/light text
- Adjust icon and text colors accordingly

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/namaz/TimeOfDayCard.tsx` | **Create** - New card component with gradients and shapes |
| `src/index.css` | **Modify** - Add gradient utility classes |
| `src/pages/Namaz.tsx` | **Modify** - Use TimeOfDayCard wrapper |
| `src/components/calendar/DateDisplay.tsx` | **Modify** - Add light variant for dark backgrounds |
| `src/components/namaz/DailyMeter.tsx` | **Modify** - Add light variant support |

## Visual Result

The card will smoothly transition its appearance throughout the day:
- **Dawn (Fajr)**: Cool grey-blue with subtle star shapes
- **Midday (Zuhr)**: Warm golden yellow with angular rays
- **Afternoon (Asr)**: Deeper amber-orange with chevrons
- **Sunset (Maghrib)**: Vibrant coral-pink with soft circles
- **Night (Isha)**: Deep purple with crescent forms
- **Midnight (Nisful Layl)**: Rich indigo with geometric stars

This creates a living, breathing UI that connects users to the rhythm of Islamic prayer times while maintaining a clean, modern aesthetic inspired by the reference image.

