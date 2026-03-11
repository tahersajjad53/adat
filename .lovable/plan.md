

## Increase Hijri Text Size & Add Row Spacing in Month View

### Changes to `src/components/calendar/MonthView.tsx`

1. **Hijri numeral size**: `text-lg` → `text-xl` (line 185)
2. **Day cell padding**: `py-1.5` → `py-2.5` to give each row breathing room (line 177)
3. **Empty cell padding**: `py-2` → `py-2.5` to match (line 163)
4. **Add gap between week rows**: Add `gap-1` to the outer weeks container or wrap each row with spacing

This keeps day rows visually separated while the larger Hijri numerals fill the cell better.

