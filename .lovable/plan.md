

## Dedicated Admin Portal at `/admin`

A role-gated admin portal with its own layout and sidebar, separate from the main app navigation. Same login system — no separate auth. Admins access it via `/admin`, non-admins get redirected.

### Architecture

```text
/admin                → Admin dashboard (overview/stats)
/admin/elans          → Current Elan functionality (moved here)
/admin/tags           → Tag management (CRUD for goal tags)
/admin/users          → User directory / role management
/admin/notifications  → Push notification campaigns
/admin/analytics      → Usage analytics dashboard
```

### Implementation

**1. Admin layout (`src/components/admin/AdminLayout.tsx`)**
- Own `SidebarProvider` + sidebar with admin nav items (Elans, Tags, Users, etc.)
- Desktop: collapsible sidebar. Mobile: sheet-based sidebar with hamburger trigger
- Role gate built into the layout — checks `useUserRole().isAdmin`, redirects non-admins to `/today`
- Header shows "Admin" label + link back to main app

**2. Admin route group in `App.tsx`**
- Nest all `/admin/*` routes under a single `<ProtectedRoute>` + `<AdminLayout>` wrapper
- Move current Elan page content to `/admin/elans`
- Keep `/elan` as a redirect to `/admin/elans` for backward compatibility

```tsx
<Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
  <Route index element={<AdminDashboard />} />
  <Route path="elans" element={<AdminElans />} />
  <Route path="tags" element={<AdminTags />} />
  {/* Future: users, notifications, analytics */}
</Route>
```

**3. Admin sidebar (`src/components/admin/AdminSidebar.tsx`)**
- Nav items: Dashboard, Elans, Tags (start with these three)
- Footer: "Back to App" link → `/today`
- Uses the same shadcn Sidebar components as the main app

**4. Tag management page (`src/pages/admin/AdminTags.tsx`)**
- CRUD for the preset tag list (currently hardcoded in `GOAL_TAGS`)
- Move tags to a `tags` table in Supabase so admins can add/edit/remove tags without code changes
- New table: `tags (id uuid, label text, slug text unique, sort_order int, is_active bool, created_at timestamptz)`
- RLS: admins can CRUD, authenticated users can SELECT active tags
- Update `GoalFormSheet` to fetch tags from DB instead of the hardcoded constant

**5. Rename/migrate current Elan page**
- `src/pages/Elan.tsx` → `src/pages/admin/AdminElans.tsx` (same component, just moved)
- Old `/elan` route becomes a `<Navigate to="/admin/elans" replace />`

### What NOT to change
- No separate login or auth system — same Supabase auth, same `useUserRole` hook
- No separate deployment — same codebase, same build
- Main app sidebar does NOT show admin links (admin portal is accessed via direct URL or a subtle link in the profile page)

### Phased rollout
- **Phase 1** (now): Admin layout + sidebar, move Elans, add Tags page
- **Phase 2** (later): User management, push notification campaigns
- **Phase 3** (later): Analytics dashboard

### Files to create/edit
- **New**: `AdminLayout.tsx`, `AdminSidebar.tsx`, `AdminDashboard.tsx`, `AdminElans.tsx`, `AdminTags.tsx`, `useAdminTags.ts`
- **Edit**: `App.tsx` (new route group), `GoalFormSheet.tsx` (fetch tags from DB)
- **Migration**: Create `tags` table
- **Delete/redirect**: Current `/elan` route

