
# Goals Feature - Comprehensive Implementation Plan

## Executive Summary

This plan introduces a **Goals** feature for tracking recurring spiritual and personal habits (e.g., "Quran tilawat daily", "Dua Kamil every Tuesday", "1000 tasbeeh of Panjatan paak"). Goals will integrate into the daily progress system, affecting the percentage on days they're scheduled.

### Key Navigation Changes
- **Rename "Dashboard" to "Today"** in sidebar and bottom nav
- **Add "Goals"** as a new navigation item
- **Move "Logout" button** into the Profile page

---

## Natural Language Processing Assessment

### Recommendation: **Defer NLP to Phase 2**

**Why?**
- `chrono-node` is a mature library (2.9.0, 0 dependencies, MIT license) that handles patterns like:
  - "every Tuesday"
  - "daily"
  - "every 2 weeks"
  - "tomorrow at 5pm"
- However, integration requires:
  - Custom pattern handling for Islamic contexts (e.g., "every Jumma")
  - Fallback UI when parsing fails
  - Testing across various input formats

**Initial Build Approach:**
- Use structured selectors (dropdowns for frequency, day pickers)
- Add a text input that shows a preview of parsed recurrence (read-only)
- NLP can be added later as an enhancement

---

## Database Schema

### New Table: `goals`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | - | Owner reference |
| title | text | No | - | Goal name |
| description | text | Yes | null | Additional details/links |
| recurrence_type | text | No | 'daily' | daily, weekly, custom |
| recurrence_pattern | jsonb | Yes | null | Custom pattern config |
| recurrence_days | integer[] | Yes | null | Days of week (0-6) for weekly |
| due_date | date | Yes | null | Optional one-time due date |
| start_date | date | No | now() | When tracking begins |
| end_date | date | Yes | null | Optional end date |
| sort_order | integer | No | 0 | For drag-and-drop ordering |
| is_active | boolean | No | true | Soft delete |
| created_at | timestamptz | No | now() | - |
| updated_at | timestamptz | No | now() | - |

### New Table: `goal_completions`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| user_id | uuid | No | - | Owner reference |
| goal_id | uuid | No | - | FK to goals |
| completion_date | date | No | - | Hijri date (YYYY-MM-DD) |
| gregorian_date | date | No | - | Gregorian date |
| completed_at | timestamptz | No | now() | When marked done |

**Unique constraint:** `(user_id, goal_id, completion_date)`

### Recurrence Pattern (JSONB)

```typescript
// For custom recurrence
interface RecurrencePattern {
  type: 'interval' | 'monthly';
  interval?: number;       // Every N days
  intervalUnit?: 'days' | 'weeks';
  monthlyDay?: number;     // Day of month
  calendarType?: 'hijri' | 'gregorian';
}
```

---

## Architecture Overview

```text
src/
├── pages/
│   ├── Today.tsx          # Renamed from Dashboard.tsx
│   └── Goals.tsx          # New goals management page
├── components/
│   └── goals/
│       ├── GoalCard.tsx           # Individual goal display
│       ├── GoalFormSheet.tsx      # Create/edit goal form
│       ├── GoalList.tsx           # Sortable goal list
│       ├── TodaysGoals.tsx        # Goals due today (for Today page)
│       └── RecurrenceSelector.tsx # Frequency picker UI
├── hooks/
│   ├── useGoals.ts        # CRUD for goals
│   ├── useGoalCompletions.ts # Track completions
│   └── useTodayProgress.ts  # Combined prayers + goals progress
├── types/
│   └── goals.ts           # Type definitions
└── lib/
    └── recurrence.ts      # Date matching utilities
```

---

## Phase 1: Foundation (Database + Types + Navigation)

### 1.1 Database Migration

Create `goals` and `goal_completions` tables with RLS policies:
- Users can only CRUD their own goals
- Users can only CRUD their own completions

### 1.2 Type Definitions

Create `src/types/goals.ts`:

```typescript
export type RecurrenceType = 'daily' | 'weekly' | 'custom';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  recurrence_type: RecurrenceType;
  recurrence_pattern?: RecurrencePattern | null;
  recurrence_days?: number[] | null; // 0=Sun, 6=Sat
  due_date?: string | null;
  start_date: string;
  end_date?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GoalCompletion {
  id: string;
  user_id: string;
  goal_id: string;
  completion_date: string; // Hijri YYYY-MM-DD
  gregorian_date: string;
  completed_at: string;
}
```

### 1.3 Navigation Updates

**Files to modify:**
- `src/components/layout/AppSidebar.tsx` - Add Goals, rename Dashboard
- `src/components/layout/MobileBottomNav.tsx` - Add Goals, rename Home, remove Logout
- `src/pages/Profile.tsx` - Add Sign Out button
- `src/App.tsx` - Add /goals route, rename /dashboard to /today

**New nav structure:**
```text
Desktop Sidebar:      Mobile Bottom:
- Today               - Today
- Namaz               - Namaz  
- Goals (new)         - Goals (new)
                      - Profile
[Profile section]
[Sign out]
```

---

## Phase 2: Core CRUD + Recurrence Logic

### 2.1 useGoals Hook

```typescript
interface UseGoalsReturn {
  goals: Goal[];
  isLoading: boolean;
  createGoal: (input: GoalInput) => Promise<Goal>;
  updateGoal: (id: string, input: Partial<GoalInput>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  reorderGoals: (orderedIds: string[]) => Promise<void>;
}
```

### 2.2 Recurrence Utilities

Create `src/lib/recurrence.ts`:

```typescript
// Check if a goal is due on a specific Hijri date
function isGoalDueOnDate(
  goal: Goal,
  hijriDate: HijriDate,
  gregorianDate: Date
): boolean {
  // Handle daily, weekly, custom patterns
}

// Get all goals due today
function getGoalsDueToday(
  goals: Goal[],
  currentHijri: HijriDate,
  currentGregorian: Date
): Goal[];
```

### 2.3 useGoalCompletions Hook

```typescript
interface UseGoalCompletionsReturn {
  completions: Map<string, GoalCompletion>; // goalId -> completion
  isLoading: boolean;
  toggleCompletion: (goalId: string) => Promise<void>;
  isCompleted: (goalId: string) => boolean;
}
```

---

## Phase 3: UI Components

### 3.1 RecurrenceSelector Component

Structured UI with dropdowns (NLP deferred):

```text
┌─────────────────────────────────────────────────┐
│ Repeats: [Daily ▾]                              │
│                                                 │
│ ○ Daily                                         │
│ ○ Weekly on: [M] [T] [W] [T] [F] [S] [S]       │
│ ○ Custom: Every [2] [weeks ▾]                   │
│ ○ One-time on: [📅 Pick date]                   │
└─────────────────────────────────────────────────┘
```

### 3.2 GoalFormSheet Component

Mobile-first sheet/dialog for creating and editing goals:
- Title (required)
- Description (optional textarea for notes/links)
- RecurrenceSelector
- Start date picker
- Optional end date

### 3.3 GoalCard Component

```text
┌─────────────────────────────────────────────────┐
│ ☐ Quran tilawat                          Daily │
│   Read 1 page of Quran after Fajr              │
│                                       [⋮ Menu] │
└─────────────────────────────────────────────────┘
```

Features:
- Checkbox for completion
- Recurrence badge
- Description preview
- Drag handle for reordering
- Menu for edit/delete

### 3.4 GoalList Component (Drag-and-Drop)

Use `@dnd-kit/core` for drag-and-drop reordering:
- Smooth animations
- Accessibility-friendly
- Persists order to database

### 3.5 Goals Page

```text
┌─────────────────────────────────────────────────┐
│ Goals                               [+ Add Goal]│
├─────────────────────────────────────────────────┤
│ ═══ Daily ═══                                   │
│ ☐ Quran tilawat                                 │
│ ☐ 1000 tasbeeh Panjatan paak                    │
│                                                 │
│ ═══ Weekly ═══                                  │
│ ☐ Dua Kamil (Tuesdays)                         │
│                                                 │
│ ═══ Custom ═══                                  │
│ ☐ Roza qaza (Every 2 weeks)                    │
└─────────────────────────────────────────────────┘
```

---

## Phase 4: Dashboard Integration

### 4.1 TodaysGoals Component

Shows goals due today on the "Today" page:

```text
┌─────────────────────────────────────────────────┐
│ 🎯 Today's Goals                          2/3  │
├─────────────────────────────────────────────────┤
│ ☑ Quran tilawat                                │
│ ☑ 1000 tasbeeh                                 │
│ ☐ Dua Kamil                                    │
└─────────────────────────────────────────────────┘
```

### 4.2 useTodayProgress Hook

Combined progress calculation:

```typescript
interface UseTodayProgressReturn {
  // Prayers
  prayerCompleted: number;
  prayerTotal: number;
  prayerPercentage: number;
  
  // Goals
  goalsCompleted: number;
  goalsTotal: number;
  goalsPercentage: number;
  
  // Combined
  overallCompleted: number;
  overallTotal: number;
  overallPercentage: number;
}
```

**Calculation:**
```
overallPercentage = (prayerCompleted + goalsCompleted) / (prayerTotal + goalsTotal) × 100
```

Example: 3/5 prayers + 2/3 goals = 5/8 = 62.5%

### 4.3 Updated DailyMeter

Modify to show combined progress with breakdown:

```text
┌─────────────────────────────────────────────────┐
│                                          62%   │
│ ████████████░░░░░░░                            │
│ Prayers: 3/5 · Goals: 2/3                      │
└─────────────────────────────────────────────────┘
```

---

## Phase 5: Polish & Edge Cases

### 5.1 Edge Cases
- Goal created mid-day: Don't show as "missed" for today
- Weekly goal: Only count on scheduled days
- Inactive goal: Exclude from progress calculation
- Goal with end date in past: Auto-deactivate

### 5.2 Empty States
- No goals created: "Add your first goal" CTA
- No goals due today: "All caught up! 🎉"

### 5.3 Timezone Handling
- Use Hijri date (from CalendarContext) as the source of truth
- Gregorian stored for cross-reference only

---

## Implementation Phases Summary

| Phase | Scope | Files |
|-------|-------|-------|
| **1** | Database + Types + Navigation | Migration, types, nav components, routes |
| **2** | CRUD + Recurrence Logic | useGoals, useGoalCompletions, recurrence.ts |
| **3** | UI Components | GoalCard, GoalFormSheet, GoalList, Goals page |
| **4** | Dashboard Integration | TodaysGoals, useTodayProgress, DailyMeter update |
| **5** | Polish | Edge cases, empty states, animations |

---

## Dependencies to Add

```json
{
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

Optional (for Phase 2 NLP enhancement):
```json
{
  "chrono-node": "^2.9.0"
}
```

---

## Technical Considerations

### Progress Calculation Logic

The daily percentage will now be dynamic:
- **Base**: 5 required prayers (always counted)
- **Variable**: Goals due today (0 to N)

```typescript
// useTodayProgress.ts
const prayerWeight = 5; // Always 5 prayers
const goalsWeight = goalsDueToday.length;
const totalTasks = prayerWeight + goalsWeight;

const completed = prayerCompleted + goalsCompleted;
const percentage = totalTasks > 0 
  ? Math.round((completed / totalTasks) * 100) 
  : 100;
```

### Hijri Date as Primary Key

Goal completions use Hijri date (`completion_date`) as the primary identifier since the app follows Maghrib-based day transitions. The Gregorian date is stored for reference but not used for uniqueness.

---

## Questions Deferred

1. **Streaks/Gamification**: Track consecutive completion days?
2. **Notifications**: Push reminders for incomplete goals?
3. **Categories/Tags**: Group goals by type (spiritual, health, etc.)?

These can be added as future enhancements after the core feature is stable.
