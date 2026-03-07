

## Move Hijri Date to Same Row as Gregorian Date

### Change

**`src/pages/Calendar.tsx`** (lines 111-116) — Update the selected date header layout:
- Make the container a `flex` row with `justify-between items-baseline`
- Keep the Gregorian date / "Today" label as `h2` on the left
- Move the Hijri date `p` to the right side of the same row

```tsx
<div className="px-1 flex justify-between items-baseline">
  <h2 className="text-lg font-bold font-display">
    {showingToday ? 'Today' : selectedDateLabel}
  </h2>
  <p className="text-sm text-muted-foreground">{selectedHijriLabel}</p>
</div>
```

Single file, 1 line structural change.

