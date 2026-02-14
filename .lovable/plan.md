

# Elan: Administrative Dynamic Goals System

## Overview

An admin panel ("Elan") at `ibadat.app/elan` where you can create, publish, and manage community goals/reminders. Users opt into these via a "Dynamic Goals" toggle in a 3-dot menu on the Goals page. Dynamic goals appear inline alongside user-created goals on both the Goals and Today pages, distinguished only by a small "Dynamic" badge.

---

## Phase 1: Database Schema

### New Tables

**`admin_goals`** -- stores admin-published goals/todos
- `id` (uuid, PK)
- `title` (text, not null)
- `description` (text, nullable)
- `recurrence_type` (text: daily, weekly, custom, one-time, annual)
- `recurrence_days` (int array, nullable -- for weekly)
- `recurrence_pattern` (jsonb, nullable -- for custom/monthly/annual)
- `start_date` (date, not null)
- `end_date` (date, nullable)
- `due_date` (date, nullable -- for one-time)
- `is_published` (boolean, default false)
- `sort_order` (integer, default 0)
- `created_at`, `updated_at` (timestamptz)

RLS: Admin can full CRUD via `has_role()` check. All authenticated users can SELECT where `is_published = true`.

**`admin_goal_completions`** -- tracks user completions of admin goals
- `id` (uuid, PK)
- `user_id` (uuid, not null)
- `admin_goal_id` (uuid, not null, FK to admin_goals)
- `completion_date` (date, not null -- Hijri)
- `gregorian_date` (date, not null)
- `completed_at` (timestamptz, default now())

RLS: Users can only CRUD their own completions.

**`user_roles`** -- role-based access control
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users on delete cascade, not null)
- `role` (app_role enum: admin, user)
- Unique constraint on (user_id, role)

`has_role()` security definer function as per Supabase RBAC pattern.

**`user_preferences`** -- stores user toggles (no theme for now)
- `id` (uuid, PK)
- `user_id` (uuid, unique, not null)
- `dynamic_goals_enabled` (boolean, default false)
- `updated_at` (timestamptz)

RLS: Users can only read/update their own row.

### Seed Data
- Insert admin role for `app.ibadat@gmail.com` into `user_roles`.

---

## Phase 2: Admin Panel -- `/elan`

### Authentication and Access
- `/elan` is a protected route that checks `has_role(auth.uid(), 'admin')` server-side.
- Non-admin users are redirected to `/today`.
- Admin uses the standard login flow (no separate login page).

### Elan Page UI
- List of all admin goals (published and drafts) with status badges.
- Full CRUD: Create, Read, Update, Delete for each goal.
- "Add Goal" button opens a form sheet (similar pattern to GoalFormSheet).
- Form fields: Title, Description, Recurrence type (daily/weekly/custom/one-time/annual), Recurrence days/pattern, Start date, End date, Published toggle.
- Each goal card has Edit and Delete actions (dropdown menu).
- Publish/Unpublish toggle per goal.

### New Files
- `src/pages/Elan.tsx` -- admin page with goal list and CRUD
- `src/components/elan/AdminGoalForm.tsx` -- form sheet for creating/editing
- `src/components/elan/AdminGoalCard.tsx` -- card with edit/delete/publish controls
- `src/hooks/useAdminGoals.ts` -- full CRUD hook for admin_goals
- `src/hooks/useUserRole.ts` -- checks if current user has admin role

---

## Phase 3: Dynamic Goals Toggle

### Location
- **Desktop**: 3-dot menu icon (MoreHoriz) in the Goals page header, positioned next to the "Add Goal" button (top right).
- **Mobile**: 3-dot menu icon in the sticky header bar, at the right margin, same row as the centered Ibadat logo.

### Behavior
- Menu contains a single item: "Dynamic Goals" with a switch/toggle.
- Toggling writes to the `user_preferences` table.
- When enabled, published admin goals are fetched and displayed inline.

### Changes
- `src/pages/Goals.tsx` -- add 3-dot menu with Dynamic Goals toggle (desktop)
- `src/components/layout/AppLayout.tsx` -- add 3-dot menu to mobile header (right side), ensure logo remains centered
- `src/hooks/useUserPreferences.ts` -- read/write `dynamic_goals_enabled` preference

---

## Phase 4: Dynamic Goals on User-Facing Pages

### Goals Page (`/goals`)
- When Dynamic Goals is enabled, published admin goals matching today's recurrence are merged inline with user-created goals.
- Dynamic goals appear in the same list, not separated. They behave like user goals (checkbox, completion tracking) but are not editable/deletable/reorderable by users.
- Each dynamic goal card shows a small "Dynamic" badge next to the recurrence label (e.g., "Daily" + "Dynamic").

### Today Page (`/today`)
- Dynamic goals appear inline within the existing Today's Goals section, mixed with user goals.
- Same "Dynamic" badge on each card.
- Checkbox completion with confetti, same as user goals.

### GoalCard Changes
- `src/components/goals/GoalCard.tsx` -- accept an optional `isDynamic` prop; when true, hide drag handle, hide edit/delete menu, show "Dynamic" badge. Clicking the card body does nothing (no edit).
- `src/components/goals/TodaysGoals.tsx` -- merge dynamic goals into the list, add "Dynamic" badge.

### New Files
- `src/hooks/useAdminGoalCompletions.ts` -- completions for admin goals (mirrors useGoalCompletions)
- `src/hooks/useDynamicGoals.ts` -- fetches published admin goals, filters by recurrence, respects preference toggle

---

## Phase 5: Routing

### App.tsx Changes
- Add `/elan` route wrapped in ProtectedRoute + admin role guard.
- No sidebar or nav link for Elan -- admin accesses via direct URL only.

---

## Technical Notes

- Admin role checked via `has_role()` security definer function (server-side, no client-side role storage).
- Admin goals reuse the same recurrence logic in `src/lib/recurrence.ts`, extended with "annual" type.
- No changes to existing user goals tables, hooks, or the Profile page.
- Dynamic goals completions are stored separately in `admin_goal_completions` to keep data isolated.
- Dark mode / light mode toggle is deferred to a future iteration.

