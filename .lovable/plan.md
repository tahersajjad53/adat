

## Reorganise Profile Settings Menu

### Changes to `src/pages/Profile.tsx`

**1. Add `'qaza'` to the `ProfileSection` type** (line 22)

**2. Add new "Monitor Qaza Namaz" sub-screen** — same pattern as theme/notifications/today-view sections: back button, title ("Monitor Qaza Namaz"), subtitle ("Track and fulfil missed prayers."), then the toggle inside a bordered card.

**3. Reorder menu items** (lines 431–511) to:
1. Today View (existing)
2. Monitor Qaza Namaz (new navigable card with arrow, replacing the inline toggle)
3. Theme (existing)
4. Notifications (existing)
5. Account Information (existing)
6. Sign Out (existing, stays last)

**4. Add icon import** — use `Clock` from iconoir-react for the Qaza item (already have it or similar).

### No other files change. The toggle moves from an inline Switch on the menu to its own sub-page, consistent with all other profile sub-sections.

