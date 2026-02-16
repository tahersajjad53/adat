# Document 1: Foundation Setup

> Give this to Cursor FIRST. It covers project setup, design system, database schema, auth, and portable logic engines.

---

## 1.1 Project Overview

- **App name:** Ibadat
- **Purpose:** Life OS for Dawoodi Bohra spiritual practices — namaz tracking, goals/habits, community financial obligations (Sabeel, Khumus, Zakat, FMB Hub)
- **Backend:** Supabase (shared with web app — same project, same schema, same RLS policies)
- **Supabase Project ID:** `fdhvbedllcittetawrvt`
- **Supabase URL:** `https://fdhvbedllcittetawrvt.supabase.co`
- **Supabase Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkaHZiZWRsbGNpdHRldGF3cnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNzYzNjksImV4cCI6MjA4NTY1MjM2OX0.A5gAAs7uKGzTsdreFUXLFQ9x7RWqNv1RVcfChKrSpvE`

---

## 1.2 Tech Stack

| Layer | Library | Notes |
|---|---|---|
| Framework | React Native (Expo) | Use Expo Router or React Navigation |
| Supabase client | `@supabase/supabase-js` | Same package as web |
| Session storage | `@react-native-async-storage/async-storage` | Replaces `localStorage` |
| Data fetching | `@tanstack/react-query` | Same patterns as web |
| State management | React Context | Same pattern as web (AuthContext, CalendarContext, ThemeContext) |
| Icons | `iconoir-react-native` | Same icon names as web's `iconoir-react` |
| Location | `expo-location` | Replaces `navigator.geolocation` |

---

## 1.3 Design System

### Fonts

- **Headings:** Bricolage Grotesque (normal weight, tight tracking)
- **Body:** Inter (400, 500, 600)

Load via `expo-font` or `@expo-google-fonts/bricolage-grotesque` + `@expo-google-fonts/inter`.

### Typography Scale

| Token | Size | Weight | Extras |
|---|---|---|---|
| H1 | 36px | 400 (normal) | tight tracking (-0.02em) |
| H2 | 20px | 400 (normal) | tight tracking |
| Body | 16px | 400 | — |
| Body small | 14px | 400 | — |
| Label caps | 12px | 600 | uppercase, wide tracking (0.1em), muted color |

### Color Tokens (3 Themes)

All values are HSL. Convert to `hsl(H, S%, L%)` for React Native `StyleSheet`.

#### Theme: Oudh (default — warm cream & forest green)

```
background:           40 30% 94%     → hsl(40, 30%, 94%)    #ECE4D4-ish
foreground:           150 10% 15%
card:                 40 25% 97%
card-foreground:      150 10% 15%
primary:              160 45% 22%    → deep forest green
primary-foreground:   45 30% 96%
secondary:            40 20% 91%
secondary-foreground: 160 45% 22%
muted:                40 20% 90%
muted-foreground:     150 10% 40%
accent:               68 75% 55%     → lime green
accent-foreground:    160 50% 15%
destructive:          0 84% 60%
destructive-foreground: 0 0% 100%
border:               40 15% 82%
input:                40 15% 87%
```

#### Theme: Khalaf (minimalist monochrome)

```
background:           0 0% 100%      → pure white
foreground:           0 0% 10%
card:                 0 0% 98%
primary:              0 0% 20%       → charcoal
primary-foreground:   0 0% 100%
secondary:            0 0% 93%
muted:                0 0% 94%
muted-foreground:     0 0% 42%
accent:               215 20% 50%    → steel blue
accent-foreground:    0 0% 100%
destructive:          0 84% 60%
border:               0 0% 88%
```

#### Theme: Bhukur (dark with orange accents)

```
background:           0 0% 9%        → near-black
foreground:           0 0% 92%
card:                 0 0% 13%
primary:              24 85% 55%     → vibrant orange
primary-foreground:   0 0% 5%
secondary:            0 0% 18%
muted:                0 0% 16%
muted-foreground:     0 0% 55%
accent:               30 90% 50%     → warm orange
accent-foreground:    0 0% 5%
destructive:          0 75% 55%      → bright red (high contrast on dark)
border:               0 0% 20%
```

### Prayer Time Gradients

These are time-of-day gradients used on header cards:

| Prayer | Start Color | End Color |
|---|---|---|
| Fajr | `hsl(210, 50%, 42%)` | `hsl(200, 55%, 52%)` |
| Zuhr | `hsl(45, 85%, 55%)` | `hsl(35, 80%, 50%)` |
| Asr | `hsl(40, 75%, 50%)` | `hsl(25, 70%, 50%)` |
| Maghrib | `hsl(20, 85%, 55%)` | `hsl(350, 60%, 55%)` |
| Isha | `hsl(270, 50%, 35%)` | `hsl(250, 55%, 30%)` |
| Nisful Layl | `hsl(240, 55%, 25%)` | `hsl(230, 60%, 20%)` |

Direction: 135° (top-left to bottom-right). Use `expo-linear-gradient`.

### Geometry

| Element | Border Radius |
|---|---|
| Buttons, form inputs | `9999` (pill shape / `rounded-full`) |
| Multi-line textarea | `24` |
| Cards | `16` |
| Bottom sheets | `24` (top corners only) |
| Tab bar | Frosted glass (blur + transparency) |

### Progress Meter

- Track: `rgba(255, 255, 255, 0.2)` (on gradient backgrounds)
- Fill: theme's accent color
- Khalaf override: track `rgba(255, 255, 255, 0.35)`, fill `rgba(255, 255, 255, 0.9)`
- Striped pattern on fill: diagonal repeating stripes `rgba(255,255,255,0.2)`

---

## 1.4 Database Schema

The React Native app connects to the SAME Supabase project. No schema changes needed. Here are all tables:

### profiles

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid (PK) | No | — (matches auth.users.id) |
| full_name | text | Yes | — |
| city | text | Yes | — |
| latitude | numeric | Yes | — |
| longitude | numeric | Yes | — |
| timezone | text | Yes | — |
| theme | text | Yes | `'oudh'` |
| avatar_url | text | Yes | — |
| username | text | Yes | — |
| website | text | Yes | — |
| created_at | timestamptz | Yes | `now()` |
| updated_at | timestamptz | Yes | — |

**RLS:** Public SELECT for all. INSERT/UPDATE only own profile (`auth.uid() = id`). No DELETE.

### goals

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid (PK) | No | `gen_random_uuid()` |
| user_id | uuid | No | — |
| title | text | No | — |
| description | text | Yes | — |
| recurrence_type | text | No | `'daily'` |
| recurrence_days | int[] | Yes | — |
| recurrence_pattern | jsonb | Yes | — |
| due_date | date | Yes | — |
| start_date | date | No | `CURRENT_DATE` |
| end_date | date | Yes | — |
| sort_order | int | No | `0` |
| is_active | boolean | No | `true` |
| created_at | timestamptz | No | `now()` |
| updated_at | timestamptz | No | `now()` |

**RLS:** All operations restricted to `auth.uid() = user_id`.

### goal_completions

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid (PK) | No | `gen_random_uuid()` |
| user_id | uuid | No | — |
| goal_id | uuid (FK → goals) | No | — |
| completion_date | date | No | — (Hijri YYYY-MM-DD) |
| gregorian_date | date | No | — |
| completed_at | timestamptz | No | `now()` |

**RLS:** All operations restricted to `auth.uid() = user_id`.

### prayer_logs

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid (PK) | No | `gen_random_uuid()` |
| user_id | uuid | No | — |
| prayer | text | No | — (fajr/dhuhr/asr/maghrib/isha/nisfulLayl) |
| prayer_date | date | No | — (Hijri YYYY-MM-DD) |
| gregorian_date | date | No | — |
| completed_at | timestamptz | Yes | — |
| qaza_completed_at | timestamptz | Yes | — |
| created_at | timestamptz | No | `now()` |

**Unique constraint:** `(user_id, prayer_date, prayer)` — used for upsert conflict resolution.

**RLS:** All operations restricted to `auth.uid() = user_id`.

### admin_goals

Community goals published by admins. Same shape as `goals` but without `user_id`. Has `is_published` boolean.

**RLS:** SELECT allowed for admins OR if `is_published = true`. INSERT/UPDATE/DELETE require admin role.

### admin_goal_completions

Per-user completions of admin goals. Same shape as `goal_completions` but references `admin_goal_id` instead of `goal_id`.

**RLS:** INSERT/SELECT/DELETE restricted to `auth.uid() = user_id`. No UPDATE.

### user_preferences

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid (PK) | No | `gen_random_uuid()` |
| user_id | uuid | No | — (unique) |
| dynamic_goals_enabled | boolean | No | `false` |
| goal_sort_order | jsonb | Yes | `'[]'` |
| updated_at | timestamptz | No | `now()` |

**RLS:** INSERT/SELECT/UPDATE restricted to `auth.uid() = user_id`. No DELETE.

### user_roles

| Column | Type | Default |
|---|---|---|
| id | uuid (PK) | `gen_random_uuid()` |
| user_id | uuid | — |
| role | app_role enum (`'admin'` / `'user'`) | — |

**RLS:** SELECT own only. No INSERT/UPDATE/DELETE from client.

### Dues Tables (sabeels, fmb_hubs, khumus, zakats, due_payments)

These track financial obligations. See `src/types/dues.ts` for full type definitions. RLS uses `auth.uid() = user_id` for sabeels/due_payments, and `owns_sabeel(auth.uid(), sabeel_id)` for fmb_hubs/khumus/zakats.

### Database Functions

- `handle_new_user()` — Trigger on `auth.users` INSERT, auto-creates a `profiles` row
- `owns_sabeel(_user_id uuid, _sabeel_id uuid)` — Security definer function checking sabeel ownership
- `has_role(_user_id uuid, _role app_role)` — Security definer function checking user roles (avoids RLS recursion)
- `update_updated_at_column()` — Trigger function for auto-updating `updated_at`

---

## 1.5 Authentication

### Methods
1. **Email/password** — `supabase.auth.signUp()` / `supabase.auth.signInWithPassword()`
2. **Google OAuth** — `supabase.auth.signInWithOAuth({ provider: 'google' })`

### Session Persistence (React Native)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Important for RN
  },
});
```

### Auth Flow
1. User signs up → `handle_new_user` trigger creates a `profiles` row
2. Signup passes `full_name` in `options.data.full_name`
3. After login, check `profiles.latitude`: if `null`, redirect to onboarding
4. Auth state managed via `onAuthStateChange` listener (set up BEFORE `getSession()`)

### Signup Validation
- Full name: min 2 chars, max 100
- Email: valid format
- Password: min 6 chars
- Confirm password: must match

---

## 1.6 Core Logic Engines (Copy As-Is)

These are pure TypeScript files with ZERO web/DOM dependencies. Copy them directly into the React Native project.

### `hijri.ts` — Bohra/Misri Tabular Hijri Calendar

**Purpose:** Deterministic conversion between Gregorian and Dawoodi Bohra Hijri calendar using Julian Day Number (JDN).

**Key exports:**
- `gregorianToBohra(date, timezone?)` — Primary conversion function
- `advanceHijriDay(hijri)` — Advance by 1 day (leap-year aware)
- `isAfterMaghrib(currentTime, maghribTime, timezone?)` — Check if past Maghrib
- `getAdjustedHijriDate(currentTime, maghribTime, timezone?)` — Returns `DualDate` with pre/post Maghrib Hijri dates
- `formatHijriDate(hijri, format)` — Format for display
- `formatHijriDateKey(hijri)` — Format as `YYYY-MM-DD` for database keys

**Key concepts:**
- Epoch JDN: `1948439` (1 Moharram 1 AH)
- 30-year cycle = 10631 days (19 normal + 11 leap years)
- Leap year positions in cycle: `[2, 5, 8, 10, 13, 16, 19, 21, 24, 27, 29]`
- Month lengths: odd months = 30 days, even months = 29 days, Zilhaj = 30 in leap years
- Maghrib transition: day advances at Maghrib. Between midnight and 4 AM, still considered "after Maghrib" of the previous Gregorian day.

**Web dependency note:** Uses `Intl.DateTimeFormat` for timezone handling — this IS available in React Native (Hermes engine supports it).

### `recurrence.ts` — Goal Recurrence Engine

**Purpose:** Determines if a goal is due on a specific date based on its recurrence pattern.

**Key exports:**
- `isGoalDueOnDate(goal, hijriDate, gregorianDate)` — Core check
- `getGoalsDueOnDate(goals, hijriDate, gregorianDate)` — Filter array
- `getRecurrenceDescription(goal)` — Human-readable label
- `findOverdueGoals(goals, today, ...)` — Look back N days for missed goals
- `findAllMissedDatesForGoal(goal, today, ...)` — All missed dates for batch completion
- `getOverdueDateLabel(dueDate, today)` — "Yesterday" or "8 Feb"

**Recurrence types:**
- `daily` — Every day
- `weekly` — Specific days of week (0=Sun ... 6=Sat), stored in `recurrence_days[]`
- `custom` with `pattern.type = 'interval'` — Every N days/weeks from start_date
- `custom` with `pattern.type = 'monthly'` — Specific day of month (Hijri or Gregorian)
- `annual` with `pattern.type = 'annual'` — Specific month + day (Hijri or Gregorian)
- `one-time` — Specific Gregorian date in `due_date`

**RecurrencePattern shape:**
```typescript
interface RecurrencePattern {
  type: 'interval' | 'monthly' | 'annual';
  interval?: number;           // Every N days/weeks
  intervalUnit?: 'days' | 'weeks';
  monthlyDay?: number;         // Day of month (1-30)
  calendarType?: 'hijri' | 'gregorian';
  annualMonth?: number;        // Month number (1-12)
}
```

### `calendarUtils.ts` — Calendar Formatting Utilities

**Purpose:** Dual calendar support for the Dues module (reminder calculations, month/year formatting).

**Key exports:**
- `shouldShowReminder(...)` — Check if a financial reminder should display
- `calculateUrgency(...)` — Returns `'upcoming' | 'due_today' | 'overdue'`
- `formatDueDate(...)` — Format due date per calendar type
- `getMonthOptions(calendarType)` — Dropdown options for month selectors
- `getYearOptions(calendarType, ...)` — Dropdown options for year selectors
- `isDueInActiveRange(...)` — Check if a due is within its active period

**Web dependency note:** No DOM dependencies. Uses standard `Date` object only.

---

## 1.7 Preset Cities Data

The app includes a preset list of ~40 cities for the location selector. Copy `src/data/cities.ts` as-is. Each city has:
```typescript
interface City {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
}
```

Regions covered: Holy Cities (Mecca, Medina), India, Pakistan, Sri Lanka, Middle East, Africa, UK/Europe, North America, Asia Pacific.

Country flag emojis are mapped via `COUNTRY_FLAGS` record.

---

## Setup Prompt for Cursor

> "Create a new Expo project called `ibadat-mobile`. Install these dependencies: `@supabase/supabase-js`, `@react-native-async-storage/async-storage`, `@tanstack/react-query`, `iconoir-react-native`, `expo-location`, `expo-linear-gradient`, `expo-font`, `@expo-google-fonts/bricolage-grotesque`, `@expo-google-fonts/inter`.
>
> Set up the Supabase client using AsyncStorage for session persistence (see spec §1.5).
>
> Create a theme system with 3 themes (Oudh, Khalaf, Bhukur) using React Context. Store the active theme name and provide a `setTheme` function. Each theme has the color tokens defined in spec §1.3.
>
> Copy these files from the web project into `src/lib/`: `hijri.ts`, `recurrence.ts`, `calendarUtils.ts`. Also copy `src/data/cities.ts` and `src/types/goals.ts`, `src/types/adminGoals.ts`, `src/types/dues.ts`. These are pure TypeScript with no web dependencies."
