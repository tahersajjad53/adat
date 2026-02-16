# Document 2: Navigation & Layout

> Give this to Cursor AFTER the foundation is set up. Builds the navigation skeleton with placeholder screens.

---

## 2.1 Navigation Structure

```
Root Navigator (conditional):
├── Auth Stack (when no session)
│   ├── Login Screen
│   ├── Signup Screen
│   └── Onboarding Flow (3 steps, protected)
│
└── Main Tab Navigator (when authenticated)
    ├── Today (Home)
    ├── Namaz
    ├── [+] FAB (not a tab — floating action button)
    ├── Goals
    └── Profile
```

### Auth Stack
- Uses Stack Navigator
- No tab bar visible
- Screens: `Login`, `Signup`, `Onboarding`

### Main Tab Navigator
- Uses Bottom Tab Navigator
- Custom tab bar component (frosted glass)
- 4 actual tabs + 1 centered FAB button

---

## 2.2 Bottom Tab Bar

### Layout
```
┌─────────────────────────────────────────┐
│  Today   Namaz   [+]   Goals   Profile  │
│  🏠       🕐     ⊕     🎯      👤      │
└─────────────────────────────────────────┘
```

### Tab Items

| Position | Label | Icon (Iconoir) | Route |
|---|---|---|---|
| Left 1 | Today | `Home` | `/today` |
| Left 2 | Namaz | `Clock` | `/namaz` |
| Center | — | `Plus` | Opens goal creation sheet (not a route) |
| Right 1 | Goals | `Archery` | `/goals` |
| Right 2 | Profile | `User` | `/profile` |

### Tab Bar Styling
- **Background:** `background/40` (40% opacity of theme background)
- **Effect:** `backdrop-blur-xl` + `backdrop-saturate-150` (frosted glass)
- Use `expo-blur` `BlurView` for the frosted effect
- **Border:** subtle top border at `border/50` opacity
- **Shadow:** `0 -1px 12px rgba(0,0,0,0.06)` upward shadow
- **Safe area:** Add `paddingBottom` for device safe area (use `useSafeAreaInsets`)
- **Height:** 64px + safe area padding

### FAB Button (Center)
- Circular, 48x48
- Elevated: `-marginTop: 20` (floats above the tab bar)
- Background: theme `primary`
- Icon: `Plus` in `primary-foreground`, strokeWidth 2.5
- Shadow: `elevation: 8` (Android) / `shadowRadius: 8` (iOS)
- Active state: scale down to 0.95 on press

### Tab Item States
- **Inactive:** `muted-foreground` color
- **Active:** `foreground` color
- Text size: 12px (xs)
- Icon size: 20x20 (h-5 w-5)
- Layout: icon above label, centered, full height

---

## 2.3 Protected Routes / Auth Guard

### Authentication Check
```
On app launch:
1. Check for existing Supabase session (AsyncStorage)
2. If session exists → show Main Tab Navigator
3. If no session → show Auth Stack
4. Listen to onAuthStateChange for live updates
```

### Onboarding Check
```
After authentication:
1. Fetch profiles.latitude for the current user
2. If latitude is NULL → redirect to Onboarding screen
3. If latitude exists → proceed to Main Tab Navigator
```

This check happens in the Dashboard (Today) screen. If `profiles.latitude` is null, navigate to `/auth/onboarding` replacing the current route.

### Admin-Only Route
- The `Elan` page (admin goal management) is NOT in the bottom tab navigator
- Access it via a hidden mechanism (e.g., long-press on profile, or a menu item visible only to admins)
- Check admin status: query `user_roles` table for `role = 'admin'`
- Use the `has_role` database function for RLS

---

## 2.4 Header Bar

### Structure
- **Center:** Ibadat logo (SVG)
- **Right:** Page-specific action slot (e.g., 3-dot menu on Goals/Namaz pages)
- **Left:** Empty (or back button on sub-screens like Profile > Account)

### Logo Behavior by Theme
- **Oudh:** Native forest green color (`#005240`)
- **Khalaf:** Pure black (apply desaturation filter)
- **Bhukur:** Orange tinted (match primary color)
- **On dark backgrounds** (sidebar, gradient cards): Always white

---

## Setup Prompt for Cursor

> "Using the foundation from Document 1, set up navigation:
>
> 1. Create an Auth Stack with placeholder Login, Signup, and Onboarding screens
> 2. Create a Main Tab Navigator with placeholder Today, Namaz, Goals, and Profile screens
> 3. Build a custom bottom tab bar component matching the spec (frosted glass, 4 tabs + centered FAB)
> 4. Add an auth guard: if no Supabase session → Auth Stack; if session → Tab Navigator
> 5. The FAB button should accept an `onPress` prop (will open goal creation sheet later)
>
> Use `expo-blur` for the frosted glass effect. Use `useSafeAreaInsets` for bottom padding. Icons come from `iconoir-react-native`."
