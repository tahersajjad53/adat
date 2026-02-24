
# Goals Page Improvements

## 1. Always Show 3-Dot Menu on Mobile Only

**File: `src/components/goals/GoalCard.tsx`**

The GoalCard needs to know if it's on mobile. Import `useIsMobile` and conditionally apply the opacity classes:

- On mobile: always show the 3-dot menu (remove `opacity-0 group-hover:opacity-100`)
- On desktop: keep the current hover-to-reveal behavior

Change line 158 from:
```
className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
```
To:
```
className={`h-7 w-7 shrink-0 ${isMobile ? '' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
```

## 2. Default New Goals to "One-time" with Today's Date Pre-filled

**File: `src/components/goals/GoalFormSheet.tsx`**

When creating a new goal (not editing), set the default so it behaves as a "today" preset:

- Keep `recurrenceType` as `'one-time'` (line 112)
- Set `dueDate` to today's date instead of empty string (line 115): `setDueDate(new Date().toISOString().split('T')[0])`

This means the form opens with "one-time" recurrence and today's date already filled in, matching a "Today" preset. The recurrence summary will show "Today" automatically.

## 3. Fix Mobile Sheet Height So Footer Is Always Visible

**File: `src/components/goals/GoalFormSheet.tsx`**

Change the mobile `SheetContent` (line 285) from:
```
<SheetContent side="bottom" className="h-[90vh] overflow-y-auto" ...>
  <SheetHeader>...</SheetHeader>
  <div className="py-4">{formContent}</div>
  <SheetFooter>{footer}</SheetFooter>
</SheetContent>
```
To a flex layout that pins the footer:
```
<SheetContent side="bottom" className="max-h-[85vh] flex flex-col" ...>
  <SheetHeader>...</SheetHeader>
  <div className="flex-1 overflow-y-auto py-4">{formContent}</div>
  <SheetFooter>{footer}</SheetFooter>
</SheetContent>
```

This ensures the Cancel/Save buttons are always visible at the bottom without scrolling.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/goals/GoalCard.tsx` | Import `useIsMobile`; conditionally show 3-dot menu always on mobile, hover-reveal on desktop |
| `src/components/goals/GoalFormSheet.tsx` | Default `dueDate` to today for new goals; fix mobile sheet to flex layout with pinned footer |
