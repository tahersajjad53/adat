# Document 7: Profile Screen

> User account management, theme selection, and sign-out.

---

## 7.1 Main Menu

```
┌──────────────────────────┐
│ Profile                  │  ← H1, display font
│ Manage your account      │  ← Subtitle, muted
│ settings.                │
│                          │
│ ┌──────────────────────┐ │
│ │ 👤 Account Info    → │ │  ← Tappable card/row
│ │    Name, email, and  │ │
│ │    location settings │ │
│ └──────────────────────┘ │
│                          │
│ ┌──────────────────────┐ │
│ │ ✏️ Theme            → │ │  ← Tappable card/row
│ │    Choose your       │ │
│ │    visual style      │ │
│ └──────────────────────┘ │
│                          │
│ ┌──────────────────────┐ │
│ │ 🚪 Sign Out          │ │  ← Destructive color
│ └──────────────────────┘ │
└──────────────────────────┘
```

### Menu Items
Each item is a full-width card with:
- Icon (Iconoir): `User`, `DesignPencil`, `LogOut`
- Primary text (font-medium)
- Description text (text-sm, muted-foreground)
- Right arrow `NavArrowRight` for navigable items
- Cards have `borderRadius: 16`, border, card background
- Hover/press state: slightly muted background

### Sign Out
- Uses destructive color (red text)
- No arrow (it's an action, not navigation)
- `supabase.auth.signOut()`
- In Bhukur theme: bright red `hsl(0, 75%, 55%)` for visibility

---

## 7.2 Account Information Sub-Screen

Navigate here by tapping "Account Information" from the menu.

```
┌──────────────────────────┐
│ ← Back                   │  ← Back button to menu
│                          │
│ Account Information      │  ← H1
│ Manage your personal     │
│ details and location.    │
│                          │
│ ┌──────────────────────┐ │
│ │ Full Name            │ │
│ │ [Husain Bohra____]   │ │  ← Editable input
│ │                      │ │
│ │ Email                │ │
│ │ [user@email.com ]    │ │  ← Read-only, muted bg
│ │ Email cannot be      │ │
│ │ changed.             │ │
│ └──────────────────────┘ │
│                          │
│ ┌──────────────────────┐ │
│ │ Location             │ │  ← Sub-header
│ │ Your location is     │ │
│ │ used to calculate    │ │
│ │ accurate prayer      │ │
│ │ times.               │ │
│ │                      │ │
│ │ [City Dropdown ▼]    │ │  ← Same LocationSelector as onboarding
│ │ [📍 Use GPS]         │ │
│ └──────────────────────┘ │
│                          │
│ [💾 Save Changes]        │  ← Primary button, full width
└──────────────────────────┘
```

### Data Flow
- Fetch profile on mount: `full_name, latitude, longitude, city, timezone`
- Match existing coordinates to preset cities, or show as custom GPS
- Save: `supabase.from('profiles').upsert({ id, full_name, latitude, longitude, city, timezone, updated_at })`
- Toast: "Profile updated. Your changes have been saved successfully."

---

## 7.3 Theme Sub-Screen

Navigate here by tapping "Theme" from the menu.

```
┌──────────────────────────┐
│ ← Back                   │
│                          │
│ Theme                    │  ← H1
│ Choose your visual       │
│ style.                   │
│                          │
│ ┌────┐  ┌────┐  ┌────┐  │  ← 3 theme swatches in a row
│ │Oudh│  │Khlf│  │Bhkr│  │
│ │ ██ │  │ ██ │  │ ██ │  │  ← Color preview
│ │ ▬▬ │  │ ▬▬ │  │ ▬▬ │  │  ← Primary color bar
│ │ ── │  │ ── │  │ ── │  │  ← Accent color bar
│ │ ✓  │  │    │  │    │  │  ← Active indicator
│ └────┘  └────┘  └────┘  │
└──────────────────────────┘
```

### Theme Swatches

| Theme | BG Color | Primary Bar | Accent Bar |
|---|---|---|---|
| Oudh | `hsl(40, 30%, 94%)` | `hsl(160, 45%, 22%)` | `hsl(68, 75%, 55%)` |
| Khalaf | `hsl(0, 0%, 100%)` | `hsl(0, 0%, 20%)` | `hsl(215, 20%, 50%)` |
| Bhukur | `hsl(0, 0%, 9%)` | `hsl(24, 85%, 55%)` | `hsl(30, 90%, 50%)` |

### Swatch Card
- `borderRadius: 16`
- Border: 2px
- Active state: primary color border + ring shadow
- Check indicator: small circle with `Check` icon in top-right
- Layout: bg color fills top area, primary bar below, accent bar at bottom
- Label below swatch

### Data Flow
- Set theme via `ThemeContext.setTheme(themeName)`
- Persists to `profiles.theme` column
- Applied globally: all components read from theme context

---

## 7.4 Data Hooks Used

| Hook | Purpose |
|---|---|
| `useAuth` | User info, signOut function |
| `useTheme` | Current theme, setTheme |
| Supabase direct | Profile fetch/update |

---

## Setup Prompt for Cursor

> "Build the Profile screen from Document 7:
>
> 1. **Main menu** with 3 tappable cards: Account Information (→ sub-screen), Theme (→ sub-screen), Sign Out (destructive action).
> 2. **Account Information sub-screen**: editable name, read-only email, location selector (same as onboarding), save button.
> 3. **Theme sub-screen**: 3 visual swatches (Oudh, Khalaf, Bhukur) with color previews. Tapping a swatch activates that theme. Show check indicator on active theme.
>
> Use stack navigation within the Profile tab for sub-screens (or in-component state for simple toggling). Theme selection persists to `profiles.theme` and updates the ThemeContext."
