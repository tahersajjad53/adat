

# Dynamic Goals Education Pop-up After 3rd Goal

## What It Does
When a user creates their 3rd goal, a friendly dialog appears 2 seconds later educating them about the Dynamic Goals feature and where to find the toggle (the 3-dot menu).

## Trigger Logic
- After a successful goal creation, check if the total goal count is now exactly 3
- If so, set a 2-second timeout, then show a Dialog
- Use `localStorage` to track whether the pop-up has already been shown (key: `dynamic-goals-education-shown`), so it only appears once per user

## Pop-up Content
- Friendly, conversational tone
- Title: "Did you know?" (or similar warm heading)
- Body: Explains that Dynamic Goals exist -- community goals that appear alongside personal ones, like "Pray Moti Us Sawalat" on important days. Mentions the 3-dot menu in the header as where to enable/disable them.
- A single "Got it" button to dismiss

## Technical Details

### File: `src/pages/Goals.tsx`
- Import `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` from `@/components/ui/dialog`
- Add state: `educationPopupOpen` (boolean)
- Add a `useEffect` that:
  - Checks `localStorage.getItem('dynamic-goals-education-shown')`
  - If not shown and `goals.length === 3` and not loading, sets a 2-second timeout to open the dialog
  - On open, sets `localStorage.setItem('dynamic-goals-education-shown', 'true')`
  - Cleans up timeout on unmount
- Add the `Dialog` component at the bottom of the JSX with:
  - Title: "Did you know?"
  - Description: Something like "You're building great habits! Ibadat also offers Dynamic Goals -- community goals for all Mumineen that appear alongside yours. You can enable them anytime from the menu (three dots) at the top of this page."
  - Footer: A single "Got it" Button that closes the dialog

No other files need changes.
