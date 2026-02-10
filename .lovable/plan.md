

# Fajr Card: Brighter Dawn Gradient and Rising Sun Pattern

## Gradient Change

Update the `.gradient-fajr` class in `src/index.css` from the current muted steel-blue tones to a brighter dawn-inspired blue that evokes early morning light while maintaining white text contrast:

**Current:**
```css
.gradient-fajr {
  background: linear-gradient(135deg, 
    hsl(215 25% 35%) 0%, 
    hsl(220 30% 45%) 100%);
}
```

**New:**
```css
.gradient-fajr {
  background: linear-gradient(135deg, 
    hsl(210 50% 42%) 0%, 
    hsl(200 55% 52%) 100%);
}
```

Higher saturation and slightly lighter values create a vibrant dawn-sky feel while keeping sufficient contrast for white text (WCAG AA).

## Rising Sun SVG Pattern

Replace the star/polygon shape in the `fajr` case of `GeometricShape` in `src/components/namaz/TimeOfDayCard.tsx` with a rising sun motif: a half-circle at the bottom with radiating lines fanning upward, evoking sunrise over the horizon.

```text
      \  |  /
       \ | /
    ----[   ]----
    ============= (horizon line)
```

The SVG will use the same `opacity-15` and `text-white` styling as the existing shapes.

## Files Changed

- `src/index.css` -- update `.gradient-fajr` to brighter dawn blue
- `src/components/namaz/TimeOfDayCard.tsx` -- replace fajr star polygon with rising sun pattern

