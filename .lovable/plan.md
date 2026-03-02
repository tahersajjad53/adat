

## Plan: Add completed/total counter to Goals page (mobile only)

### Change

**`src/pages/Goals.tsx`** (around lines 154-163)

Add a completion counter (e.g., "3/7") to the right of the title, visible only on mobile via `md:hidden` class. Desktop header stays unchanged.

Compute values from existing arrays:
- `completedCount` = `[...userGoalsWithStatus, ...dynamicGoalsWithStatus].filter(g => g.isCompleted).length`
- `totalCount` = `userGoalsWithStatus.length + dynamicGoalsWithStatus.length`

Insert between the title div and the buttons div:
```tsx
{isMobile && (
  <span className="text-sm text-muted-foreground">{completedCount}/{totalCount}</span>
)}
```

The `isMobile` hook is already imported and available. Single file, minimal edit.

