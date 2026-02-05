
# Update Tab UI Styling

## Overview

Redesign the tabs component to match the reference image - featuring icon+text layout with an underlined stroke on active/hover instead of a filled background. This will become the global styling for all tabs in the app.

## Visual Design

```text
+-------------------------+-------------------------+
|  📿 Today's Namaz       |  ⚠ Missed Namaz    [3] |
|  ═══════════════        |                         |
+-------------------------+-------------------------+
          ↑ underline stroke on active tab
```

**Key changes:**
- Remove filled background on active state
- Add bottom border/underline (2-3px) for active state
- Subtle underline on hover
- Icon + text layout with proper spacing
- Use primary color (forest green) for active state
- Use muted-foreground for inactive tabs

## Files to Modify

### 1. `src/components/ui/tabs.tsx` (Global styling)

Update the base tabs component with new styling:

**TabsList:**
- Remove `bg-muted` background
- Add subtle bottom border as baseline
- Remove rounded corners and padding

**TabsTrigger:**
- Remove `data-[state=active]:bg-background` (filled background)
- Add `data-[state=active]:border-b-2` or `border-b-primary` for underline
- Add hover state with subtle underline
- Use `gap-2` for icon+text spacing
- Style: muted text when inactive, primary/foreground when active

```typescript
// TabsList new classes
"inline-flex h-12 items-center justify-center w-full border-b border-border"

// TabsTrigger new classes  
"inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium 
 text-muted-foreground transition-all border-b-2 border-transparent
 hover:text-foreground hover:border-muted-foreground/50
 data-[state=active]:text-primary data-[state=active]:border-primary"
```

### 2. `src/pages/Namaz.tsx`

Update the tabs usage:
- Add icons: `Clock` for Today's Namaz, `WarningCircle` for Missed Namaz
- Update labels: "Today's Prayers" → "Today's Namaz", "Missed Prayers" → "Missed Namaz"
- Keep the badge/count indicator on Missed tab

```tsx
<TabsTrigger value="today">
  <Clock className="h-4 w-4" />
  Today's Namaz
</TabsTrigger>
<TabsTrigger value="missed">
  <WarningCircle className="h-4 w-4" />
  Missed Namaz
  {unfulfilledCount > 0 && (
    <span className="...badge styles...">{unfulfilledCount}</span>
  )}
</TabsTrigger>
```

## Color Scheme

| State | Text Color | Underline |
|-------|-----------|-----------|
| Inactive | `text-muted-foreground` | None |
| Hover | `text-foreground` | Subtle muted |
| Active | `text-primary` (forest green) | Solid primary (2px) |

## Implementation Summary

1. **Update `src/components/ui/tabs.tsx`** - New global styling with underline instead of filled background
2. **Update `src/pages/Namaz.tsx`** - Add icons, update labels, reposition badge

This creates a reusable tab pattern that can be applied anywhere in the app with consistent icon+text+underline styling.
