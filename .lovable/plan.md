

# Improve Account Information Layout

## Overview

Reorganize the Account Information section by clustering related fields into visually distinct groups with appropriate spacing, and remove the Prayer Times Preview box.

## Changes

### File: `src/pages/Profile.tsx`

**Remove Prayer Times Preview**
- Delete the entire conditional section that renders the "Prayer Times Preview" box (the `section` with Maghrib time display)
- Remove the `maghribTime` state and the `useEffect` that calls `fetchMaghribTime` since they're no longer needed
- Remove the `fetchMaghribTime` import

**Cluster Layout**
Wrap related fields in grouped containers with consistent internal spacing and vertical gaps between groups:

1. **Personal Details cluster** -- Full Name + Email fields grouped together in a bordered rounded card-like container with internal padding
2. **Location cluster** -- Location heading, description, LocationSelector, and GPS coordinates grouped in a separate bordered rounded container

```text
[Back]

Account Information
Manage your personal details and location.

+----------------------------------+
|  Full Name                       |
|  [___________________________]   |
|                                  |
|  Email                           |
|  [user@email.com         ]       |
|  Email cannot be changed.        |
+----------------------------------+

+----------------------------------+
|  Location                        |
|  Your location is used to...     |
|                                  |
|  [Location Selector]             |
|  GPS coords (if custom)          |
+----------------------------------+

[ Save Changes ]
```

- Each cluster uses `rounded-xl border border-border bg-card p-4 space-y-3` for a card-like grouping
- Gap between clusters: `space-y-4` on the parent
- Remove the standalone `section` wrappers and `h2` for Location -- fold the heading into the cluster card instead

## Files Changed

- `src/pages/Profile.tsx` -- restructure account section layout, remove prayer preview and related state/imports

