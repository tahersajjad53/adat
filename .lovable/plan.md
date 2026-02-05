

# Side Navigation with Iconoir Icons

## Overview

Add a responsive navigation system that adapts between desktop (side navigation) and mobile (bottom tab bar), using **Iconoir** as the new icon library for all icons going forward.

---

## Icon Library Migration

### Installing Iconoir

```bash
npm install iconoir-react
```

### Icon Mapping (Lucide to Iconoir)

| Purpose | Lucide Icon | Iconoir Icon |
|---------|-------------|--------------|
| Home/Dashboard | `Home` | `Home` |
| Prayer/Time | `Clock` | `Clock` |
| User/Profile | `User` | `User` |
| Logout | `LogOut` | `LogOut` |
| Back Arrow | `ArrowLeft` | `NavArrowLeft` |
| Location/Map | `MapPin` | `MapPin` |
| Check/Done | `Check` | `Check` |
| Alert | `AlertCircle` | `WarningCircle` |
| Eye (show) | `Eye` | `Eye` |
| Eye (hide) | `EyeOff` | `EyeClosed` |
| Loading | `Loader2` | `Refresh` (with animation) |
| Sun | `Sun` | `SunLight` |
| Moon | `Moon` | `HalfMoon` |
| Sunrise | `Sunrise` | `Sunrise` |
| Sunset | `Sunset` | `Sunset` |
| Chevron Right | `ChevronRight` | `NavArrowRight` |
| Chevrons | `ChevronsUpDown` | `MoreVert` or custom |
| Filter | `Filter` | `Filter` |
| Rotate/Redo | `RotateCcw` | `Undo` |
| Save | `Save` | `Save` or `FloppyDisk` |
| Menu Panel | `PanelLeft` | `SidebarCollapse` |

---

## Layout Architecture

```text
Desktop (>=768px)                    Mobile (<768px)
+--------------------------------+   +----------------------------+
| Logo                           |   | Header (simplified)        |
+--------------------------------+   +----------------------------+
| NAVIGATION                     |   |                            |
| |-- Dashboard                  |   |                            |
| |-- Namaz                      |   |      Main Content          |
|                                |   |                            |
| ACCOUNT                        |   |                            |
| |-- Profile                    |   |                            |
|                                |   |                            |
|           (spacer)             |   +----------------------------+
|                                |   | [Home] [Pray] [User] [Out] |
| +---------------------------+  |   +----------------------------+
| | User Name                 |  |
| | user@email.com            |  |
| | [Logout button]           |  |
| +---------------------------+  |
+--------------------------------+
```

---

## Components to Create

### 1. `src/components/layout/AppSidebar.tsx`
Desktop sidebar using Shadcn Sidebar components with Iconoir icons:
- **Header**: App logo
- **Navigation Group**: Dashboard, Namaz links with icons
- **Account Group**: Profile link
- **Footer**: User info (name + email) with logout button
- Active route highlighting using `NavLink` component
- Collapsible to icon-only mode

### 2. `src/components/layout/MobileBottomNav.tsx`
Fixed bottom navigation bar for mobile with Iconoir icons:
- Fixed position at bottom of screen
- 4 items: Home (Dashboard), Namaz, Profile, Logout
- Active state indication
- Safe area padding for notched devices

### 3. `src/components/layout/AppLayout.tsx`
Wrapper layout component that:
- Detects mobile vs desktop using `useIsMobile` hook
- Renders sidebar on desktop, bottom nav on mobile
- Wraps page content appropriately
- Handles logout functionality

---

## Navigation Items

| Label | Iconoir Icon | Route | Description |
|-------|--------------|-------|-------------|
| Dashboard | `Home` | `/dashboard` | Main dashboard |
| Namaz | `Clock` | `/namaz` | Prayer tracker |
| Profile | `User` | `/profile` | User settings |
| Logout | `LogOut` | (action) | Sign out user |

---

## Files to Create/Modify

| Action | File | Description |
|--------|------|-------------|
| Create | `src/components/layout/AppSidebar.tsx` | Desktop sidebar |
| Create | `src/components/layout/MobileBottomNav.tsx` | Mobile bottom nav |
| Create | `src/components/layout/AppLayout.tsx` | Responsive layout wrapper |
| Modify | `src/pages/Dashboard.tsx` | Remove header, use layout |
| Modify | `src/pages/Namaz.tsx` | Remove header, use layout |
| Modify | `src/pages/Profile.tsx` | Remove header, use layout |
| Modify | `src/App.tsx` | Wrap protected routes with AppLayout |
| Modify | `src/index.css` | Add safe area utilities |
| Migrate | Multiple files | Replace lucide-react imports with iconoir-react |

---

## Implementation Details

### AppSidebar Component (Iconoir)

```typescript
import { Home, Clock, User, LogOut, SidebarCollapse } from 'iconoir-react';

// Structure
<Sidebar collapsible="icon">
  <SidebarHeader>
    <img src={adatLogo} alt="Adat" />
    <span>Adat</span>
  </SidebarHeader>
  
  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <NavLink to="/dashboard">
              <Home /> Dashboard
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <NavLink to="/namaz">
              <Clock /> Namaz
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
    
    <SidebarGroup>
      <SidebarGroupLabel>Account</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <NavLink to="/profile">
              <User /> Profile
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  </SidebarContent>
  
  <SidebarFooter>
    <!-- User info + logout button -->
  </SidebarFooter>
</Sidebar>
```

### MobileBottomNav Component (Iconoir)

```typescript
import { Home, Clock, User, LogOut } from 'iconoir-react';

<nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
  <div className="flex justify-around items-center h-16 pb-safe">
    <NavLink to="/dashboard" className="flex flex-col items-center gap-1">
      <Home className="h-5 w-5" />
      <span className="text-xs">Home</span>
    </NavLink>
    <NavLink to="/namaz" className="flex flex-col items-center gap-1">
      <Clock className="h-5 w-5" />
      <span className="text-xs">Namaz</span>
    </NavLink>
    <NavLink to="/profile" className="flex flex-col items-center gap-1">
      <User className="h-5 w-5" />
      <span className="text-xs">Profile</span>
    </NavLink>
    <button onClick={signOut} className="flex flex-col items-center gap-1">
      <LogOut className="h-5 w-5" />
      <span className="text-xs">Logout</span>
    </button>
  </div>
</nav>
```

### CSS Safe Area Addition (index.css)

```css
@layer utilities {
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
}
```

---

## Files Requiring Icon Migration

These files currently use lucide-react and will be migrated to iconoir-react:

| File | Icons to Migrate |
|------|------------------|
| `src/pages/Dashboard.tsx` | LogOut, MapPin, User, ChevronRight, AlertCircle |
| `src/pages/Namaz.tsx` | ArrowLeft, AlertCircle |
| `src/pages/Profile.tsx` | ArrowLeft, Loader2, Save |
| `src/pages/Onboarding.tsx` | Loader2 |
| `src/components/calendar/DateDisplay.tsx` | Moon, Sun, MapPin, Loader2 |
| `src/components/auth/PasswordInput.tsx` | Eye, EyeOff |
| `src/components/profile/LocationSelector.tsx` | Check, ChevronsUpDown, MapPin, Loader2 |
| `src/components/namaz/PrayerCard.tsx` | Check, Clock, AlertCircle |
| `src/components/namaz/CurrentPrayerCard.tsx` | Clock, Check, Sunrise, Sun, Sunset, Moon |
| `src/components/namaz/MissedPrayerCard.tsx` | Check, RotateCcw |
| `src/components/namaz/MissedPrayersList.tsx` | Filter |
| `src/components/ui/sidebar.tsx` | PanelLeft |

---

## Page Modifications

### Dashboard, Namaz, Profile Pages

Remove the individual `<header>` sections from each page since navigation will be handled by the layout. Keep only the main content.

**Before**: Each page has its own header with logo, back button, logout
**After**: Pages contain only main content; navigation is consistent via AppLayout

---

## Implementation Order

1. **Install iconoir-react** package
2. **Create layout components**:
   - `AppLayout.tsx` - responsive wrapper
   - `AppSidebar.tsx` - desktop sidebar
   - `MobileBottomNav.tsx` - mobile bottom nav
3. **Add CSS utilities** for safe areas
4. **Update App.tsx** to wrap protected routes with AppLayout
5. **Modify page components** to remove individual headers
6. **Migrate icons** from lucide-react to iconoir-react across all files

---

## Styling Notes

- Desktop sidebar width: 256px (16rem) expanded, 48px (3rem) collapsed
- Mobile bottom nav height: 64px + safe area padding
- Active states use primary color accent
- Consistent iconography from Iconoir (stroke style, 24x24 grid)
- Smooth transitions for hover/active states
- Iconoir icons accept standard SVG props: `color`, `width`, `height`, `strokeWidth`

