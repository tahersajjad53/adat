

# Onboarding & Profile Management Implementation

## Overview

Adding location selection during onboarding and a profile management page, using a curated list of major cities including Sri Lanka.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/data/cities.ts` | Curated city list with coordinates (including Sri Lanka) |
| `src/pages/Onboarding.tsx` | Post-signup location selection step |
| `src/pages/Profile.tsx` | Profile settings page |
| `src/components/profile/LocationSelector.tsx` | Searchable city selector with GPS option |

---

## Cities Data (src/data/cities.ts)

Curated list organized by region, including:

**India:** Mumbai, Surat, Ahmedabad, Vadodara, Udaipur, Ujjain, Indore, Delhi, Bangalore, Chennai, Hyderabad, Kolkata, Pune

**Pakistan:** Karachi

**Sri Lanka:** Colombo, Kandy

**Middle East:** Dubai, Abu Dhabi, Sharjah, Muscat, Bahrain, Kuwait City, Doha, Riyadh, Jeddah

**Africa:** Nairobi, Mombasa, Dar es Salaam, Cairo

**UK/Europe:** London, Manchester, Birmingham, Paris

**North America:** New York, Chicago, Los Angeles, Houston, Toronto, Vancouver

**Asia Pacific:** Singapore, Hong Kong, Sydney, Melbourne

**Holy Cities:** Mecca, Medina

Each city includes: `id`, `name`, `country`, `countryCode`, `latitude`, `longitude`, `timezone`

---

## LocationSelector Component

Features:
- Uses existing Command component (cmdk) for searchable dropdown
- Groups cities by country with flag emoji
- "Use my current location" button with GPS icon
- Loading state while fetching GPS coordinates
- Shows selected city prominently

---

## Onboarding Page (src/pages/Onboarding.tsx)

Design:
- Reuses AuthLayout for consistent styling with login/signup
- Welcome message with user's name
- Clear explanation: "Select your location for accurate prayer times"
- LocationSelector component
- "Continue to Dashboard" button
- Optional "Skip" link (defaults to Mecca)

---

## Profile Page (src/pages/Profile.tsx)

Sections:
1. **Personal Info** - Full name (editable)
2. **Location Settings** - LocationSelector component
3. **Prayer Times Preview** - Shows current Maghrib time for selected location
4. **Account Info** - Email (read-only)

Features:
- Save button with loading state
- Success toast on save
- Navigation back to dashboard

---

## Routing Updates (src/App.tsx)

New routes:
- `/auth/onboarding` - Protected, shows after signup
- `/profile` - Protected, accessible from dashboard

---

## Onboarding Redirect Logic

Update Dashboard.tsx to check if user needs onboarding:
- Fetch profile on load
- If `latitude` is null/undefined, redirect to `/auth/onboarding`
- This ensures new users complete location setup

---

## Dashboard Header Update

Add profile link:
- User icon/avatar next to sign out button
- Links to `/profile` page

---

## Implementation Order

1. Create `src/data/cities.ts` with curated city list
2. Create `src/components/profile/LocationSelector.tsx` 
3. Create `src/pages/Onboarding.tsx`
4. Create `src/pages/Profile.tsx`
5. Update `src/App.tsx` with new routes
6. Update `src/pages/Dashboard.tsx` with onboarding check and profile link

