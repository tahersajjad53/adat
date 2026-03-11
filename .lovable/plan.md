

## Add Confetti Celebration When Tasbeeh Target Is Hit

When the user's tap reaches the target count, fire a dramatic multi-burst confetti stream from the center of the counter circle — much more celebratory than the single-burst used for goal checkboxes.

### 1. Add `triggerCelebration` to `useConfetti` hook
**File: `src/components/ui/confetti.tsx`**

Add a new function `triggerCelebration` that fires 5 staggered bursts (at 0ms, 150ms, 300ms, 450ms, 600ms) from the same origin point, creating a sustained stream effect. Each burst uses the existing `ConfettiBurst` component.

### 2. Wire it into `TasbeehCounter.tsx`
**File: `src/pages/TasbeehCounter.tsx`**

- Import and initialize `useConfetti` (both `triggerCelebration` and `ConfettiPortal`)
- Add a `useRef` for the tap button element
- In `handleTap`, after incrementing, check if `counter.current_count + 1 === counter.target_count` (using the pre-increment optimistic value). If so, call `triggerCelebration(buttonRef.current)` and add a longer haptic vibrate pattern
- Render `<ConfettiPortal />` at the bottom of the component

