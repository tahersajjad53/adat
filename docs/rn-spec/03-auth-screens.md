# Document 3: Auth Screens

> Page-by-page spec for Login, Signup, and Onboarding screens.

---

## 3.1 Login Screen

### Layout
```
┌──────────────────────────┐
│ [Logo - top left mobile] │
│                          │
│ السَّلَامُ عَلَيْكُمْ        │  ← Arabic greeting, H1 size, primary color, display font
│ Track prayers, manage    │  ← Subtitle in muted-foreground
│ dues, and cultivate      │
│ daily habits             │
│                          │
│ [🔵 Continue with Google]│  ← Outline button, full width, Google SVG icon
│                          │
│ ──── or ────             │  ← Separator with "or" text
│                          │
│ Email                    │
│ [________________]       │  ← Pill-shaped input
│ Password                 │
│ [________________👁]     │  ← Pill-shaped input with show/hide toggle
│                          │
│ [    Sign In     ]       │  ← Primary button, full width, pill-shaped
│                          │
│ Don't have an account?   │
│ Create one               │  ← Link to Signup
│                          │
│ Designed for Dawoodi     │  ← Footer, 10px uppercase, wide tracking
│ Bohras                   │
└──────────────────────────┘
```

### Desktop Layout (iPad / Large screens)
- Split screen: left half shows splash image with gradient overlay and branding
- Right half shows the form
- Left panel: Ibadat logo (white), tagline "Your Companion for Consistent Ibadat", Lisan-ud-Dawat subtitle "عبادة ني پابندي ما ساتهي"

### Data Flow
- `supabase.auth.signInWithPassword({ email, password })`
- On error: show toast with error message
- On success: auth state change listener handles navigation
- If user is already logged in: redirect to `/today`

### Validation
- Email: valid format (trimmed)
- Password: min 6 characters

### Google OAuth
- `supabase.auth.signInWithOAuth({ provider: 'google' })`
- For React Native, use `expo-auth-session` or Supabase's `signInWithOAuth` with a redirect URL scheme

---

## 3.2 Signup Screen

### Layout
Same structure as Login but with additional fields:

```
┌──────────────────────────┐
│ Create Account           │  ← H1, display font
│ Start your journey       │  ← Subtitle
│ towards a more organized │
│ spiritual life           │
│                          │
│ [🔵 Continue with Google]│
│ ──── or ────             │
│                          │
│ Full Name                │
│ [________________]       │
│ Email                    │
│ [________________]       │
│ Password                 │
│ [________________👁]     │
│ Confirm Password         │
│ [________________👁]     │
│                          │
│ [  Create Account  ]     │
│                          │
│ Already have an account? │
│ Sign in                  │  ← Link to Login
└──────────────────────────┘
```

### Data Flow
- `supabase.auth.signUp({ email, password, options: { data: { full_name } } })`
- On success: show toast "Account created. Please check your email to verify your account."
- The `handle_new_user` database trigger auto-creates a `profiles` row with the `full_name`

### Validation
- Full name: min 2 chars, max 100
- Email: valid format
- Password: min 6 chars
- Confirm password: must match password

---

## 3.3 Onboarding (3 Steps)

### Step 1: Location Selection

```
┌──────────────────────────┐
│ Welcome, {name}! 👋     │  ← H2, display font. Name from profile or email prefix
│ Select your location to  │
│ get accurate prayer      │
│ times...                 │
│                          │
│ [City Dropdown ▼]        │  ← Searchable dropdown with preset cities
│ [📍 Use GPS]             │  ← Button to request device location
│                          │
│ 📍 Using GPS: 19.0760,   │  ← Shown if GPS selected
│    72.8777               │
│                          │
│ [    Continue    ]        │  ← Disabled until location selected
│ Skip for now             │  ← Defaults to Mecca
│ (defaults to Mecca)      │
└──────────────────────────┘
```

**Data Flow:**
- City selection: uses preset `CITIES` array from `src/data/cities.ts`
- GPS: use `expo-location` (`requestForegroundPermissionsAsync` + `getCurrentPositionAsync`)
- On Continue: saves to `profiles` table: `{ latitude, longitude, city, timezone }`
- Skip: saves Mecca coordinates

### Step 2: Aspirations (اُمّید)

```
┌──────────────────────────┐
│ اُمّید                    │  ← H1, display font (Urdu for "Aspirations")
│ What would you like to   │
│ focus on?                │
│                          │
│ [Budget for Sabeel ✕]    │  ← Pill toggle buttons
│ [Track Khums      +]    │  ← Selected: primary bg, unselected: outline
│ [Pray Quran Daily +]    │  ← Each shows + or ✕ icon
│ [Budget for FMB Hub+]   │
│                          │
│ [+ Create your own]      │  ← Dashed border pill button
│                          │
│ [    Continue    ]        │  ← Creates selected goals, goes to Step 3
│ Skip for now             │  ← Goes to Step 3 with no goals
└──────────────────────────┘
```

**Data Flow:**
- Toggle buttons are multi-select
- "Create your own" button: saves any selected preset goals, then navigates to `/goals?new=1`
- Goals page reads `?new=1` query param and auto-opens the goal creation form

**Goal Templates Created:**

| Aspiration | Goal Title | Recurrence |
|---|---|---|
| Budget for Sabeel | "Budget for Sabeel" | Monthly, 1st of Hijri month |
| Track Khums | "Track Khums" | Monthly, 1st of Hijri month |
| Pray Quran Daily | "Pray Quran" | Daily |
| Budget for FMB Hub | "Budget for FMB Hub" | Monthly, 1st of Hijri month |

Monthly goals use: `recurrence_type: 'custom'`, `recurrence_pattern: { type: 'monthly', monthlyDay: 1, calendarType: 'hijri' }`

### Step 3: Loading / Transition

```
┌──────────────────────────┐
│                          │
│         ⟳               │  ← Spinning refresh icon
│                          │
│ "The bane of ibadat      │  ← Italic, muted-foreground
│  is listlessness"        │
│ — Al-Hadith              │  ← Smaller, muted
│                          │
└──────────────────────────┘
```

**Data Flow:**
- Inserts selected goals into `goals` table
- Waits 2 seconds (deliberate pause for the quote)
- Navigates to `/goals` if aspirations were selected, `/today` otherwise

---

## Setup Prompt for Cursor

> "Build the 3 auth screens from Document 3:
>
> 1. **Login**: Arabic greeting header, Google OAuth button, email/password form with show/hide password toggle, link to Signup. Use pill-shaped inputs and buttons.
> 2. **Signup**: Full name, email, password, confirm password fields. Google OAuth. Validation with error messages.
> 3. **Onboarding**: 3-step flow — (a) Location selector with city dropdown + GPS option, (b) Aspirations multi-select with pill toggles, (c) Loading screen with Hadith quote.
>
> Use the Supabase client for auth operations. The city list comes from `src/data/cities.ts`. For GPS, use `expo-location`. Connect to the AuthContext for state management."
