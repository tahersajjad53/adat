

## Tasbeeh Counter UI Fixes

### Changes in `src/pages/TasbeehCounter.tsx`

**1. Dynamic font size for 4+ digit counts**

Replace the fixed `text-8xl` class with a dynamic font size based on digit count:
- 1-3 digits: `text-8xl` (current, ~6rem)
- 4 digits: `text-7xl` (~4.5rem)  
- 5+ digits: `text-6xl` (~3.75rem)

This keeps the number inside the 260px ring (inner diameter ~224px after stroke).

**2. Zero line height**

Change `leading-none` (which is `line-height: 1`) to inline `lineHeight: 0` on the count span, keeping the optical `translateY` adjustment.

### Files changed: 1
| File | Change |
|---|---|
| `src/pages/TasbeehCounter.tsx` (line 128-131) | Dynamic font size class + `lineHeight: 0` style |

