
# Fix Timezone Handling for Maghrib-Based Date Transitions

## Problem Analysis

The current `isAfterMaghrib()` function in `src/lib/hijri.ts` has a bug: it compares the browser's local time directly against a Maghrib time string, but doesn't account for the user's **stored timezone** (e.g., `Asia/Colombo`).

**Current buggy flow:**
```text
1. User is in Colombo (UTC+5:30), it's 18:45 local time
2. Maghrib time is fetched as "18:30" (for Colombo)
3. isAfterMaghrib() creates a Date using browser's local time methods
4. If browser timezone differs from user's stored timezone, comparison fails
```

The issue is especially problematic when:
- The browser's system timezone differs from the user's saved location
- The `new Date()` uses the browser's local timezone, not the user's intended timezone

---

## Solution Overview

Update the calendar system to use **timezone-aware comparisons** by:

1. Passing the user's timezone through the system
2. Using timezone-aware time parsing in `isAfterMaghrib()`
3. Ensuring the Aladhan API request includes the timezone parameter

---

## Files to Modify

### 1. `src/lib/hijri.ts`

**Changes:**
- Update `isAfterMaghrib()` to accept an optional timezone parameter
- Create current time in the user's timezone for comparison
- Update `getAdjustedHijriDate()` to pass timezone through

```typescript
// Updated signature
export function isAfterMaghrib(
  currentTime: Date, 
  maghribTime: string,
  timezone?: string
): boolean {
  // Parse maghrib time
  const [hours, minutes] = maghribTime.split(':').map(Number);
  
  // Get current time in user's timezone
  let currentHours: number;
  let currentMinutes: number;
  
  if (timezone) {
    // Use Intl to get time in user's timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      timeZone: timezone,
    });
    const parts = formatter.formatToParts(currentTime);
    currentHours = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
    currentMinutes = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
  } else {
    // Fallback to local time
    currentHours = currentTime.getHours();
    currentMinutes = currentTime.getMinutes();
  }
  
  const currentTotalMinutes = currentHours * 60 + currentMinutes;
  const maghribTotalMinutes = hours * 60 + minutes;
  
  return currentTotalMinutes >= maghribTotalMinutes;
}

// Updated signature
export function getAdjustedHijriDate(
  currentTime: Date, 
  maghribTime: string | null,
  timezone?: string
): DualDate {
  const afterMaghrib = maghribTime 
    ? isAfterMaghrib(currentTime, maghribTime, timezone) 
    : false;
  // ... rest unchanged
}
```

### 2. `src/lib/prayerTimes.ts`

**Changes:**
- Add timezone parameter to the Aladhan API call
- This ensures the API returns times in the correct timezone

```typescript
export async function fetchPrayerTimes(
  date: Date,
  location: Location,
  method: number = 1
): Promise<PrayerTimes> {
  // ... existing code ...
  
  // Add timezone if available
  if (location.timezone) {
    url.searchParams.set('timezone', location.timezone);
  }
  
  // ... rest unchanged
}
```

### 3. `src/contexts/CalendarContext.tsx`

**Changes:**
- Pass the timezone from location to `getAdjustedHijriDate()`

```typescript
const refreshDate = useCallback(async () => {
  if (!location) return;

  try {
    setIsLoading(true);
    setError(null);

    const now = new Date();
    const maghrib = await fetchMaghribTime(now, location);
    setMaghribTime(maghrib);

    // Pass timezone for accurate Maghrib comparison
    const dualDate = getAdjustedHijriDate(now, maghrib, location.timezone);
    setCurrentDate(dualDate);
  } catch (err) {
    // ... error handling
  }
}, [location]);
```

### 4. `src/lib/prayerTimes.ts` - `getCurrentLocation()` enhancement

**Changes:**
- When getting browser location, also detect timezone using `Intl.DateTimeFormat`

```typescript
export function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    // ... existing geolocation code ...
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Detect browser timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timezone, // Include detected timezone
        });
      },
      // ... error handling
    );
  });
}
```

---

## Technical Details

### Why Intl.DateTimeFormat?
The `Intl.DateTimeFormat` API is the standard way to handle timezone conversions in JavaScript:
- `formatToParts()` extracts hour/minute in the target timezone
- No external libraries needed (date-fns or luxon)
- Works in all modern browsers

### Cache Invalidation
The existing cache in `prayerTimes.ts` should work correctly since:
- Cache key includes location coordinates
- If timezone changes, we should clear cache (add timezone to cache key)

### Update Cache Key
```typescript
interface CachedPrayerTimes {
  date: string;
  location: { latitude: number; longitude: number };
  timezone?: string;  // Add timezone to cache validation
  timings: PrayerTimes;
  fetchedAt: number;
}
```

---

## Testing Checklist

After implementation:
1. Verify Hijri date shows as 19th Shaban 1447 after Maghrib
2. Test with different browser timezones (dev tools override)
3. Verify prayer logs save to correct Hijri date
4. Confirm "New Islamic day began" message appears after Maghrib
