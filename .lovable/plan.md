

# Analysis: Al-Kanz Font for Arabic / Lisan ud Dawat Text

## Current Arabic Text Locations

| File | Text | Context |
|------|------|---------|
| `src/pages/Auth.tsx` | السَّلَامُ عَلَيْكُمْ | Login greeting |
| `src/components/auth/AuthLayout.tsx` | عبادة ني پابندي ما ساتهي | Splash tagline |
| `src/pages/Onboarding.tsx` | اُمّید | Step heading |
| `src/lib/hijri.ts` | محرم, صفر, etc. | Hijri month names (available but not currently displayed) |
| User-generated | Duas, prayers in goals | Typed or pasted by users |

## Feasibility: High

The TTF format is universally supported. The cleanest integration approach uses CSS `unicode-range` on the `@font-face` declaration, targeting the Arabic Unicode block (`U+0600-06FF, U+0750-077F, U+FB50-FDFF, U+FE70-FEFF`). This means:

- **No code changes needed per-component** — the browser automatically applies Al-Kanz to any Arabic characters wherever they appear, regardless of which `font-family` the element uses (sans, display, etc.).
- Works for hardcoded Arabic strings **and** user-pasted Arabic content in goal titles/descriptions.
- Latin text remains unaffected (Inter / Bricolage Grotesque).

## Stability Considerations

| Concern | Risk | Mitigation |
|---------|------|------------|
| Missing glyphs (diacritics like tashkeel: َ ُ ِ ّ) | Medium | The السَّلَامُ text uses heavy tashkeel — needs testing. If Al-Kanz lacks these, diacritics fall back to system Arabic fonts. |
| Lisan ud Dawat specific characters (e.g., پ, ٹ, ڈ) | Medium | These are in the extended Arabic block. Al-Kanz must support U+067x range for Urdu/Gujarati-script characters. |
| Mixed LTR/RTL in a single line | Low | CSS handles this natively via Unicode Bidi algorithm — font choice doesn't affect it. |
| File size / performance | Low | A single TTF is typically 50-200KB, loaded once and cached. |
| Font rendering on iOS PWA | Low | TTF/WOFF works reliably in Safari WebKit. |

## Recommended Implementation

### 1. Copy font to `src/assets/fonts/Al-Kanz.ttf`

### 2. Add `@font-face` with `unicode-range` in `src/index.css`

```css
@font-face {
  font-family: 'Al-Kanz';
  src: url('@/assets/fonts/Al-Kanz.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0600-06FF, U+0750-077F, U+0870-089F,
                 U+FB50-FDFF, U+FE70-FEFF;
}
```

### 3. Prepend Al-Kanz to all font stacks in `tailwind.config.ts`

```ts
fontFamily: {
  sans: ['"Al-Kanz"', 'Inter', 'system-ui', 'sans-serif'],
  display: ['"Al-Kanz"', '"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
},
```

Because of `unicode-range`, the browser will **only** use Al-Kanz for Arabic-range characters and fall through to Inter/Bricolage for Latin text. Zero per-component changes required.

### Files Changed

| File | Change |
|------|--------|
| `src/assets/fonts/Al-Kanz.ttf` | New file (copy from upload) |
| `src/index.css` | Add `@font-face` declaration |
| `tailwind.config.ts` | Prepend `Al-Kanz` to font stacks |

### Key Risk to Test

The main unknown is whether **Al-Kanz includes tashkeel/diacritics** (the marks on السَّلَامُ عَلَيْكُمْ) and **Lisan ud Dawat extended characters** (پ, ٹ, ڈ, ے). If any glyphs are missing, the browser gracefully falls back to the next font in the stack — so there is no breakage, just inconsistent styling for those specific characters.

