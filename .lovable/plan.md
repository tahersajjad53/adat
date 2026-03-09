

## Style "Today" Recurrence Badge as Green Pill

### Change

**`src/components/goals/GoalCard.tsx`** (line 134-136) — Conditionally apply a pastel green background when `recurrenceLabel === 'Today'`:

```tsx
<Badge
  variant="secondary"
  className={`text-[10px] px-1.5 py-0.5 shrink-0 ${
    recurrenceLabel === 'Today'
      ? 'bg-green-100 text-green-900 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
      : ''
  }`}
>
  {recurrenceLabel}
</Badge>
```

This targets only the "Today" label with a pastel green fill and dark text, leaving all other recurrence labels (Daily, Weekly, etc.) unchanged. Dark mode gets a subtle green tint.

