

# Enhanced Onboarding with Template Goals and Loading Screen

## Overview
Transform the existing single-step onboarding into a three-step flow: Location, Aspirations, and a brief loading screen with a hadith quote before navigating to the destination.

## Flow

```text
Sign In (Google / Email)
        |
   Step 1: Location (existing)
        |
   Step 2: 'اُمّید' - Pick aspirations (new)
        |
   Step 3: Loading screen with hadith quote (new, ~2 seconds)
        |
   +----+----+
   |         |
Selected   Skipped/None
   |         |
/goals     /today
(template  (empty state
goals      with hadith
created)   quote + CTA)
```

## Changes

### 1. Refactor `src/pages/Onboarding.tsx` into a multi-step flow

Add a `step` state (1 = location, 2 = aspirations, 3 = loading).

**Step 1 (Location)** -- stays as-is. "Continue" and "Skip" both advance to step 2 (Skip defaults to Mecca first).

**Step 2 (Aspirations)** -- new screen:
- Title: **اُمّید** (large, display font)
- Subtitle: "What would you like to focus on?"
- Four pill-shaped toggle buttons in a wrapped flex layout:
  - Budget for Sabeel
  - Track Khums
  - Pray Quran Daily
  - Budget for FMB Hub
- Unselected pills: outlined with a `+` icon
- Selected pills: filled accent with an `x` icon
- "Continue" button (always enabled)
- "Skip" ghost button

**Step 3 (Loading)** -- new transitional screen:
- Centered spinner or subtle pulse animation
- Hadith quote in italic muted text: *"The bane of ibadat is listlessness"* -- Al-Hadith
- Displays for ~2 seconds while goals are created (if any), then navigates

### 2. Template goal creation

Each aspiration maps to a specific goal configuration:

| Selection | Goal Title | Recurrence Type | Recurrence Pattern |
|---|---|---|---|
| Budget for Sabeel | Budget for Sabeel | `custom` | `{ type: 'monthly', monthlyDay: 1, calendarType: 'hijri' }` |
| Track Khums | Track Khums | `custom` | `{ type: 'monthly', monthlyDay: 1, calendarType: 'hijri' }` |
| Pray Quran Daily | Pray Quran | `daily` | `null` |
| Budget for FMB Hub | Budget for FMB Hub | `custom` | `{ type: 'monthly', monthlyDay: 1, calendarType: 'hijri' }` |

Goals are inserted via `supabase.from('goals').insert(...)` during the loading step. Monthly goals use `recurrence_type: 'custom'` with a `recurrence_pattern` of type `monthly` and `monthlyDay: 1` (1st of every month), matching the existing pattern conventions. After insert, navigate to `/goals`. If no selections, navigate to `/today`.

### 3. Update `TodaysGoals` empty state

Replace the current "No goals scheduled for today" message with:
- Italic hadith quote: *"The deed dearest to Allah Ta'ala is that which is most consistent, even if small"* -- Al-Hadith
- Primary "Create your first goal" button navigating to `/goals`

### 4. Navigation cleanup

Change all existing `navigate('/dashboard')` calls in `Onboarding.tsx` to use the new step progression logic instead.

## Technical Details

**Monthly goal insert shape:**
```ts
{
  user_id: user.id,
  title: 'Budget for Sabeel',
  recurrence_type: 'custom',
  recurrence_pattern: { type: 'monthly', monthlyDay: 1, calendarType: 'hijri' },
  start_date: today,
  sort_order: 0,
  is_active: true,
}
```

**Loading screen:**
```tsx
<div className="flex flex-col items-center justify-center min-h-[300px] space-y-6">
  <Refresh className="h-6 w-6 animate-spin text-muted-foreground" />
  <div className="text-center space-y-1">
    <p className="text-sm text-muted-foreground italic">
      "The bane of ibadat is listlessness"
    </p>
    <p className="text-xs text-muted-foreground">— Al-Hadith</p>
  </div>
</div>
```

## Files
- **Edit**: `src/pages/Onboarding.tsx` -- add steps 2 and 3, goal creation logic
- **Edit**: `src/components/goals/TodaysGoals.tsx` -- update empty state with hadith + CTA

