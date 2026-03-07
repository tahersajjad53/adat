

## Add Admin Users Page

### Database
Create a `SECURITY DEFINER` function `get_admin_users()` that joins `auth.users` with `public.profiles`. Returns data only when the caller is an admin (via `has_role`). No new tables needed.

```sql
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  city text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id, u.email::text, p.full_name, p.city, u.created_at, u.last_sign_in_at
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE public.has_role(auth.uid(), 'admin')
  ORDER BY u.created_at DESC
$$;
```

### New files

**`src/pages/admin/AdminUsers.tsx`**
- Calls `supabase.rpc('get_admin_users')` via react-query
- Table with columns: Name, Email, City, Signed Up, Last Active
- User count in header
- Avatar fallback with initials
- Follows same layout pattern as AdminTags/AdminElans (container, max-w-2xl, heading + description)

### Edits

**`src/components/admin/AdminSidebar.tsx`** — Add Users nav item (import `Group` icon from iconoir-react)

**`src/App.tsx`** — Add `<Route path="users" element={<AdminUsers />} />` inside admin route group

**`src/pages/admin/AdminDashboard.tsx`** — Add a Users card linking to `/admin/users`

**`src/integrations/supabase/types.ts`** — Will be auto-updated with the new function type after migration

