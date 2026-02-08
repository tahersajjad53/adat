

# Confetti Animation + Goal Descriptions in Today View

## 1. Confetti Animation on Completion

### Approach
Create a lightweight, dependency-free confetti component using CSS keyframe animations. No npm package needed -- just a small React component that renders ~20-30 small colored circles/squares that burst outward and fade, triggered from the checkbox position.

### Implementation
- **New file: `src/components/ui/confetti.tsx`** -- A `ConfettiBurst` component that:
  - Accepts a `trigger` boolean and an optional `originRef` (to burst from the checkbox)
  - Renders 20-30 absolutely-positioned particles with randomized directions, colors (using theme primary/accent tones), and durations
  - Auto-removes itself after ~800ms
  - Uses CSS `@keyframes` for the burst animation (translateX/Y + opacity + scale)

- **New hook: `src/hooks/useConfetti.ts`** -- A simple hook returning `{ triggerConfetti, ConfettiPortal }`:
  - `triggerConfetti(element)` captures the click position and sets state
  - `ConfettiPortal` renders the burst at that position via a portal

### Integration Points
- **`src/components/namaz/PrayerCard.tsx`**: Wrap `onToggle` -- only trigger confetti when checking ON (not unchecking)
- **`src/components/goals/TodaysGoals.tsx`**: Same pattern on goal checkbox toggle
- **`src/components/goals/GoalCard.tsx`**: Same pattern on the Goals page

### Behavior
- Confetti fires only when marking something complete (not when unchecking)
- Burst is small and brief (~600-800ms), not disruptive
- Particles use the app's primary color palette for visual coherence

---

## 2. Goal Description in Today View

### Change
In `src/components/goals/TodaysGoals.tsx`, render `goal.description` below the title when it exists.

### Styling
- Shown as a secondary line: `text-sm text-muted-foreground font-normal`
- Truncated to one line with `line-clamp-1` to keep the list compact
- When the goal is completed, the description also gets `line-through` styling

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/ui/confetti.tsx` | New -- CSS-based confetti burst component |
| `src/hooks/useConfetti.ts` | New -- hook to trigger confetti from any component |
| `src/components/namaz/PrayerCard.tsx` | Trigger confetti on prayer check-on |
| `src/components/goals/TodaysGoals.tsx` | Trigger confetti on goal check-on; render goal description |
| `src/components/goals/GoalCard.tsx` | Trigger confetti on goal check-on |
