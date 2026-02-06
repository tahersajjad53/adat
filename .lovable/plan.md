

# Dues Module - Updated Implementation Plan

## Overview

Build a complete financial tracking system for Islamic community obligations (Sabeel, FMB Hub, Khumus, Zakat) with CRUD operations, hierarchical relationships, and dashboard reminder notifications. **Now with dual calendar support (Hijri or Gregorian) for flexible reminder scheduling.**

## Key Update: Dual Calendar Support

Users can choose whether their dues are tied to:
- **Hijri Calendar**: Traditional Islamic month-based (e.g., due on 30 Shaban)
- **Gregorian Calendar**: Salary-aligned (e.g., due on 25th of each month)

This flexibility allows users to align payment reminders with their income cycle.

---

## Data Model

```text
┌─────────────────────────────────────────────────────────────────────┐
│                           SABEEL (Family Unit)                       │
│  - sabeel_name (e.g., "T0046A")                                     │
│  - monthly_amount                                                    │
│  - calendar_type: 'hijri' | 'gregorian'  ← NEW                      │
│  - start_date / end_date                                            │
│  - reminder_type + custom_date                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │    FMB Hub       │  │    Khumus        │  │     Zakat        │   │
│  │  (per Sabeel)    │  │  (per person)    │  │  (per person)    │   │
│  │  - amount        │  │  - person_name   │  │  - person_name   │   │
│  │  - calendar_type │  │  - calendar_type │  │  - calendar_type │   │
│  │  - start/end     │  │  - calc_type     │  │  - calc_type     │   │
│  │  - reminder      │  │  - fixed_amount  │  │  - fixed_amount  │   │
│  └──────────────────┘  │  - income_amount │  │  - nisab_value   │   │
│                        │  - percentage    │  │  - assets_value  │   │
│                        │  - reminder      │  │  - reminder      │   │
│                        └──────────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Database Schema

### Updated Table Structures

**1. `sabeels`** - Main family unit
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner (FK profiles) |
| sabeel_name | text | e.g., "T0046A" |
| monthly_amount | numeric | Monthly due amount |
| calendar_type | text | **'hijri' or 'gregorian'** |
| start_month | int | 1-12 (works for both calendars) |
| start_year | int | e.g., 1446 (Hijri) or 2025 (Gregorian) |
| end_month | int | Nullable (ongoing) |
| end_year | int | Nullable |
| reminder_type | text | 'before_7_days', 'last_day', 'custom' |
| reminder_day | int | For custom: day of month |
| is_active | boolean | Default true |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**2. `fmb_hubs`** - FMB contributions
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| sabeel_id | uuid | FK to sabeels |
| monthly_amount | numeric | Monthly contribution |
| calendar_type | text | **'hijri' or 'gregorian'** |
| start_month | int | |
| start_year | int | |
| end_month | int | Nullable |
| end_year | int | Nullable |
| reminder_type | text | |
| reminder_day | int | |
| is_active | boolean | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**3. `khumus`** - Individual Khumus obligations
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| sabeel_id | uuid | FK to sabeels |
| person_name | text | Individual's name |
| calculation_type | text | 'fixed' or 'percentage' |
| fixed_amount | numeric | If fixed |
| monthly_income | numeric | If percentage-based |
| percentage_rate | numeric | Default 20% |
| calendar_type | text | **'hijri' or 'gregorian'** |
| reminder_type | text | |
| reminder_day | int | |
| is_active | boolean | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**4. `zakats`** - Individual Zakat obligations
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| sabeel_id | uuid | FK to sabeels |
| person_name | text | Individual's name |
| calculation_type | text | 'fixed' or 'nisab_based' |
| fixed_amount | numeric | If fixed |
| assets_value | numeric | If nisab-based |
| nisab_threshold | numeric | For calculation |
| zakat_rate | numeric | Default 2.5% |
| calendar_type | text | **'hijri' or 'gregorian'** |
| reminder_type | text | |
| reminder_day | int | |
| is_active | boolean | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**5. `due_payments`** - Payment tracking
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK profiles |
| due_type | text | 'sabeel', 'fmb', 'khumus', 'zakat' |
| reference_id | uuid | FK to respective table |
| calendar_type | text | **'hijri' or 'gregorian'** |
| due_month | int | |
| due_year | int | |
| amount_due | numeric | |
| amount_paid | numeric | |
| paid_at | timestamptz | Nullable |
| created_at | timestamptz | |

### RLS Policies
- Users can only CRUD their own Sabeels
- FMB/Khumus/Zakat accessible via Sabeel ownership
- All tables protected with user_id checks

---

## Phase 2: Profile Page Restructure

### New Layout (Mobile-First)

```text
┌─────────────────────────────────────────┐
│ Profile Settings                   [Save] │
├─────────────────────────────────────────┤
│                                         │
│ ▼ Personal Information                  │
│   [Full Name]                           │
│   [Email - disabled]                    │
│                                         │
│ ▼ Location Settings                     │
│   [City Selector]                       │
│   [Maghrib Preview]                     │
│                                         │
│ ▼ Dues & Obligations              [+Add] │
│   ┌─────────────────────────────────┐   │
│   │ 🏠 Sabeel T0046A           [Edit] │   │
│   │    ₹5,000/month · Hijri 📅       │   │
│   │    ├─ FMB Hub: ₹2,000          │   │
│   │    ├─ Khumus: Ahmed (20%)      │   │
│   │    └─ Zakat: Ahmed (2.5%)      │   │
│   └─────────────────────────────────┘   │
│   ┌─────────────────────────────────┐   │
│   │ 🏠 Sabeel T0089B           [Edit] │   │
│   │    ₹3,500/month · Gregorian 📅   │   │
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Components

**1. `src/components/dues/CalendarTypeSelector.tsx`** ← NEW
- Toggle between Hijri and Gregorian
- Visual indicator (moon icon for Hijri, sun icon for Gregorian)
- Affects date picker and reminder logic

```text
┌─────────────────────────────────────────┐
│ Calendar Type                           │
│ ┌─────────────┐ ┌─────────────────────┐ │
│ │ 🌙 Hijri    │ │ ☀️ Gregorian        │ │
│ │ Islamic cal │ │ Salary-aligned      │ │
│ └─────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────┘
```

**2. `src/components/dues/SabeelCard.tsx`**
- Collapsible card showing Sabeel + children
- Calendar type badge (Hijri/Gregorian)
- Edit/Delete actions

**3. `src/components/dues/SabeelFormSheet.tsx`**
- Bottom sheet (mobile) / Dialog (desktop)
- **Step 1: Select Calendar Type**
- **Step 2: Enter details with appropriate date pickers**
- Fields: name, amount, dates, reminder settings

**4. `src/components/dues/ReminderSelector.tsx`**
- Accepts `calendarType` prop
- Radio: "7 days before", "Last day", "Custom"
- Custom day picker adapts to calendar type
  - Hijri: 1-30 with month names
  - Gregorian: 1-31 with standard months

**5. `src/components/dues/FMBHubForm.tsx`**
- Calendar type selector (can inherit from parent Sabeel or override)
- Amount and reminder settings

**6. `src/components/dues/KhumusForm.tsx`**
- Person name input
- Toggle: Fixed amount vs. Percentage calculation
- Calendar type for reminder
- Reminder settings

**7. `src/components/dues/ZakatForm.tsx`**
- Similar to Khumus with nisab-based calculation option
- Calendar type for reminder

---

## Phase 3: Hooks & Data Layer

### Updated Hooks

**1. `src/hooks/useSabeels.ts`**
```tsx
interface Sabeel {
  id: string;
  sabeel_name: string;
  monthly_amount: number;
  calendar_type: 'hijri' | 'gregorian';
  start_month: number;
  start_year: number;
  end_month?: number;
  end_year?: number;
  reminder_type: 'before_7_days' | 'last_day' | 'custom';
  reminder_day?: number;
  is_active: boolean;
  // Nested relations
  fmb_hub?: FMBHub;
  khumus: Khumus[];
  zakats: Zakat[];
}
```

**2. `src/hooks/useDueReminders.ts`** ← Updated for dual calendar
```tsx
interface DueReminder {
  id: string;
  type: 'sabeel' | 'fmb' | 'khumus' | 'zakat';
  title: string;
  amount: number;
  calendarType: 'hijri' | 'gregorian';
  dueDate: string; // Formatted based on calendar type
  daysRemaining: number;
  urgency: 'upcoming' | 'due_today' | 'overdue';
}

// Logic pseudocode:
function calculateReminder(due, currentHijri, currentGregorian) {
  if (due.calendar_type === 'hijri') {
    // Compare with currentHijri from useCalendar()
    // Calculate days until end of Hijri month
  } else {
    // Compare with currentGregorian (new Date())
    // Calculate days until end of Gregorian month
  }
}
```

**3. `src/lib/calendarUtils.ts`** ← NEW utility
```tsx
// Days remaining in current Hijri month
function daysRemainingHijri(currentHijri: HijriDate): number;

// Days remaining in current Gregorian month
function daysRemainingGregorian(date: Date): number;

// Check if reminder should trigger
function shouldShowReminder(
  reminderType: string,
  reminderDay: number | null,
  calendarType: 'hijri' | 'gregorian',
  currentHijri: HijriDate,
  currentGregorian: Date
): boolean;
```

---

## Phase 4: Dashboard Reminders

### Updated Reminder Card Design

```text
┌─────────────────────────────────────────────────┐
│ 🔔 Dues Reminders                         (3)  │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ ⚠️ Sabeel T0046A due in 5 days    🌙 Hijri │ │
│ │    ₹5,000 · Due 30 Shaban                  │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ 📋 FMB Hub due today            ☀️ Gregorian │ │
│ │    ₹2,000 · Due Feb 25                     │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ 💰 Khumus (Ahmed) reminder         🌙 Hijri │ │
│ │    ₹4,000 · Custom: 15 Ramadan             │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

- Calendar type badge on each reminder
- Date formatted according to calendar type
- Sort by urgency, then by days remaining

---

## Phase 5: File Structure

```text
src/
├── components/
│   └── dues/
│       ├── CalendarTypeSelector.tsx  ← NEW
│       ├── SabeelCard.tsx
│       ├── SabeelFormSheet.tsx
│       ├── FMBHubForm.tsx
│       ├── KhumusForm.tsx
│       ├── ZakatForm.tsx
│       ├── ReminderSelector.tsx
│       ├── DueRemindersCard.tsx
│       └── DuesSection.tsx
├── hooks/
│   ├── useSabeels.ts
│   ├── useFMBHub.ts
│   ├── useKhumus.ts
│   ├── useZakat.ts
│   └── useDueReminders.ts
├── lib/
│   └── calendarUtils.ts  ← NEW
└── types/
    └── dues.ts
```

---

## Implementation Order

### Batch 1: Foundation
1. Create database tables with migrations (including calendar_type)
2. Add RLS policies for all tables
3. Create TypeScript types (`src/types/dues.ts`)
4. Create `src/lib/calendarUtils.ts` for dual calendar logic

### Batch 2: UI Components
5. `CalendarTypeSelector` component
6. `ReminderSelector` component (calendar-aware)
7. `SabeelCard` component
8. `SabeelFormSheet` with calendar type step

### Batch 3: Sabeel CRUD
9. `useSabeels` hook
10. Integrate into Profile page with `DuesSection`

### Batch 4: Nested Entities
11. `useFMBHub`, `useKhumus`, `useZakat` hooks
12. `FMBHubForm`, `KhumusForm`, `ZakatForm` components
13. Nest under SabeelCard with add buttons

### Batch 5: Reminders
14. `useDueReminders` hook with dual calendar logic
15. `DueRemindersCard` component
16. Add to Dashboard below TimeOfDayCard

### Batch 6: Polish
17. Mobile-optimized sheets/dialogs
18. Empty states and loading skeletons
19. Validation with Zod schemas
20. Toast notifications for CRUD actions

---

## Technical Notes

### Dual Calendar Reminder Logic

```tsx
// Example: Check if reminder should show
function shouldShowReminder(due: Due, currentHijri: HijriDate, today: Date) {
  const { calendar_type, reminder_type, reminder_day } = due;
  
  if (calendar_type === 'hijri') {
    const daysLeft = daysRemainingInHijriMonth(currentHijri);
    
    if (reminder_type === 'before_7_days' && daysLeft <= 7) return true;
    if (reminder_type === 'last_day' && daysLeft === 0) return true;
    if (reminder_type === 'custom' && currentHijri.day >= reminder_day) return true;
    
  } else {
    const daysLeft = daysRemainingInGregorianMonth(today);
    
    if (reminder_type === 'before_7_days' && daysLeft <= 7) return true;
    if (reminder_type === 'last_day' && daysLeft === 0) return true;
    if (reminder_type === 'custom' && today.getDate() >= reminder_day) return true;
  }
  
  return false;
}
```

### Form UX Flow

```text
Step 1: Calendar Selection
┌─────────────────────────────────────────┐
│ When is this due typically paid?        │
│                                         │
│ ┌─────────────┐ ┌─────────────────────┐ │
│ │ 🌙 Hijri    │ │ ☀️ Gregorian        │ │
│ │             │ │                     │ │
│ │ Based on    │ │ Based on salary     │ │
│ │ Islamic     │ │ or monthly cycle    │ │
│ │ calendar    │ │                     │ │
│ └─────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────┘

Step 2: Details (adapts based on selection)
┌─────────────────────────────────────────┐
│ Sabeel Details                          │
│                                         │
│ [Sabeel Name: T0046A               ]    │
│ [Monthly Amount: 5000              ]    │
│                                         │
│ Start: [Shaban ▼] [1446 ▼]  ← Hijri     │
│   OR                                     │
│ Start: [February ▼] [2025 ▼] ← Gregorian│
│                                         │
│ Reminder:                               │
│ ○ 7 days before month end               │
│ ○ Last day of month                     │
│ ○ Custom day: [25]                      │
└─────────────────────────────────────────┘
```

### Mobile-First Design
- Use `Sheet` (vaul) for bottom sheets on mobile
- Use `Dialog` for desktop modals
- Collapsible sections with Radix `Collapsible`
- Touch-friendly tap targets (min 44px)

