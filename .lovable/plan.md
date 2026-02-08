

# Increase Mobile Content Width

## Problem

The Tailwind `container` class uses `padding: 2rem` (32px) on all sides at every breakpoint. On mobile screens (typically 375-414px wide), this eats 64px of horizontal space, leaving only ~310-350px for content.

## Fix

Update `tailwind.config.ts` to use responsive container padding: `1rem` (16px) on mobile, scaling up to `2rem` on larger screens. This is a single-line change that affects all pages globally.

## Technical Detail

In `tailwind.config.ts`, change:

```
container: {
  center: true,
  padding: "2rem",
}
```

to:

```
container: {
  center: true,
  padding: {
    DEFAULT: "1rem",
    sm: "1.5rem",
    lg: "2rem",
  },
}
```

This gives mobile 16px padding per side (gaining 32px of content width), tablets 24px, and desktop 32px as before.

## Impact

Every page using the `container` class (Dashboard, Namaz, Goals, Profile, and the mobile header) will automatically benefit -- no per-page changes needed.
