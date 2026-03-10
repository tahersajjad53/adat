

## Always Show Radial Ring on Tasbeeh Counter Page

The radial progress ring is conditionally hidden when no target is set (`hasTarget` check). It should always be visible — showing a full decorative ring when there's no target, and a progress ring when there is one.

### Change: `src/pages/TasbeehCounter.tsx`

1. **Always render the SVG ring** — remove the `{hasTarget && ...}` conditional around the SVG
2. When no target is set, show the full ring using `hsl(var(--primary))` at reduced opacity as a decorative border
3. When a target is set, show the progress arc as it currently works

The track circle (muted background) renders always. The progress circle renders with `strokeDashoffset = 0` (full ring) when no target, or the calculated offset when there is a target.

