## Goal

Transform the Today page from a card-based namaz block into a seamless, immersive surface where the time-of-day gradient flows from behind the status bar and header down through the prayer section, then fades softly into the page background before the goals list begins.

## Visual Concept

```text
┌─────────────────────────┐
│ status bar (gradient)   │ ← safe-area tinted with prayer gradient
│ header (transparent)    │
│                         │
│   date · location       │  prayer gradient
│   progress bar          │  (e.g. pastel blue for Fajr)
│   Current Namaz · Fajr  │
│                         │
│  ╲ soft fade to bg ╱    │ ← seamless transition
│                         │
│   Today's Goals         │  normal background
│   • goal 1              │
│   • goal 2              │
└─────────────────────────┘
```

No card border, no rounded box, no shadow — the prayer info sits directly on the painted background.

## Scope of Changes

### 1. New: page-level gradient backdrop
Render the active prayer gradient as a fixed/absolute layer at the top of the Today page that:
- starts at the very top of the viewport (covers safe-area / status bar region)
- extends down past the prayer info
- fades to `hsl(var(--background))` via a mask/gradient overlay so the goals list sits on the normal page surface with no visible seam

### 2. `src/pages/Dashboard.tsx`
- Replace the `<TimeOfDayCard>` wrapper with an inline, borderless layout: same children (DateDisplay, progress bar, current/next namaz row) rendered directly on the gradient backdrop, no card padding box.
- Add the backdrop layer (a div using the chosen `gradient-*` class + a bottom-fade mask).
- Keep tap-to-navigate-to-calendar behavior on the prayer section only.

### 3. `src/components/layout/AppLayout.tsx` (mobile only)
- On the Dashboard route, make the mobile header transparent (remove `bg-background/40 backdrop-blur` border) so the gradient shows through behind it.
- Keep the header sticky and keep `pt-safe-min` so the status-bar area is also tinted by the gradient sitting beneath it.
- Other routes keep current header styling.

### 4. `src/components/namaz/TimeOfDayCard.tsx`
- Either retire usage on Dashboard (keep the file for other consumers if any) or add a `variant="seamless"` that drops padding/rounding/overflow. Quick audit will confirm; component will stay backward compatible.

### 5. Existing gradient tokens — reused as-is
The six `gradient-fajr` / `gradient-zuhr` / `gradient-asr` / `gradient-maghrib` / `gradient-isha` / `gradient-nisful-layl` classes in `src/index.css` (lines 218-270, including `.theme-bhukur` overrides) are the gradient source — no color changes.

## Technical Notes

- Fade-out uses a CSS mask: `mask-image: linear-gradient(to bottom, black 60%, transparent 100%)` on the backdrop layer, so the gradient dissolves into the page background instead of ending in a hard line.
- Backdrop is `position: absolute` inside a Dashboard-level relative wrapper, `top: 0`, full width, height tuned so the fade completes just above the goals list (≈ 420px on mobile).
- Header transparency is scoped to the Dashboard route via a prop (`transparentHeader`) or `useLocation` check inside `AppLayout`.
- Text inside the gradient region keeps using `text-foreground` / `text-foreground/70` tokens — gradients already provide adequate contrast in both Oudh and Bhukur themes.
- Desktop layout: gradient backdrop also applies inside the main content area on the Dashboard route, behind the same prayer block; sidebar/header chrome unchanged.

## Out of Scope

- No changes to gradient colors themselves.
- No changes to prayer/goal data or logic.
- No changes to goals list visual styling.
- No changes to other pages.
