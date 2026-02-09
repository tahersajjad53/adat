

# Update Missed Namaz Tab Label and Remove Qaza Count

## Changes

### 1. `src/pages/Namaz.tsx`
- Rename the tab trigger text from "Missed Namaz" to "Qaza Namaz"

### 2. `src/components/namaz/MissedPrayersList.tsx`
- Remove the "qaza count" div at the top of the list (lines showing "{count} qaza" or "All prayers fulfilled!")
- This info is now redundant since the tab badge already shows the count and the tab name says "Qaza"

