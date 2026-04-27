## Promote Hijri Date on Qaza Group Headers

Make the Hijri date the primary line on each date group card in the Qaza Namaz page, render it in Arabic using the Al-Kanz font at a larger size, and demote the Gregorian date to the secondary line.

### Change

**`src/pages/QazaNamaz.tsx`** — group header block (`<div className="px-4 py-2.5 bg-muted/40 border-b border-border">`):

Before:
```tsx
<p className="text-sm font-medium text-foreground">{group.dateLabel}</p>
<p className="text-xs text-muted-foreground">
  {formatHijriDate(group.preMaghribHijri, 'long')}
</p>
```

After:
```tsx
<p
  dir="rtl"
  lang="ar"
  className="font-display text-2xl leading-tight text-foreground"
>
  {formatHijriDate(group.preMaghribHijri, 'arabic')}
</p>
<p className="text-xs text-muted-foreground mt-0.5">{group.dateLabel}</p>
```

### Notes

- `formatHijriDate(..., 'arabic')` already returns the day + Arabic month name + year (e.g. `9 ذو القعدة 1447`).
- Al-Kanz is the project's default `font-sans` and `font-display`, and it renders Arabic glyphs via its `unicode-range` declaration — no extra font class needed beyond `font-display`.
- Slight vertical padding bump on the header block (`py-3`) optional for breathing room with the larger text.

### Out of scope

No other Hijri/Gregorian pairs in the app are reordered — this change is scoped to the Qaza Namaz date group cards only.
