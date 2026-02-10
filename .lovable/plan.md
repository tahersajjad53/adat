
# Standardize H1/H2 Typography Globally

## The Standard (from Goals page)

The updated styling pattern from the Goals page:
- **H1**: `text-4xl font-normal font-display tracking-tight` (with `md:text-4xl` for responsive)
- **H1 subtitle**: `text-base text-muted-foreground mt-1 font-normal`
- **H2 (section headers)**: `font-display tracking-tight font-normal text-xl`

The key change: headings use `font-normal` instead of `font-bold`/`font-semibold`, creating a lighter, more elegant feel with the Bricolage Grotesque display font.

## Pages to Update

### 1. Profile page (`src/pages/Profile.tsx`)
- **Line 159** (Account Information H1): Change `font-bold` to `font-normal`
- **Line 186** (Location H2): Change from `text-lg font-semibold` to `font-display tracking-tight font-normal text-xl`
- **Line 258** (Profile menu H1): Change `font-bold` to `font-normal`

### 2. Dues Section (`src/components/dues/DuesSection.tsx`)
- **Line 198** (loading skeleton H2): Change `font-bold` to `font-normal`, update size from `text-2xl md:text-3xl` to `text-xl`
- **Line 211** (Sabeel H2): Same change -- `font-bold` to `font-normal`, size to `text-xl`

### 3. Global base styles (`src/index.css`)
Add default heading styles in the `@layer base` block so any new pages automatically follow the convention:
```css
h1 {
  @apply text-4xl font-normal font-display tracking-tight;
}
h2 {
  @apply text-xl font-normal font-display tracking-tight;
}
```

## Files Changed
- `src/index.css` -- add global h1/h2 base styles
- `src/pages/Profile.tsx` -- update 3 heading instances to use `font-normal`
- `src/components/dues/DuesSection.tsx` -- update 2 heading instances to use `font-normal` and consistent sizing
