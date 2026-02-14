

# Update Empty State on Goals Page

## What Changes
Update only the **Goals page** empty state to display the quote *"He who is mindful of the journey's distance prepares for it."* with a CTA button to create a goal. The Today page remains unchanged.

## File to Edit

### `src/pages/Goals.tsx` (lines 152-159)
Replace the current empty state (Archery icon + "No goals yet" + description text) with:
- The quote in italic: *"He who is mindful of the journey's distance prepares for it."*
- A "Create your first goal" button that calls `handleAdd()` to open the goal form sheet directly

No other files are changed. The Today page's Al-Hadith quote stays as-is.

