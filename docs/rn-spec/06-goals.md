# Document 6: Goals Screen

> Goal management with creation, editing, drag-to-reorder, and dynamic community goals.

---

## 6.1 Screen Structure

```
┌──────────────────────────┐
│ Goals              [+][⋯]│  ← H1 title, Add button, overflow menu
│ Rooted in Niyat,         │  ← Subtitle, muted-foreground
│ completed with Ikhlas.   │
│                          │
│ ┌──────────────────────┐ │
│ │ ≡ ☑ Pray Quran      │ │  ← Drag handle, checkbox, title
│ │   Daily              │ │  ← Recurrence badge
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ ≡ ☐ Budget Sabeel   │ │
│ │   1st of each month  │ │
│ │   (Hijri)            │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ ≡ ☐ Recite Quran    │ │  ← Dynamic goal
│ │   Daily  [Dynamic]   │ │  ← Dynamic badge
│ └──────────────────────┘ │
│                          │
│ OVERDUE                  │
│ ┌──────────────────────┐ │
│ │ ⚠ Track Khums       │ │  ← Red border
│ │   Yesterday          │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

---

## 6.2 Header Actions

### Add Button (desktop only — mobile uses the FAB)
- `Archery` icon + "Add Goal" text
- Opens the Goal Form Sheet

### Overflow Menu (⋯)
Contains:
```
┌─────────────────────────┐
│ Receive Dynamic Goals   │
│ Community goals for all │
│ Mumineen...             │
│                         │
│ Enabled    [Toggle ◉]   │
└─────────────────────────┘
```
- Toggle persisted to `user_preferences.dynamic_goals_enabled`
- When enabled, published `admin_goals` appear in the list with a "Dynamic" badge

---

## 6.3 Goal List

### Unified List
User goals + dynamic goals are merged into a single reorderable list.

### Sort Order
- Persisted in `user_preferences.goal_sort_order` (JSON array of IDs)
- Dynamic goal IDs are prefixed with `dynamic:` (e.g., `dynamic:uuid-here`)
- When reordering, the full combined order is saved
- User goals also get their `sort_order` column updated in the `goals` table

### Goal Card
Each card shows:
- **Drag handle** (≡ icon) — for reordering
- **Checkbox** — accent color when checked, toggles completion for today
- **Title** — goal title text
- **Recurrence badge** — e.g., "Daily", "Weekly (Mon, Thu)", "1st of each month (Hijri)"
- **Dynamic badge** — "Dynamic" pill if `isDynamic = true`
- **Edit/Delete actions** — swipe-to-reveal or long-press menu (NOT available for dynamic goals)

### Overdue Goals
- Shown below the main list with "OVERDUE" section header
- Red/destructive border
- Date label: "Yesterday" or "8 Feb"
- Checking an overdue goal batch-completes ALL missed dates for that goal (not just the displayed one)
- Uses 7-day lookback

### Empty State
```
"He who is mindful of the journey's
 distance prepares for it."

[🎯 Create your first goal]
```

---

## 6.4 Goal Creation/Edit Form (Bottom Sheet)

Opens as a bottom sheet (`rounded-t-2xl` top corners).

### Form Fields

```
┌──────────────────────────┐
│ New Goal / Edit Goal     │  ← Sheet title
│                          │
│ Title *                  │
│ [________________]       │  ← Pill input
│                          │
│ Description              │
│ [                   ]    │  ← Textarea, rounded-2xl
│ [                   ]    │
│                          │
│ Recurrence               │
│ [Daily ▼]                │  ← Dropdown/Picker
│                          │
│ {Recurrence-specific     │  ← Changes based on type
│  fields shown here}      │
│                          │
│ Start Date               │
│ [2026-02-16 📅]          │  ← Date picker
│                          │
│ End Date (optional)      │
│ [__________ 📅]          │
│                          │
│ [   Save Goal   ]        │  ← Primary button
└──────────────────────────┘
```

### Recurrence Type Options

| Type | Additional Fields |
|---|---|
| **Daily** | None |
| **Weekly** | Day-of-week picker (multi-select pills: Sun Mon Tue Wed Thu Fri Sat) |
| **Monthly** | Day of month (number picker 1-30), Calendar type toggle (Hijri/Gregorian) |
| **Interval** | Every [N] [days/weeks] (number input + unit picker) |
| **Annual** | Month picker (1-12), Day of month, Calendar type toggle |
| **One-time** | Specific date picker |

### Calendar Type Toggle
For monthly and annual recurrence:
- Two-segment control: "Hijri" / "Gregorian"
- When Hijri is selected, month picker shows Hijri month names (Moharram, Safar, etc.)
- When Gregorian, shows January, February, etc.
- Default: Hijri

### Data Shape for Save

```typescript
interface GoalInput {
  title: string;
  description?: string | null;
  recurrence_type: 'daily' | 'weekly' | 'custom' | 'one-time' | 'annual';
  recurrence_pattern?: {
    type: 'interval' | 'monthly' | 'annual';
    interval?: number;
    intervalUnit?: 'days' | 'weeks';
    monthlyDay?: number;
    calendarType?: 'hijri' | 'gregorian';
    annualMonth?: number;
  } | null;
  recurrence_days?: number[] | null;  // For weekly: [0,1,2,3,4,5,6]
  due_date?: string | null;            // For one-time: YYYY-MM-DD
  start_date?: string;
  end_date?: string | null;
}
```

---

## 6.5 Education Popup

After the user creates their 3rd goal, show a one-time dialog:

```
┌─────────────────────────────┐
│ Did you know?               │
│                             │
│ You're building great       │
│ habits! Ibadat also offers  │
│ Dynamic Goals — community   │
│ goals for all Mumineen...   │
│                             │
│ [      Got it      ]        │
└─────────────────────────────┘
```

- Shown once (flag persisted in AsyncStorage: `dynamic-goals-education-shown`)
- Delayed by 2 seconds after the Goals page loads with exactly 3 goals

---

## 6.6 Completion Anchoring

**Critical:** Goal completions are anchored to the **pre-Maghrib Hijri date** (`currentDate.preMaghribHijri`).

```typescript
const completionDate = formatHijriDateKey(currentDate.preMaghribHijri);
// e.g., "1447-08-17"
```

This ensures that completing a goal in the evening (after Maghrib) still records it against the correct Hijri day.

---

## 6.7 Auto-Open from Onboarding

When arriving at the Goals page with `?new=1` query parameter (from onboarding "Create your own" flow):
- Automatically open the Goal Form Sheet
- Clear the query parameter

In React Native, this could be a route param instead: `navigation.navigate('Goals', { autoOpenForm: true })`.

---

## 6.8 Data Hooks Used

| Hook | Purpose |
|---|---|
| `useGoals` | CRUD operations on goals, reorder |
| `useGoalCompletions` | Check/toggle completion for today |
| `useOverdueGoals` | 7-day lookback, batch complete |
| `useDynamicGoals` | Published admin goals due today |
| `useAdminGoalCompletions` | Check/toggle dynamic goal completion |
| `useUserPreferences` | Dynamic goals toggle, sort order persistence |

---

## Setup Prompt for Cursor

> "Build the Goals screen from Document 6:
>
> 1. **Goal list** with drag-to-reorder support (use `react-native-draggable-flatlist` or similar). Each card has a drag handle, checkbox, title, recurrence badge, and optional 'Dynamic' badge.
> 2. **Goal Form Sheet** as a bottom sheet with all recurrence types: Daily, Weekly (day picker), Monthly (day + calendar toggle), Interval (N days/weeks), Annual (month + day + calendar toggle), One-time (date picker).
> 3. **Overdue section** with red-bordered cards and date labels.
> 4. **Header menu** with Dynamic Goals toggle.
> 5. **Education popup** shown once after 3rd goal creation.
>
> Port `useGoals`, `useGoalCompletions`, `useOverdueGoals`, `useUserPreferences` hooks. Use the recurrence engine from `src/lib/recurrence.ts` for due-date checks. Completions are anchored to pre-Maghrib Hijri date."
