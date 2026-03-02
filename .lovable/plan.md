

## Remove decorative SVG illustrations from TimeOfDayCard

**File: `src/components/namaz/TimeOfDayCard.tsx`**

Remove the `GeometricShape` component entirely (lines 25-117) and remove its usage in the render (the `<GeometricShape variant={currentPrayer} />` line). Keep the gradient class logic and the rest of the card intact.

This affects both the Dashboard and Namaz page headers since they both use `TimeOfDayCard`.

