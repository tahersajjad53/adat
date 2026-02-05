

# Consolidate Account Section in Sidebar

## Overview

Remove the separate "Account" navigation group from the sidebar and move the Profile link to the footer section, placing it alongside the user info and logout button.

---

## Current vs Proposed Structure

```text
CURRENT                              PROPOSED
+----------------------------+       +----------------------------+
| Logo                       |       | Logo                       |
+----------------------------+       +----------------------------+
| NAVIGATION                 |       | NAVIGATION                 |
| |-- Dashboard              |       | |-- Dashboard              |
| |-- Namaz                  |       | |-- Namaz                  |
|                            |       |                            |
| ACCOUNT                    |       |                            |
| |-- Profile                |       |                            |
|                            |       |                            |
|        (spacer)            |       |        (spacer)            |
|                            |       |                            |
| +------------------------+ |       | +------------------------+ |
| | User Name              | |       | | User Name              | |
| | user@email.com         | |       | | user@email.com         | |
| | [Sign out]             | |       | | [Profile] [Sign out]   | |
| +------------------------+ |       | +------------------------+ |
+----------------------------+       +----------------------------+
```

---

## Changes

### File: `src/components/layout/AppSidebar.tsx`

1. **Remove** the `accountItems` array (lines 28-30)
2. **Remove** the entire Account `SidebarGroup` (lines 87-107)
3. **Add** Profile button to the footer alongside the logout button
4. **Arrange** footer buttons in a row (Profile + Sign out)

---

## Technical Details

The footer will contain:
- User name and email (when expanded)
- Two buttons in a row:
  - Profile button (navigates to `/profile`)
  - Sign out button (triggers logout)

When collapsed (icon mode):
- Both buttons show as icons only
- User info is hidden

