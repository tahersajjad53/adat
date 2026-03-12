
Goal: stabilize the “Create Goal” mobile sheet keyboard behavior so it no longer jumps or leaves a large empty gap.

What I found
- `useKeyboardOffset` currently uses `window.innerHeight - visualViewport.height` and applies that directly as bottom padding.
- On mobile web/iOS, the sheet is already using `85dvh` (dynamic viewport), so the keyboard is partly accounted for by layout already; adding full keyboard height can double-shift the footer.
- `transition-[padding]` on the sheet amplifies jitter during rapid `visualViewport` updates.

Implementation plan
1. Make keyboard offset overlap-based (not raw keyboard-height based)
- Update `src/hooks/use-keyboard-offset.ts` to support:
  - `enabled` flag (only active when sheet is open)
  - optional `containerRef` (sheet content element)
- Compute offset from actual overlap:
  - `overlap = containerRect.bottom - visualViewport.height`
  - apply only when overlap passes a threshold (avoid tiny fluctuations)
- Keep updates in `requestAnimationFrame` and reset to `0` when disabled/closed.

2. Apply this in Goal form sheet
- Update `src/components/goals/GoalFormSheet.tsx`:
  - add `ref` to `SheetContent`
  - call hook with `{ enabled: isMobile && open, containerRef }`
  - keep current footer/content structure
  - remove `transition-[padding]` from mobile `SheetContent` to stop animated wobble.

3. Align other sheet forms (same hook, same fix)
- Update:
  - `src/components/tasbeeh/TasbeehFormSheet.tsx`
  - `src/components/dues/SabeelFormSheet.tsx`
- Use the same enabled + ref pattern so all bottom sheets behave consistently.

4. Verify behavior at mobile viewport
- Validate with keyboard open/close on title + description fields:
  - footer stays just above keyboard (no oversized gap)
  - no jumpy oscillation while typing
  - sheet returns to normal spacing when keyboard closes
  - no regression on desktop dialog mode.

Technical details
- Files to change:
  - `src/hooks/use-keyboard-offset.ts`
  - `src/components/goals/GoalFormSheet.tsx`
  - `src/components/tasbeeh/TasbeehFormSheet.tsx`
  - `src/components/dues/SabeelFormSheet.tsx`
- Core behavior change:
  - from “estimated keyboard height” -> “actual visual overlap compensation”.
- Risk level: low-medium (localized to sheet keyboard handling; desktop unaffected).
