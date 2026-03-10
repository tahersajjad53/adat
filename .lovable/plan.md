

## Tasbeeh Counter — Feature Plan

### Overview
A tap-counter feature for tracking dhikr/tasbeeh recitations. Users create counters with an optional name and target, see active counters on the Today page, and tap into a dedicated full-screen counter page with a radial progress meter.

---

### Phase 1: Database

New table `tasbeeh_counters`:

| Column | Type | Default | Notes |
|---|---|---|---|
| id | uuid | gen_random_uuid() | PK |
| user_id | uuid | — | FK-style, not referencing auth.users |
| title | text | null | Optional name |
| target_count | integer | null | Null = unlimited |
| current_count | integer | 0 | Running tally |
| is_active | boolean | true | Soft delete |
| created_at | timestamptz | now() | |
| updated_at | timestamptz | now() | |

RLS policies: Users can CRUD their own rows (`auth.uid() = user_id`).
Trigger: `update_updated_at_column` on UPDATE.

No additional tables needed — the counter state lives in a single row. No completions table since tasbeeh is a running counter, not a daily recurrence.

---

### Phase 2: Plus Button → Action Menu

**Files:** `MobileBottomNav.tsx`, `AppLayout.tsx`, `AppSidebar.tsx`

Currently the `+` button directly calls `onAddGoal`. Change it to open a popover/dropdown with two options:
- "New Goal" → opens GoalFormSheet (existing)
- "Tasbeeh Counter" → opens a new TasbeehFormSheet

The `onAddGoal` prop becomes `onAdd` or we add a second callback. Desktop sidebar gets the same treatment.

---

### Phase 3: Tasbeeh Form Sheet

**New file:** `src/components/tasbeeh/TasbeehFormSheet.tsx`

A simple bottom sheet (mobile) / dialog (desktop) with:
- **Title** — text input, optional, placeholder "e.g. Salawat"
- **Target** — number input, optional, label "Target count", placeholder "Leave empty for unlimited"
- Create button

Also used for editing (title, target, reset count).

---

### Phase 4: Tasbeeh Hook

**New file:** `src/hooks/useTasbeehCounters.ts`

React Query hook providing:
- `counters` — fetch active counters for current user
- `createCounter(title?, target?)` — insert
- `incrementCounter(id)` — optimistic update, `current_count + 1`
- `resetCounter(id)` — set `current_count = 0`
- `updateCounter(id, data)` — edit title/target
- `deleteCounter(id)` — soft delete (`is_active = false`)

---

### Phase 5: Today Page — Counter Cards

**Files:** `Dashboard.tsx`, new `src/components/tasbeeh/TasbeehCard.tsx`

Insert between the TimeOfDayCard and Today's Goals section. Each active counter renders as a compact card showing:
- Title (or "Tasbeeh" if untitled)
- Count / Target (e.g. "342 / 1000") or just count if no target
- Small progress bar if target exists
- Delete icon (trash) for quick removal
- Tap card → navigate to `/tasbeeh/:id`

If no active counters, section is hidden entirely.

---

### Phase 6: Tasbeeh Detail Page

**New file:** `src/pages/TasbeehCounter.tsx`

**Route:** `/tasbeeh/:id`

Layout:
```text
┌─────────────────────────┐
│  ← Back    Title    ⋯  │  ← Header with edit menu
│                         │
│                         │
│      ┌───────────┐      │
│     ╱             ╲     │
│    │   ┌───────┐   │    │  ← Radial progress ring
│    │   │  342  │   │    │  ← Large bold count
│    │   └───────┘   │    │
│     ╲             ╱     │
│      └───────────┘      │
│                         │
│    342 / 1000           │  ← Target label (if set)
│                         │
│      [ Reset ]          │  ← Reset button
└─────────────────────────┘
```

- The entire central area is the tap target (not just the circle)
- Radial ring: SVG circle with `stroke-dashoffset` based on `current_count / target_count`
- If no target: ring not shown, just the count
- Haptic feedback on tap (via `navigator.vibrate(10)` if available)
- Three-dot menu: Edit (opens TasbeehFormSheet), Reset, Delete
- Optimistic increment via React Query

---

### Phase 7: Routing

**File:** `src/App.tsx`

Add route:
```
/tasbeeh/:id → <ProtectedRoute><AppLayout><TasbeehCounter /></AppLayout></ProtectedRoute>
```

---

### Implementation Order

1. Database migration (table + RLS + trigger)
2. `useTasbeehCounters` hook
3. `TasbeehFormSheet` component
4. Update `+` button to show action menu
5. `TasbeehCard` + integrate into Dashboard
6. `TasbeehCounter` detail page + route
7. Polish (haptic, animations, empty states)

