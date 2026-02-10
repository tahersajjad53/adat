

# Tap-to-Edit Goals + Sabeel Layout Improvements

## 1. Goal Cards: Tap to Open Edit View

Currently, users must tap the 3-dot menu then select "Edit" to modify a goal. This change makes the content area of each goal card tappable to directly open the edit form.

### GoalCard.tsx (Goals page)
- Make the content area (title, description, badges) clickable by wrapping it in a `<button>` or adding an `onClick` handler to the content `<div>`
- Clicking the content area calls `onEdit(goal)` directly
- The checkbox, drag handle, and 3-dot menu remain as separate interactive elements (not affected by the tap)
- Add `cursor-pointer` to the content area for visual feedback

### TodaysGoals.tsx (Dashboard)
- Make each goal row's content area tappable -- navigate to `/goals` page where the user can manage goals
- This is simpler since the Today view doesn't have inline editing; tapping navigates to the Goals page

## 2. Sabeel Card: Tap Sub-Items to Edit

### SabeelCard.tsx
- Make each FMB Hub, Khumus, and Zakat item row tappable to open its edit form
- Add `onClick` to the card `<div>` that calls the respective `onEditFMBHub`, `onEditKhumus`, or `onEditZakat` handler
- Add `cursor-pointer` styling
- The edit/delete icon buttons remain but the whole row also becomes tappable

## 3. Sabeel Card: Improved Spacing and Visual Hierarchy

The current collapsible content uses uniform `space-y-3` between all sections (FMB Hub, Khumus, Zakat), giving equal spacing between a section label and its items vs. between different sections. This makes it hard to visually group related information.

### Changes to SabeelCard.tsx spacing:
- Increase spacing between **sections** (FMB Hub, Khumus, Zakat) from `space-y-3` to `space-y-6` -- this creates clear visual separation between different obligation types
- Keep the spacing between a **section header and its items** tight at `mb-2` (already in place)
- Keep spacing between **items within a section** at `space-y-2` (already in place)
- Add a subtle `border-t border-border/50` separator between sections for additional visual clarity
- Increase padding inside the collapsible content from `py-3` to `py-4` for more breathing room at top and bottom

### Before vs After spacing:
```text
BEFORE (uniform space-y-3):        AFTER (grouped by proximity):
FMB HUB label                      FMB HUB label
   [small gap]                        [small gap]
   9,200/month                        9,200/month
   [small gap]                        
KHUMUS label                           [large gap + divider]
   [small gap]                      
   Taher - 14,500                   KHUMUS label
   [small gap]                        [small gap]
ZAKAT label                            Taher - 14,500
   [small gap]                      
   No Zakat entries                    [large gap + divider]
                                    
                                    ZAKAT label
                                       [small gap]
                                       No Zakat entries
```

## Files Changed
- `src/components/goals/GoalCard.tsx` -- add onClick to content area calling onEdit
- `src/components/goals/TodaysGoals.tsx` -- add onClick to goal rows navigating to /goals
- `src/components/dues/SabeelCard.tsx` -- make sub-item rows tappable + increase inter-section spacing from space-y-3 to space-y-6, add section dividers, increase padding

