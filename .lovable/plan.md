

# React Native Migration Specification -- Approach

## Recommended Strategy: Layered Document + Page-by-Page Prompting

Rather than one massive spec document, structure the output as a **series of focused documents** that Cursor can consume incrementally. This mirrors how Cursor works best -- smaller, focused context windows produce better results than dumping everything at once.

## Document Structure

### Document 1: Foundation Setup (give to Cursor first)

Covers everything Cursor needs before building any screens:

**1.1 Project Overview**
- App name: Ibadat
- Purpose: Life OS for spiritual practices (namaz, goals/habits, community financial obligations)
- Backend: Supabase (shared with web app -- same project, same schema)

**1.2 Tech Stack**
- React Native (Expo recommended for faster setup)
- React Navigation for routing
- Supabase JS client (same `@supabase/supabase-js`)
- React Query (`@tanstack/react-query`) for data fetching
- Zustand or React Context for state (matching web patterns)

**1.3 Design System**
- Fonts: Bricolage Grotesque (headings), Inter (body)
- Three themes: Oudh (warm cream/green), Khalaf (monochrome B&W), Bhukur (dark/orange)
- Full HSL color tokens for each theme (exported from `src/index.css`)
- Geometry: pill-shaped buttons (`borderRadius: 9999`), `borderRadius: 16` for cards, `borderRadius: 24` for bottom sheets
- Typography scale: H1 = 36px normal weight, H2 = 20px normal weight, body = 14-16px, label-caps = 12px uppercase wide-tracked
- Icons: Iconoir library (React Native version: `iconoir-react-native`)

**1.4 Database Schema**
- Complete table definitions (profiles, goals, goal_completions, prayer_logs, admin_goals, admin_goal_completions, sabeels, due_payments, fmb_hubs, khumus, zakats, user_preferences, user_roles)
- All RLS policies (copy from current Supabase config)
- Database functions: `handle_new_user`, `owns_sabeel`, `has_role`, `update_updated_at_column`

**1.5 Authentication**
- Email/password signup and login
- Google OAuth
- Profile auto-creation via database trigger
- Session persistence with `@supabase/supabase-js` using AsyncStorage

**1.6 Core Logic Engines (copy as-is)**
These are pure TypeScript with zero web dependencies -- they can be dropped into React Native unchanged:
- `src/lib/hijri.ts` -- Bohra/Misri tabular Hijri calendar (JDN-based, deterministic)
- `src/lib/recurrence.ts` -- Goal recurrence engine (daily, weekly, interval, monthly, annual, one-time)
- `src/lib/calendarUtils.ts` -- Calendar formatting utilities

### Document 2: Navigation and Layout

**2.1 Navigation Structure**
```text
Auth Stack (unauthenticated):
  - Login Screen (/)
  - Signup Screen (/auth/signup)
  - Onboarding Flow (/auth/onboarding) [3 steps]

Main Tab Navigator (authenticated):
  - Today (home)
  - Namaz
  - [+] FAB (opens goal creation sheet)
  - Goals
  - Profile
```

**2.2 Bottom Tab Bar**
- 4 tabs + centered floating action button (FAB)
- Left: Today (Home icon), Namaz (Clock icon)
- Center: FAB (+) button, elevated with shadow
- Right: Goals (Archery icon), Profile (User icon)
- Frosted glass effect on tab bar (blur + transparency)

**2.3 Protected Routes**
- All main tabs require authentication
- Onboarding check: if `profiles.latitude` is null, redirect to onboarding
- Elan page: admin-only (check `user_roles` table), not in tab nav

### Document 3-7: Page-by-Page Specs

Each page document includes: screen layout, data hooks, user interactions, edge cases.

**Document 3: Auth Screens**
- Login: Arabic greeting header, Google OAuth button, email/password form, link to signup
- Signup: Full name, email, password, confirm password fields, Google OAuth
- Onboarding Step 1: Location selector (city dropdown from preset list + GPS option)
- Onboarding Step 2: Aspirations selection (pill toggles: Budget for Sabeel, Track Khums, Pray Quran Daily, Budget for FMB Hub, Create your own)
- Onboarding Step 3: Loading screen with Hadith quote, auto-creates selected goals, navigates to Goals or Today

**Document 4: Today (Dashboard)**
- Time-of-day gradient card (Fajr=blue, Zuhr=gold, Asr=amber, Maghrib=coral, Isha=purple)
- DateDisplay: Gregorian date + Hijri date + location
- DailyMeter: circular or bar progress showing prayers + goals completion percentage
- Current/Next prayer display with checkbox to mark complete
- Striped progress bar
- Today's Goals section: checklist of goals due today, overdue goals (red border), dynamic goals (with "Dynamic" badge)
- Empty states: new user vs returning user with no goals today

**Document 5: Namaz**
- Time-of-day gradient header (same as Today)
- Two tabs: "Today's Namaz" and "Qaza Namaz"
- Today's Namaz: 6 prayer cards (Fajr, Zuhr, Asr, Maghrib, Isha, Nisful Layl) with checkboxes
- Prayer status: upcoming, current, completed, missed (based on prayer times from Aladhan API)
- Prayer times fetched from Aladhan API using user's lat/long
- Hijri date split: Fajr/Zuhr/Asr use pre-Maghrib Hijri date, Maghrib/Isha/Nisful Layl use post-Maghrib Hijri date
- Qaza tab: retrospective scanner of all past days since profile creation, shows uncompleted prayers grouped by date
- Day boundary: 4 AM rollover for prayer log assignment

**Document 6: Goals**
- Header with "Add Goal" button and overflow menu (dynamic goals toggle)
- Goal list with drag-to-reorder (persisted via `user_preferences.goal_sort_order`)
- Each goal card: checkbox, title, description, recurrence badge, edit/delete actions
- Goal creation/edit bottom sheet: title, description, recurrence type selector, start/end date pickers, calendar type toggle (Hijri/Gregorian)
- Recurrence types: Daily, Weekly (day-of-week picker), Monthly (day-of-month + calendar type), Interval (every N days/weeks), Annual (month + day + calendar type), One-time (specific date)
- Dynamic goals: community goals from admin_goals table, marked with "Dynamic" badge, cannot be edited
- Overdue detection: looks back 7 days, shows uncompleted goals with date labels
- Completion anchored to pre-Maghrib Hijri date

**Document 7: Profile**
- Menu-style navigation: Account Information, Theme, Sign Out
- Account Information sub-screen: full name, email (read-only), location selector
- Theme sub-screen: visual theme picker (Oudh, Khalaf, Bhukur) with preview swatches
- Theme persisted to `profiles.theme` column

### Document 8: Shared Hooks Reference

A mapping of web hooks to their React Native equivalents. All hooks use the same Supabase queries -- the only changes are replacing web-specific APIs:

| Web Hook | RN Notes |
|---|---|
| `useAuth` | Replace `localStorage` with `AsyncStorage` for session |
| `useCalendar` | Replace `navigator.geolocation` with `expo-location` |
| `usePrayerTimes` | Same Aladhan API fetch, no changes |
| `usePrayerLog` | Same Supabase queries, no changes |
| `useGoals` | Same Supabase queries, no changes |
| `useGoalCompletions` | Same Supabase queries, no changes |
| `useMissedPrayers` | Same Supabase queries, no changes |
| `useTodayProgress` | Pure computation, no changes |
| `useOverdueGoals` | Same logic, no changes |
| `useDynamicGoals` | Same Supabase queries, no changes |
| `useUserPreferences` | Same Supabase queries, no changes |

## Suggested Cursor Workflow

1. **Prompt 1**: Give Document 1 (Foundation). Ask Cursor to set up the project, install dependencies, configure Supabase client, copy over the three logic engines, and set up the theme system.

2. **Prompt 2**: Give Document 2 (Navigation). Ask Cursor to build the navigation skeleton with placeholder screens.

3. **Prompts 3-7**: One page at a time. Give the page spec + reference the relevant hooks. Ask Cursor to build each screen.

4. **Prompt 8**: Polish pass -- animations, haptic feedback, push notifications (future).

## What I Can Generate

I can produce these documents as downloadable markdown files or as a single comprehensive spec. Given Cursor's context window, the **page-by-page approach with a shared foundation document** will produce the highest quality output.

Shall I proceed with generating these documents?

