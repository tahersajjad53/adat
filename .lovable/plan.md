

# Add Christchurch to City List

## Problem
Christchurch, New Zealand is not available as a city option. Users selecting Auckland or Wellington get prayer times calculated for those cities' coordinates, which don't match Christchurch due to its different latitude and longitude.

## Solution
Add a Christchurch entry to the cities list in `src/data/cities.ts`.

## Details

**File**: `src/data/cities.ts`

Add after the Wellington entry (line 75):

```
{ id: 'christchurch', name: 'Christchurch', country: 'New Zealand', countryCode: 'NZ', latitude: -43.5321, longitude: 172.6362, timezone: 'Pacific/Auckland' }
```

**Why times differ**: Christchurch is ~2.5 degrees further south and ~2 degrees different in longitude compared to Wellington. At southern latitudes, even small coordinate differences cause noticeable shifts in prayer times (especially Fajr and Isha). Each city needs its own coordinates for accurate calculations via the Aladhan API.

No other files need changes -- the location selector already dynamically reads from the `CITIES` array, and the `NZ` country flag is already configured.
