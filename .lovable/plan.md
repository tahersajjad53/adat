

## Move "Add Goal" CTA above the dotted divider

### Current behavior
The CTA sits inside the chronological timeline section, below the dotted divider.

### Target behavior
- CTA renders in the "All Day" section, after any all-day goal cards
- If there are no all-day goals, still show the CTA (and the dotted divider below it)
- The dotted divider appears whenever the CTA or all-day goals exist (not just when `allDayGoals.length > 0`)

### Change: `src/components/calendar/CalendarTimeline.tsx`

Restructure lines ~114–155:

```tsx
<div className="space-y-4">
  {/* All-day goals + Create CTA */}
  {(allDayGoals.length > 0 || onCreateGoal) && (
    <div className="space-y-2">
      {allDayGoals.length > 0 && (
        <>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            All Day
          </h3>
          <div className="space-y-3">
            {allDayGoals.map((goal) => (
              <GoalTimelineCard ... />
            ))}
          </div>
        </>
      )}
      {onCreateGoal && (
        <button onClick={onCreateGoal} className="w-full flex items-center gap-3 rounded-xl border border-dashed border-border px-4 py-4 text-muted-foreground hover:bg-muted/50 transition-colors">
          <Plus className="h-5 w-5 shrink-0" />
          <span className="text-base font-medium">Add Goal</span>
        </button>
      )}
    </div>
  )}

  {/* Divider — show when CTA or all-day goals exist AND there are timeline items */}
  {(allDayGoals.length > 0 || onCreateGoal) && items.length > 0 && (
    <div className="border-t border-dashed border-border" />
  )}

  {/* Chronological card list (remove CTA from here) */}
  <div className="space-y-3">
    {items.map(...)}
  </div>
</div>
```

Single file change, no new props needed.

