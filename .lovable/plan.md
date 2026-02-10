

# Enhanced Toast for Due Payments

## Overview

Replace the plain text toast ("Payment recorded") with a visually rich, branded celebration toast -- inspired by the GPT-4o announcement modal reference. The toast will feature a decorative CSS gradient/pattern banner at the top (warm beige and lime-green tones matching the app's branding), followed by friendly, enthusiastic copy.

## PatternCraft Feasibility

PatternCraft (patterncraft.fun) is a collection of copy-paste CSS/Tailwind gradient and pattern snippets -- not an installable npm package. Its patterns are pure CSS (gradients, repeating-linear-gradients, SVG data URIs) that can be directly embedded in our styles. This makes it fully feasible and lightweight to adopt for:

1. **Toast banner visuals** -- warm abstract gradient with subtle pattern overlay
2. **Progress card backgrounds** -- time-of-day themed patterns (already partially done with prayer gradients)

Since it's just CSS, there's zero dependency overhead.

## Design

### Toast Visual Structure

```text
+----------------------------------+
|  [x]                             |
|  /////////////////////////////// |
|  //  Gradient + Pattern Banner // |
|  //  (warm lime/beige tones)  // |
|  /////////////////////////////// |
|                                  |
|  Jazakallah! Payment Recorded    |
|  [Title] marked as paid for      |
|  [month]. Keep up the great work!|
|                                  |
+----------------------------------+
```

- Top section: A decorative CSS gradient banner (lime-to-warm-beige with a subtle diagonal stripe or dot pattern overlay)
- Title: Warm, enthusiastic ("Jazakallah!" or "Well done!")
- Description: Specific and friendly, mentioning the due name

### Implementation Approach

Rather than using the plain radix toast, create a **custom Sonner toast** with a rich React component as its content. Sonner (already installed) supports custom JSX toasts which gives full layout control -- this avoids fighting the radix toast's simple text-only layout.

## Changes

### 1. Create `src/components/ui/celebration-toast.tsx`

A new React component that renders the rich toast content:
- A decorative gradient banner div at the top (~80px tall) with CSS pattern overlay using warm lime/beige colours
- Title in display font: enthusiastic message like "Jazakallah!" 
- Description with the specific due name and month
- Rounded corners matching the app's `--radius: 1rem` design
- Export a `showCelebrationToast(title: string, dueName: string)` helper that calls Sonner's `toast.custom()` with this component

### 2. Update `src/hooks/useDuePayments.ts`

- Replace the plain `toast({ title: 'Payment recorded', ... })` call (line 125-128) with `showCelebrationToast(reminder title, month)`
- The hook needs to accept the reminder title so it can display it -- OR we move the toast call to the `DueRemindersCard` component which already has the reminder context

Better approach: Move the success toast from `useDuePayments` to `DueRemindersCard.handleToggle` (which already knows the reminder title). Remove the generic toast from the hook.

### 3. Update `src/components/dues/DueRemindersCard.tsx`

- After `await markAsPaid(reminder)` succeeds, call `showCelebrationToast()` with the reminder's title and amount
- This keeps the toast contextual and friendly (e.g., "Sabeel marked as paid")

### 4. Add CSS pattern utility to `src/index.css`

Add a reusable `.pattern-celebration` class with a warm lime/beige gradient and subtle pattern overlay:
```css
.pattern-celebration {
  background: 
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      hsl(68 75% 55% / 0.1) 10px,
      hsl(68 75% 55% / 0.1) 20px
    ),
    linear-gradient(
      135deg,
      hsl(40 30% 94%) 0%,
      hsl(68 75% 55% / 0.3) 50%,
      hsl(160 45% 22% / 0.2) 100%
    );
}
```

This pattern class can later be reused for progress cards and other branded visuals.

## Toast Copy Examples

- **Title**: "Jazakallah!" or "Well done!"
- **Description**: "[Due Name] marked as paid. Keep it up!"
- **Amount context**: Shows the amount paid

## Files Changed

- `src/components/ui/celebration-toast.tsx` -- new component for rich toast layout + helper function
- `src/index.css` -- add `.pattern-celebration` CSS utility class
- `src/hooks/useDuePayments.ts` -- remove generic success toast (line 125-128)
- `src/components/dues/DueRemindersCard.tsx` -- call `showCelebrationToast()` after successful payment

