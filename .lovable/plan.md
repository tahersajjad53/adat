

## Reformat Month View Header

### Change in `src/components/calendar/MonthView.tsx` (lines 140-146)

Replace the centered stacked header with a single row: English month left-aligned, Hijri month right-aligned at `text-2xl`.

```tsx
{/* Month/Year header */}
<div className="flex items-baseline justify-between mb-4">
  <h2 className="font-display tracking-tight font-normal text-xl">
    {monthLabel}
  </h2>
  <p className="text-2xl text-muted-foreground">{hijriHeader}</p>
</div>
```

