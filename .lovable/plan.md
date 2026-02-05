
# Improve Sidebar Footer UI

## Overview

Simplify the sidebar footer by merging the user info with the Profile action, and stacking the buttons vertically instead of side-by-side.

---

## Current vs Proposed Layout

```text
CURRENT (Expanded)                   PROPOSED (Expanded)
+---------------------------+        +---------------------------+
| test                      |        | 👤 test                   | <- Clickable
| test@test.com             |        |    test@test.com          |    (goes to Profile)
+---------------------------+        +---------------------------+
| [Profile]    [Sign out]   |        | [Sign out]                |
+---------------------------+        +---------------------------+

CURRENT (Collapsed)                  PROPOSED (Collapsed)
+-------+                            +-------+
| [👤]  |                            | [👤]  | <- Profile
| [🚪]  |                            | [🚪]  | <- Sign out
+-------+                            +-------+
```

---

## Changes

### File: `src/components/layout/AppSidebar.tsx`

1. **Merge user info with Profile action**: Make the user info block (name + email) clickable to navigate to `/profile`
2. **Add User icon** next to the name when expanded
3. **Remove separate Profile button**: No longer needed since clicking user info navigates to profile
4. **Stack Sign out below**: Place the Sign out button in its own row below the user info
5. **Collapsed mode**: Show User icon (for Profile) and LogOut icon stacked vertically

---

## Technical Implementation

### Expanded State
- Clickable container with User icon, display name, and email
- Hover effect to indicate interactivity
- Sign out button below on its own row

### Collapsed State  
- User icon button (navigates to profile)
- LogOut icon button (signs out)
- Both stacked vertically

---

## Code Structure

```typescript
<SidebarFooter>
  <SidebarSeparator />
  <div className="p-2 space-y-2">
    {/* Clickable user info - navigates to profile */}
    <button
      onClick={() => navigate('/profile')}
      className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-sidebar-accent transition-colors text-left"
    >
      <User className="h-5 w-5 shrink-0" />
      {!isCollapsed && (
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
      )}
    </button>
    
    {/* Sign out button - full width */}
    <Button
      variant="ghost"
      size={isCollapsed ? 'icon' : 'sm'}
      onClick={signOut}
      className="w-full justify-start gap-2"
    >
      <LogOut className="h-4 w-4" />
      {!isCollapsed && <span>Sign out</span>}
    </Button>
  </div>
</SidebarFooter>
```

---

## Benefits

- Cleaner UI with less redundancy
- Single tap/click to access profile
- Consistent vertical stacking in both expanded and collapsed states
- Better use of space
