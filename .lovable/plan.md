

## Plan: Hijri subtitle + Hijri recurrence presets in DateRecurrenceTimePopover

### Changes — single file: `src/components/goals/DateRecurrenceTimePopover.tsx`

**1. Import `gregorianToBohra` and `formatHijriDate`** from `@/lib/hijri`

**2. Compute Hijri date from selected date** (around line 178)
```ts
const hijriDate = date ? gregorianToBohra(new Date(date + 'T12:00:00'), timezone) : null;
```

**3. Add Hijri subtitle below the header** in both Sheet (line 366) and Dialog (line 379) headers:
```tsx
<SheetTitle>{date ? formatDateShort(date) : 'Pick a date'}</SheetTitle>
{hijriDate && (
  <p className="text-sm text-muted-foreground">{formatHijriDate(hijriDate, 'long')}</p>
)}
```
Same pattern for DialogHeader.

**4. Add two Hijri recurrence presets** to the `recurrencePresets` array (after line 212), using the computed `hijriDate`:
```ts
// Hijri monthly
{
  label: `Every month on ${hijriDate.day} (Hijri)`,
  onClick: () => handleRecurrencePreset('custom', undefined, {
    type: 'monthly',
    monthlyDay: hijriDate.day,
    calendarType: 'hijri',
  }),
},
// Hijri annual
{
  label: `Every year on ${hijriDate.day} ${hijriDate.monthNameEn} (Hijri)`,
  onClick: () => handleRecurrencePreset('annual', undefined, {
    type: 'annual',
    annualMonth: hijriDate.month,
    monthlyDay: hijriDate.day,
    calendarType: 'hijri',
  }),
},
```
These presets are only added when `hijriDate` is not null. They leverage existing `calendarType: 'hijri'` support in `isMonthlyDue` and `isAnnualDue`.

### Result
- Header shows "2 Mar 2026" with "3 Shabaan 1447 H" subtitle beneath, updating as the user picks dates
- Recurrence section gains two Hijri-based options alongside the existing Gregorian ones

