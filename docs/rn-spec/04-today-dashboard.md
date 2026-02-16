# Document 4: Today (Dashboard) Screen

> The home screen showing prayer status, daily progress, and today's goals.

---

## 4.1 Screen Structure

```
┌──────────────────────────┐
│ [Time-of-Day Card]       │  ← Gradient card based on current prayer
│ ┌──────────────────────┐ │
│ │ Sun, 16 Feb 2026     │ │  ← Gregorian date, white text
│ │ 17 Shaban 1447 AH    │ │  ← Hijri date, white text
│ │ Mumbai               │ │  ← City name
│ │                 72%  │ │  ← Daily meter (circular or text)
│ │ ▓▓▓▓▓▓▓▓▓░░░░       │ │  ← Striped progress bar
│ │                      │ │
│ │ CURRENT NAMAZ        │ │  ← Label caps style
│ │ ☀️ Zuhr      12:15   │ │  ← Prayer icon + name + time
│ │              ☑️       │ │  ← Checkbox to mark complete
│ └──────────────────────┘ │
│                          │
│ TODAY'S GOALS   Ada: 2/4 │  ← Section header with progress
│ ┌──────────────────────┐ │
│ │ ☑ Pray Quran         │ │  ← Completed goal
│ │ ☐ Budget for Sabeel  │ │  ← Uncompleted goal
│ │ ☐ Dynamic: Recite... │ │  ← Dynamic goal with badge
│ └──────────────────────┘ │
│                          │
│ OVERDUE                  │  ← Only shown if overdue goals exist
│ ┌──────────────────────┐ │
│ │ ⚠ Track Khums        │ │  ← Red border card
│ │   Yesterday          │ │  ← Date label
│ └──────────────────────┘ │
│                          │
│ [No goals today?]        │  ← Empty state with CTA
└──────────────────────────┘
```

---

## 4.2 Time-of-Day Card

### Gradient Selection
The card background gradient changes based on the current prayer window:

```typescript
const GRADIENT_MAP = {
  fajr:    ['hsl(210,50%,42%)', 'hsl(200,55%,52%)'],
  dhuhr:   ['hsl(45,85%,55%)',  'hsl(35,80%,50%)'],
  asr:     ['hsl(40,75%,50%)',  'hsl(25,70%,50%)'],
  maghrib: ['hsl(20,85%,55%)',  'hsl(350,60%,55%)'],
  isha:    ['hsl(270,50%,35%)', 'hsl(250,55%,30%)'],
};
// Before Fajr or null → use Isha gradient
```

Use `expo-linear-gradient` with `start={[0,0]}` `end={[1,1]}` (135° equivalent).

### Date Display
- Line 1: Gregorian date — `"Sunday, 16 February 2026"` (long format)
- Line 2: Hijri date — `"17 Shaban 1447 AH"` (from `formatHijriDate(currentDate.hijri, 'long')`)
- Line 3: City name (from `location.city`)
- All text white

### Daily Meter
- Shows overall completion percentage
- Format: `"72%"` or a small circular progress indicator
- Text: white, label-caps style for "ADA" label

### Striped Progress Bar
- Track: `rgba(255, 255, 255, 0.2)`, height 8px, rounded
- Fill: theme accent color, same height, rounded
- Stripe pattern on fill: diagonal repeating `rgba(255,255,255,0.2)` stripes at 135°
- Width animates based on `overallPercentage`

### Current/Next Prayer Display
- If there's a `currentPrayer`: show "CURRENT NAMAZ" label
- If no current but there's a `nextPrayer`: show "NEXT NAMAZ" label  
- If neither (e.g., after Isha with no next): show "Reflect, rest, renew."
- Prayer icon: ☀️ (SunLight) for daytime prayers, 🌙 (HalfMoon) for evening
- Prayer name in H2 size, white, display font
- Time in body size, white/80% opacity
- Checkbox to mark prayer complete (white border, 24x24)
- If already completed: show ✓ Done badge + checked box

### Set Location Button
- Only shown if `location.city` is falsy
- Outline style with white/30% border
- "📍 Set your location" text

---

## 4.3 Today's Goals Section

### Header
- "TODAY'S GOALS" in label-caps style
- "Ada: X/Y" progress counter (Ada = completion in Arabic/Urdu context)

### Goal Checklist
Each goal is a row:
- Checkbox (accent color when checked)
- Title
- If dynamic goal: show "Dynamic" badge (small pill, muted style)
- Tap checkbox to toggle completion

### Overdue Goals
- Only shown if there are overdue goals (lookback: 7 days)
- Each overdue goal has a red/destructive border
- Shows the date label: "Yesterday" or "8 Feb"
- Tapping the checkbox batch-completes all missed dates for that goal

### Empty States
1. **New user with no goals:** 
   - Hadith quote: *"He who is mindful of the journey's distance prepares for it."*
   - CTA button: "Create your first goal" (opens goal form sheet)

2. **User with goals but none due today:**
   - Simple message indicating no goals are due

---

## 4.4 Onboarding Redirect

On mount, the Dashboard checks:
```typescript
const profile = await supabase.from('profiles').select('latitude').eq('id', user.id).maybeSingle();
if (profile.latitude === null) {
  navigate('/auth/onboarding');
}
```

---

## 4.5 Data Hooks Used

| Hook | Purpose |
|---|---|
| `usePrayerLog` | Today's 6 prayers with completion status, toggle function |
| `usePrayerTimes` | Aladhan API times, current prayer window detection |
| `useTodayProgress` | Combined prayer + goal completion percentage |
| `useGoalCompletions` | Check/toggle goal completion for today's Hijri date |
| `useGoals` | Fetch all user goals |
| `useOverdueGoals` | 7-day lookback for missed goals |
| `useDynamicGoals` | Community goals due today (if enabled) |
| `useAdminGoalCompletions` | Check/toggle dynamic goal completion |
| `useCalendar` | Current Hijri/Gregorian dates, location, Maghrib time |

---

## Setup Prompt for Cursor

> "Build the Today/Dashboard screen from Document 4:
>
> 1. **Time-of-Day Card** with gradient background based on current prayer (use `expo-linear-gradient`), showing date display (Gregorian + Hijri + city), daily meter percentage, striped progress bar, and current/next prayer with checkbox.
> 2. **Today's Goals** section with checklist, dynamic goal badges, and overdue goals with red borders.
> 3. **Onboarding redirect** — check if `profiles.latitude` is null and redirect to onboarding.
>
> Port these hooks from the web app: `usePrayerLog`, `usePrayerTimes`, `useTodayProgress`, `useGoalCompletions`, `useGoals`, `useOverdueGoals`, `useDynamicGoals`, `useAdminGoalCompletions`. Replace `localStorage` caching in `prayerTimes.ts` with `AsyncStorage`. Replace `navigator.geolocation` with `expo-location` in `CalendarContext`."
