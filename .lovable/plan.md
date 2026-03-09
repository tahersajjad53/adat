

## Move "Today" Button to App Header

### Problem
The "Today" button currently sits inline with the date label on the calendar page. The user wants it in the app header bar (left side, with logo centered) for better accessibility, and to restore the previous date display layout.

### Changes

**1. `src/components/layout/AppLayout.tsx`**
- Detect `isCalendarPage` from route (`/calendar`)
- Replace the left `<div className="w-10" />` spacer with a "Today" button on the calendar page
- The button dispatches a custom DOM event (`calendar:goToToday`) since the header doesn't have access to the calendar's state
- Button is always visible on the calendar page (text-only, same `text-sm font-medium text-primary` style) but invisible/disabled when already on today (or simply always shown — tapping while on today is a no-op)

**2. `src/pages/Calendar.tsx`**
- Listen for the `calendar:goToToday` custom event and reset `selectedDate` + `weekOffset`
- Remove the inline "Today" button from the date header row
- Restore the previous date display: just the date label on the left and Hijri on the right (no conditional Today button inline)

### Why custom event?
The header lives in `AppLayout` and the calendar state lives in `Calendar.tsx`. A lightweight custom event avoids needing a new context or prop drilling. The Calendar component listens on mount and cleans up on unmount.

```text
┌─────────────────────────────┐
│ Today    [ibadat logo]   ∅  │  ← header bar
├─────────────────────────────┤
│  S  M  T  W  T  F  S       │  ← week row
├─────────────────────────────┤
│ Wednesday, March 11   8 Ram │  ← restored date display
└─────────────────────────────┘
```

