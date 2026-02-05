

# Hijri Calendar Integration Plan for Adat

## Overview

This plan outlines how to integrate a Hijri calendar system into Adat that respects the Dawoodi Bohra practice of considering Maghrib (sunset) as the start of a new day. This is foundational for all other features including prayer tracking, dues management, and goal setting.

---

## Hijri Calendar Library Options

After researching available options, here are the top candidates:

### Option 1: Temporal API with Intl (Recommended)

**Pros:**
- Native browser support via `Intl.DateTimeFormat` with `calendar: 'islamic'`
- No external dependencies
- Accurate conversion maintained by browser vendors
- Lightweight and performant

**Cons:**
- Requires manual implementation of Maghrib adjustment logic
- Limited formatting options compared to dedicated libraries

### Option 2: hijri-converter (npm package)

**Pros:**
- Dedicated Hijri-Gregorian conversion library
- Simple API for date manipulation
- Supports various Islamic calendar variants

**Cons:**
- Additional dependency
- May need wrapper for Maghrib adjustment

### Option 3: moment-hijri

**Pros:**
- Familiar moment.js API
- Good formatting options

**Cons:**
- Moment.js is in maintenance mode
- Larger bundle size
- Not recommended for new projects

### Recommended Approach

Use the **native Intl API** combined with a **custom utility layer** for Maghrib-based day transitions. This gives us:
- Zero additional dependencies for core conversion
- Full control over the Maghrib sunset logic
- Integration with an external API for accurate prayer times (needed anyway for Namaz tracking)

---

## Architecture Design

### Core Components

```text
+------------------------------------------+
|           Calendar Context               |
|  - Current Hijri/Gregorian date          |
|  - User's location (for Maghrib time)    |
|  - Maghrib time for today                |
+------------------------------------------+
            |
            v
+------------------------------------------+
|        Hijri Date Utilities              |
|  - gregorianToHijri(date, maghribTime)   |
|  - hijriToGregorian(hijriDate)           |
|  - formatHijriDate(date, format)         |
|  - getAdjustedHijriDate(now, maghribTime)|
+------------------------------------------+
            |
            v
+------------------------------------------+
|         Prayer Times API                 |
|  - Fetch Maghrib time for location       |
|  - Cache prayer times daily              |
+------------------------------------------+
```

### Key Files to Create

| File | Purpose |
|------|---------|
| `src/lib/hijri.ts` | Core Hijri conversion utilities with Maghrib adjustment |
| `src/lib/prayerTimes.ts` | API integration for fetching prayer times |
| `src/contexts/CalendarContext.tsx` | Global calendar state with current dates |
| `src/components/calendar/DualCalendar.tsx` | Calendar component showing both systems |
| `src/components/calendar/DateDisplay.tsx` | Reusable dual-date display widget |

---

## Maghrib Day Transition Logic

The core algorithm for determining the current Hijri date:

```text
1. Get current local time
2. Fetch today's Maghrib time for user's location
3. If current time >= Maghrib time:
   - Add 1 day to Gregorian date before conversion
   - Convert to Hijri (this gives "tomorrow's" Hijri date)
4. Else:
   - Convert current Gregorian date to Hijri normally
5. Display both dates with clear labeling
```

### Example Scenario

> User's birthday: 15th Rabi al-Awwal
> Actual event occurs: March 10th at 8:30 PM (after Maghrib at 6:15 PM)
> 
> - Gregorian shows: March 10th
> - Hijri shows: 16th Rabi al-Awwal (because it's after Maghrib)
> - The system correctly associates this with 16th Rabi al-Awwal

---

## Prayer Times API Integration

For accurate Maghrib times, we'll integrate with **Aladhan API** (free, no API key required):

**Endpoint:** `https://api.aladhan.com/v1/timings/{date}?latitude={lat}&longitude={lng}&method=1`

- Method 1 = Shia Ithna-Ashari (closest to Dawoodi Bohra calculations)
- Returns all 5 prayer times including Maghrib
- Supports location-based calculations

### Caching Strategy

- Cache prayer times for the current day in localStorage
- Refresh at midnight or on location change
- Fallback to approximate calculation if API unavailable

---

## Database Schema Additions

We'll need to store user location preferences:

```sql
ALTER TABLE profiles ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE profiles ADD COLUMN longitude DECIMAL(11, 8);
ALTER TABLE profiles ADD COLUMN city TEXT;
ALTER TABLE profiles ADD COLUMN timezone TEXT;
```

---

## UI Components

### 1. Date Display Widget

A compact widget showing both calendar systems:

```text
+--------------------------------+
|  Thursday, March 10, 2025      |  <- Gregorian (smaller)
|  16 Rabi al-Awwal 1446         |  <- Hijri (prominent)
+--------------------------------+
```

### 2. Dual Calendar View

A monthly calendar that displays:
- Gregorian dates as primary grid
- Hijri dates as secondary labels within each cell
- Visual indicator for current day (both systems)
- Maghrib transition indicator

### 3. Location Setup

A simple onboarding step or settings page to:
- Request location permission (browser geolocation)
- Or manually enter city/coordinates
- Display detected Maghrib time for confirmation

---

## Implementation Phases

### Phase 1: Core Utilities
- Create `src/lib/hijri.ts` with conversion functions
- Create `src/lib/prayerTimes.ts` for API integration
- Add location fields to profiles table

### Phase 2: Calendar Context
- Build `CalendarContext` with current date state
- Auto-refresh on Maghrib transition
- Handle location-based Maghrib time fetching

### Phase 3: UI Components
- Create `DateDisplay` widget for header
- Build `DualCalendar` component
- Add location setup in user settings

### Phase 4: Dashboard Integration
- Add date display to dashboard header
- Show today's date prominently
- Prepare foundation for goals/todos integration

---

## Technical Considerations

### Hijri Month Names (Arabic/English)

We'll support both Arabic and transliterated names:

| # | Arabic | Transliterated |
|---|--------|----------------|
| 1 | محرم | Muharram |
| 2 | صفر | Safar |
| 3 | ربيع الأول | Rabi al-Awwal |
| 4 | ربيع الآخر | Rabi al-Thani |
| 5 | جمادى الأولى | Jumada al-Awwal |
| 6 | جمادى الآخرة | Jumada al-Thani |
| 7 | رجب | Rajab |
| 8 | شعبان | Shaban |
| 9 | رمضان | Ramadan |
| 10 | شوال | Shawwal |
| 11 | ذو القعدة | Dhul Qadah |
| 12 | ذو الحجة | Dhul Hijjah |

### Timezone Handling

- All calculations use user's local timezone
- Maghrib time is location-specific
- Dates stored in database as UTC with timezone metadata

### Edge Cases

- Handle day transition exactly at Maghrib time
- Account for DST changes in prayer time calculations
- Graceful fallback when location unavailable

---

## Dependencies

**No new npm packages required** for core functionality. We'll use:
- Native `Intl.DateTimeFormat` for Hijri conversion
- `date-fns` (already installed) for Gregorian date manipulation
- Fetch API for Aladhan prayer times

---

## Summary

This plan establishes a robust dual-calendar foundation that:

1. Correctly handles the Maghrib-based day transition for Dawoodi Bohra practices
2. Shows both Gregorian and Hijri dates throughout the app
3. Integrates with a prayer times API for accurate Maghrib calculations
4. Provides reusable components for the goals/todos system
5. Stores user location for personalized prayer times

