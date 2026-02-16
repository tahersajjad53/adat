# Document 5: Namaz Screen

> Prayer tracking with today's prayers and Qaza (missed) prayers.

---

## 5.1 Screen Structure

```
┌──────────────────────────┐
│ [Time-of-Day Card]       │  ← Same gradient card as Dashboard (smaller)
│ ┌──────────────────────┐ │
│ │ Sun, 16 Feb 2026     │ │
│ │ 17 Shaban 1447       │ │
│ │ Mumbai         72%   │ │
│ └──────────────────────┘ │
│                          │
│ ┌──────────┬───────────┐ │
│ │Today's   │Qaza Namaz │ │  ← Tab bar (2 tabs)
│ │Namaz     │    (12)   │ │  ← Badge with count
│ └──────────┴───────────┘ │
│                          │
│ [Tab Content]            │
└──────────────────────────┘
```

---

## 5.2 Today's Namaz Tab

### Prayer Cards (6 total)

```
┌──────────────────────────┐
│ ☀ Fajr          05:30   │  ← Icon, name, time
│   17 Shaban              │  ← Individual Hijri date label
│                    ☑     │  ← Checkbox
│   Status: completed      │  ← Visual indicator
└──────────────────────────┘
```

### 6 Prayers in Order

| Prayer | Key | Display Name | Icon | Hijri Date |
|---|---|---|---|---|
| Fajr | `fajr` | Fajr | SunLight | Pre-Maghrib |
| Zuhr | `dhuhr` | Zuhr | SunLight | Pre-Maghrib |
| Asr | `asr` | Asr | SunLight | Pre-Maghrib |
| Maghrib | `maghrib` | Maghrib | HalfMoon | Post-Maghrib |
| Isha | `isha` | Isha | HalfMoon | Post-Maghrib |
| Nisful Layl | `nisfulLayl` | Nisful Layl | HalfMoon | Post-Maghrib |

### Prayer Status Logic

Each prayer has a status: `upcoming`, `current`, `completed`, `missed`

```typescript
function getPrayerStatus(prayer, prayerTimes, isCompleted) {
  if (isCompleted) return 'completed';
  
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const prayerMinutes = parseTime(prayerTimes[prayer]);
  
  if (currentMinutes < prayerMinutes) return 'upcoming';
  
  const nextPrayer = PRAYER_ORDER[indexOf(prayer) + 1];
  if (nextPrayer) {
    if (currentMinutes < parseTime(prayerTimes[nextPrayer])) return 'current';
  } else {
    return 'current'; // Isha stays current until day reset
  }
  
  return 'missed';
}
```

### Status Visual Indicators
- **upcoming:** Default card style, muted text
- **current:** Highlighted card (subtle background change), bold text
- **completed:** Checkmark shown, accent-colored checkbox fill
- **missed:** Red/destructive tint on card border or background

### Nisful Layl (Optional Prayer)
- Always shown but marked as optional
- Time sourced from Aladhan API's `Midnight` field
- Status is simplified: `completed` if checked, `upcoming` otherwise (no `missed` state)
- Not counted in the required prayer total (5 required prayers only)

### Hijri Date Split
Each prayer card shows its specific Hijri date:
- **Fajr, Zuhr, Asr:** `currentDate.preMaghribHijri` (e.g., "17 Shaban")
- **Maghrib, Isha, Nisful Layl:** `currentDate.postMaghribHijri` (e.g., "18 Shaban")

This is critical because the Islamic day transitions at Maghrib.

### Prayer Times Source
- Fetched from Aladhan API: `https://api.aladhan.com/v1/timings/{DD-MM-YYYY}`
- Parameters: `latitude`, `longitude`, `method=1` (Shia Ithna-Ashari), `timezone`
- Cached for 24 hours (use `AsyncStorage` instead of `localStorage`)
- Times are in 24-hour format: "05:30", "12:15", etc.

---

## 5.3 Qaza Namaz Tab

### Structure

```
┌──────────────────────────┐
│ Qaza Namaz       (12)    │  ← Tab title with badge count
│                          │
│ ┌──────────────────────┐ │
│ │ Sat, Feb 15, 2026    │ │  ← Date group header
│ │ 16 Shaban 1447       │ │  ← Hijri date
│ │ ┌──────────────────┐ │ │
│ │ │ Fajr         Ada │ │ │  ← "Ada" button to mark fulfilled
│ │ │ Zuhr         Ada │ │ │
│ │ └──────────────────┘ │ │
│ └──────────────────────┘ │
│                          │
│ ┌──────────────────────┐ │
│ │ Fri, Feb 14, 2026    │ │  ← Older date
│ │ ...                  │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

### Badge
- Shows `unfulfilledCount` (unfulfilled missed prayers)
- Red destructive background pill
- "99+" if count exceeds 99

### Data Flow

The `useMissedPrayers` hook:

1. Fetches `profiles.created_at` for the user
2. Generates ALL expected prayers for every Gregorian day from `created_at` until **yesterday**
3. Fetches all `prayer_logs` for that date range
4. For each day × prayer combination: if `completed_at` is null → it's missed
5. Groups by date (most recent first), then by prayer order within each date

### Hijri Date Assignment in Qaza
Same split as Today:
- Fajr/Zuhr/Asr → `preMaghribHijri` for that Gregorian day
- Maghrib/Isha → `postMaghribHijri` (which is `advanceHijriDay(preMaghribHijri)`)

### Fulfilling a Qaza Prayer ("Ada")
- Tapping "Ada" upserts a `prayer_logs` row with `qaza_completed_at = now()`
- `completed_at` stays `null` — this distinguishes qaza from on-time completion
- Upsert uses `onConflict: 'user_id,prayer_date,prayer'`
- Fulfilled prayers are hidden from the list (or shown with a visual completion state)

### Clear All Qaza
- Available via a 3-dot menu in the header
- Confirmation dialog: "This will mark all X missed prayers as fulfilled. This cannot be undone."
- Bulk upserts all unfulfilled prayers with `qaza_completed_at = now()`

### Day Boundary (4 AM Rule)
- Between midnight and 3:59 AM, the system considers it still the previous evening
- Prayer logs for this period are assigned to the previous Gregorian day's `gregorian_date`
- This prevents a prayer logged at 1 AM from being attributed to the new day

---

## 5.4 Header Actions

The Namaz page has a 3-dot menu (visible on the header right slot) with:
- "Clear Qaza Namaz" — only enabled if there are unfulfilled missed prayers
- Confirmation dialog before executing

---

## 5.5 Data Hooks Used

| Hook | Purpose |
|---|---|
| `usePrayerLog` | Today's 6 prayers, toggle function, current/next prayer |
| `usePrayerTimes` | Prayer times from Aladhan API, current prayer window |
| `useMissedPrayers` | All missed prayers since account creation, fulfill function, clear all |
| `useTodayProgress` | Overall percentage for the meter |
| `useCalendar` | Current dates, location |

---

## Setup Prompt for Cursor

> "Build the Namaz screen from Document 5:
>
> 1. **Time-of-Day Card** header (reuse the component from Dashboard)
> 2. **Two tabs**: 'Today's Namaz' and 'Qaza Namaz'
> 3. **Today's Namaz**: 6 prayer cards with status indicators (upcoming/current/completed/missed), checkboxes, individual Hijri date labels
> 4. **Qaza Namaz**: Grouped by date, each prayer has an 'Ada' button, badge count on the tab
> 5. **Header menu**: 'Clear Qaza Namaz' action with confirmation
>
> Port `useMissedPrayers` hook. Key detail: prayer status is computed from Aladhan API times. The Maghrib split assigns different Hijri dates to daytime vs evening prayers. The 4 AM boundary rule ensures post-midnight prayers belong to the previous day."
