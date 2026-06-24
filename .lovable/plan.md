## Problem

iOS Safari (including installed PWAs) auto-zooms the viewport whenever a user taps a form field whose font-size is below 16px. Pinch-to-zoom-out is then required. Our current viewport meta tag is correct and accessibility-friendly (it allows user zoom), so the real fix is making sure every form control renders at ≥16px on mobile.

Audit findings:
- `Input` — renders at `text-base` (16px) on mobile, shrinks to `text-sm` only on `md+`. Safe.
- `Textarea` — renders at `text-sm` (14px) on all sizes. **Triggers zoom.**
- Native `<select>`, search inputs, and any ad-hoc inputs styled with `text-sm` / `text-xs` will also trigger zoom.

## Fix

Add a single mobile-only safeguard in `src/index.css` that forces all form controls to 16px below the `md` breakpoint, regardless of Tailwind classes applied. Keeps desktop typography untouched.

```css
@media (max-width: 767px) {
  input,
  textarea,
  select {
    font-size: 16px;
  }
}
```

Also bump the `Textarea` component's base class from `text-sm` to `text-base md:text-sm` so its intent matches `Input` and the styling stays consistent if the global rule is ever scoped tighter later.

## Why not change the viewport tag

Adding `maximum-scale=1` or `user-scalable=no` would also stop the zoom, but it disables pinch-zoom everywhere — an accessibility regression. The CSS approach removes the trigger without taking zoom away from users who need it.

## Files to change

- `src/index.css` — add the mobile form-control font-size rule.
- `src/components/ui/textarea.tsx` — change `text-sm` to `text-base md:text-sm`.

## Verification

- Open the installed PWA on iOS, tap a textarea (e.g. goal notes), confirm no zoom.
- Tap inputs across Today, Goals, Profile, and Auth pages — no zoom.
- Desktop layout unchanged (still `text-sm` from `md` upward).
