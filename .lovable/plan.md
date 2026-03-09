

## Add "Today" Navigation Button to Calendar Header

### Change

**`src/pages/Calendar.tsx`** (lines 103-109) — Add a text-only "Today" button on the left side of the date header row. It appears only when the user is not viewing the current day, and resets both `selectedDate` and `weekOffset` to today.

```tsx
<div className="px-1 flex justify-between items-baseline">
  <div className="flex items-baseline gap-3">
    {!showingToday && (
      <button
        onClick={() => { setSelectedDate(new Date()); setWeekOffset(0); }}
        className="text-sm font-medium text-primary"
      >
        Today
      </button>
    )}
    <h2 className="font-display tracking-tight font-normal text-xl">
      {showingToday ? 'Today' : selectedDateLabel}
    </h2>
  </div>
  <p className="text-sm text-muted-foreground">{selectedHijriLabel}</p>
</div>
```

When viewing today, the button hides (since the heading already says "Today"). When viewing any other date, the "Today" button appears at the left margin for quick return.

