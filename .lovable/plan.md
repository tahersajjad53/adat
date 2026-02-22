
# Two Improvements: Toast Position + Completed Goals Page

## 1. Move Toast to Bottom on Mobile

The Sonner toaster in `src/components/ui/sonner.tsx` currently uses default positioning (top). We'll pass `position="bottom-center"` on mobile and keep `"top-center"` on desktop. Since this component doesn't have access to React hooks easily (it's rendered at the App root), we'll use the Sonner `position` prop with a responsive approach.

**File: `src/components/ui/sonner.tsx`**
- Import `useIsMobile` from `@/hooks/use-mobile`
- Set `position={isMobile ? "bottom-center" : "top-center"}`
- Add `style={{ bottom: '5rem' }}` (or a className offset) so toasts sit above the mobile bottom nav (~80px/5rem tall)

## 2. Completed Goals History Page

A new page showing all goal completions, accessible from the 3-dot menu on the Goals page.

### New file: `src/pages/CompletedGoals.tsx`
- Fetches all `goal_completions` for the user (joined with goal title)
- Groups by date (most recent first)
- Shows each completion with goal title, completion date, and recurrence badge
- Simple read-only list (no toggle/edit)

### New hook: `src/hooks/useCompletedGoalsHistory.ts`
- Queries `goal_completions` table for the current user, ordered by `completed_at DESC`
- Joins with `goals` table to get title and recurrence info
- Paginated or limited to last 30 days

### Route and navigation changes:
- **`src/App.tsx`**: Add `/goals/completed` route inside `AppLayout` with `ProtectedRoute`
- **`src/pages/Goals.tsx`**: Add "Completed Goals" menu item in the desktop 3-dot `DropdownMenu`
- **`src/components/layout/AppLayout.tsx`**: Add "Completed Goals" menu item in the mobile 3-dot `DropdownMenu` for the goals page

---

## Technical Details

### Toast positioning
The Sonner `<Toaster>` component accepts a `position` prop. On mobile, we use `"bottom-center"` with a bottom offset to clear the bottom nav bar. The `useIsMobile` hook returns `undefined` initially, so we default to `"top-center"` until hydrated.

### Completed Goals query
```sql
SELECT gc.*, g.title, g.recurrence_type, g.description
FROM goal_completions gc
JOIN goals g ON gc.goal_id = g.id
WHERE gc.user_id = :userId
ORDER BY gc.completed_at DESC
LIMIT 100
```
Since Supabase JS client supports foreign key joins, this becomes:
```ts
supabase
  .from('goal_completions')
  .select('*, goals(title, recurrence_type, description)')
  .eq('user_id', user.id)
  .order('completed_at', { ascending: false })
  .limit(100)
```

### Files changed
| File | Change |
|------|--------|
| `src/components/ui/sonner.tsx` | Add mobile-aware `position` prop |
| `src/hooks/useCompletedGoalsHistory.ts` | New hook for fetching completion history |
| `src/pages/CompletedGoals.tsx` | New page listing completed goals grouped by date |
| `src/App.tsx` | Add `/goals/completed` route |
| `src/pages/Goals.tsx` | Add "Completed Goals" link in desktop 3-dot menu |
| `src/components/layout/AppLayout.tsx` | Add "Completed Goals" link in mobile 3-dot menu |
