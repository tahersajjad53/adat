

## Fix Tasbeeh Counter Number Off-Center

The number appears visually shifted upward because of default line-height adding extra space above and below the text. With `text-8xl font-bold`, the default line-height creates significant invisible padding. Additionally, digit glyphs sit on the baseline with descender space below them, pushing the visual center up.

### Change: `src/pages/TasbeehCounter.tsx` (line 111)

Add `leading-none` to strip extra line-height, and add a small `translate-y` nudge (`pt-2` or `translate-y-1`) to compensate for the baseline offset of digit characters:

```tsx
<span className="text-8xl font-bold text-foreground font-display tabular-nums leading-none">
```

`leading-none` sets `line-height: 1`, removing the extra vertical space that the default `line-height: 1.2` adds around the text. This alone should resolve most of the visual offset since the button container already uses `flex items-center justify-center`.

