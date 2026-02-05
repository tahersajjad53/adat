
# Add Nisful Layl & Rename Dhuhr to Zuhr

## Changes Overview

1. **Rename "Dhuhr" → "Zuhr"** in the display name
2. **Add "Nisful Layl"** as an optional night prayer that doesn't affect the daily percentage

## Technical Details

### 1. Rename Dhuhr to Zuhr

**File: `src/hooks/usePrayerTimes.ts`**
- Update `PRAYER_DISPLAY_NAMES` to show "Zuhr" instead of "Dhuhr"

```typescript
export const PRAYER_DISPLAY_NAMES: Record<PrayerName, string> = {
  fajr: 'Fajr',
  dhuhr: 'Zuhr',  // Changed from 'Dhuhr'
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};
```

### 2. Add Nisful Layl (Optional Prayer)

**What is Nisful Layl?**
- Night prayer performed at the midpoint between Maghrib and Fajr
- Time calculation: `(Maghrib + Fajr next day) / 2` or use API's `Midnight` value

**File: `src/hooks/usePrayerTimes.ts`**
- Add new type for all prayers including optional ones
- Create separate arrays for required vs optional prayers
- Include Midnight time from API

```typescript
export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export type OptionalPrayerName = 'nisfulLayl';
export type AllPrayerName = PrayerName | OptionalPrayerName;

export const PRAYER_DISPLAY_NAMES: Record<AllPrayerName, string> = {
  fajr: 'Fajr',
  dhuhr: 'Zuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
  nisfulLayl: 'Nisful Layl',
};

export const PRAYER_ORDER: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
export const OPTIONAL_PRAYERS: OptionalPrayerName[] = ['nisfulLayl'];
export const ALL_PRAYER_ORDER: AllPrayerName[] = [...PRAYER_ORDER, ...OPTIONAL_PRAYERS];
```

**File: `src/hooks/usePrayerLog.ts`**
- Include Nisful Layl in prayers list with `isOptional: true` flag
- Only count required prayers (5) for percentage calculation
- Calculate Nisful Layl time from Midnight API response

```typescript
export interface PrayerStatus {
  name: AllPrayerName;
  displayName: string;
  time: string;
  isCompleted: boolean;
  completedAt: Date | null;
  status: 'upcoming' | 'current' | 'completed' | 'missed';
  isOptional: boolean;  // New field
}

// Percentage calculation (unchanged - only counts 5 required prayers)
const completedRequired = prayers.filter(p => !p.isOptional && p.isCompleted).length;
const percentage = Math.round((completedRequired / 5) * 100);
```

**File: `src/components/namaz/PrayerCard.tsx`**
- Add visual indicator for optional prayers (e.g., "(Optional)" label or different styling)

**File: `src/components/namaz/PrayerList.tsx`**
- Render optional prayers with distinct styling (slightly muted or with badge)

## Visual Design

| Prayer | Time | Style |
|--------|------|-------|
| Fajr | 05:30 | Normal card |
| Zuhr | 12:15 | Normal card |
| Asr | 15:45 | Normal card |
| Maghrib | 18:30 | Normal card |
| Isha | 20:00 | Normal card |
| Nisful Layl | 00:15 | Muted/optional style + badge |

## Files to Modify

1. `src/hooks/usePrayerTimes.ts` - Add types, rename Dhuhr, add Midnight/Nisful Layl
2. `src/hooks/usePrayerLog.ts` - Add optional prayer handling, exclude from percentage
3. `src/components/namaz/PrayerCard.tsx` - Add optional prayer styling
4. `src/components/namaz/PrayerList.tsx` - Render optional prayers with distinction
5. `src/lib/prayerTimes.ts` - Ensure Midnight is available in the response
