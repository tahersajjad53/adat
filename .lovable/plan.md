

## On-Time Namaz Radial Meter on Profile Page

### Overview
Add a compass-inspired radial meter card at the top of the Profile main menu showing the user's "on-time" prayer percentage. The card queries `prayer_logs` where `prayer_window_start` and `prayer_window_end` are populated, compares `completed_at` against the window, and renders a SVG radial gauge.

### New Files

**1. `src/hooks/useOnTimePrayerStats.ts`**
- Custom hook that queries `prayer_logs` for the current user where `prayer_window_start IS NOT NULL`
- Counts total prayers with window data vs those where `completed_at` time falls between `prayer_window_start` and `prayer_window_end`
- Returns `{ percentage, onTimeCount, totalTracked, loading }`
- The comparison extracts the time portion of `completed_at` (adjusted to user's timezone) and checks it against the stored window

**2. `src/components/profile/OnTimeMeter.tsx`**
- SVG-based radial compass meter component
- Visual design inspired by the reference:
  - Circular arc gauge with tick marks around the perimeter (compass-style)
  - Cardinal-style labels (e.g., small decorative dots/ticks at intervals)
  - Large percentage number in the center
  - Subtle "On Time" label below the number
  - Arc fills with primary color proportional to percentage
  - Decorative compass needle or indicator at the current value
  - Muted background ring with accent-colored filled portion
- Props: `percentage: number`, `totalTracked: number`
- Shows a message like "Based on 23 prayers tracked" below
- If no data yet (totalTracked === 0), shows an empty state: "Complete prayers to see your on-time stats"

### Modified Files

**3. `src/pages/Profile.tsx`**
- Import `OnTimeMeter` and `useOnTimePrayerStats`
- In the main menu section (before the settings buttons list around line 421), add the radial meter card inside a `rounded-xl border border-border bg-card p-6` container
- The card sits prominently at the top of the profile menu

### Technical Details

**On-time logic**: A prayer is "on time" if the time component of `completed_at` (in the user's local timezone) is ≥ `prayer_window_start` AND ≤ `prayer_window_end`. For nisful layl where the window crosses midnight (start > end), the logic inverts: on-time if time ≥ start OR time ≤ end.

**SVG Radial Meter Design**:
- 200×200 viewBox, circle radius ~80
- Background track: full circle stroke in `secondary` color with compass tick marks
- Foreground arc: `strokeDasharray` + `strokeDashoffset` animated with CSS transition, using `primary` color
- Tick marks: 60 small lines around perimeter, every 5th one longer (compass style)
- Center: large bold percentage, small "On Time" label
- Subtle decorative compass point indicators at N/E/S/W positions

### Files
1. `src/hooks/useOnTimePrayerStats.ts` — new hook
2. `src/components/profile/OnTimeMeter.tsx` — new radial component
3. `src/pages/Profile.tsx` — integrate meter into main menu

