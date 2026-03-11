
Goal: fix the big Tasbeeh count so it is visually centered inside the radial circle (not top-heavy).

1) Root-cause fix in `src/pages/TasbeehCounter.tsx`
- Replace the current inline count span centering approach (`grid place-items-center` + `leading-[0.85]` + tiny `translate-y`) with a dedicated absolute overlay center layer.
- Structure:
  - Keep the ring SVG as-is.
  - Add `absolute inset-0 flex items-center justify-center pointer-events-none` wrapper for the number.
  - Render the number as `block leading-none` and apply an optical offset using `translateY` in `em` units (e.g. `0.08em`) so it scales correctly with font size.
- This avoids baseline/line-box quirks that are causing the “still top-heavy” look.

2) Typography tuning for stability
- Keep existing visual style (`text-8xl`, bold, tabular numbers), but remove the brittle line-height hack and tiny fixed-pixel nudge.
- If needed after first pass, switch only the number to `font-sans` (while keeping page title styles unchanged) to reduce display-font metric bias.

3) Consistency pass (small counters)
- Apply the same centering pattern to `src/components/tasbeeh/TasbeehCard.tsx` count text so both large and small radial counters feel aligned and consistent.

4) Verification checklist
- Validate with values: `1`, `11`, `88`, `100` to ensure optical centering holds across different glyph shapes/widths.
- Check on the current mobile viewport (430x719) to match your screenshot context.
- Confirm no regression to tap behavior, ring animation, or target label spacing.
