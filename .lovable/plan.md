

# Add New Zealand to City List

## Overview
Add New Zealand cities to the location selector used during onboarding sign-up.

## Changes

### Edit: `src/data/cities.ts`

1. Add New Zealand cities to the `CITIES` array (under Asia Pacific section):
   - Auckland (latitude: -36.8485, longitude: 174.7633, timezone: Asia/Auckland)
   - Wellington (latitude: -41.2865, longitude: 174.7762, timezone: Pacific/Auckland)

2. Add the New Zealand flag emoji to `COUNTRY_FLAGS`:
   - `NZ: '🇳🇿'`

## Files
- **Edit**: `src/data/cities.ts` -- add NZ cities and flag

