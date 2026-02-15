
# Improve Dynamic Goals Toggle with Title and Subtitle

## What Changes
Update the Dynamic Goals toggle dropdown in both the Goals page (desktop) and mobile header to include a title, concise subtitle, and a better layout with more breathing room.

**Content:**
- Title: "Receive Dynamic Goals"
- Subtitle: "Community goals for all Mumineen, like 'Pray Moti Us Sawalat' on days requiring rozu."
- Toggle below the text

## Files to Edit

### 1. `src/pages/Goals.tsx` (lines 134-142, desktop dropdown)
Replace the current single-row layout with a vertical stack:
- `DropdownMenuContent`: increase `min-w` to `280px`, change `p-3` to `p-4`
- Replace the horizontal flex div with a vertical layout:
  - Title as `text-sm font-medium`
  - Subtitle as `text-xs text-muted-foreground mt-1`
  - Toggle row with label below, using `flex items-center justify-between mt-3`

### 2. `src/components/layout/AppLayout.tsx` (lines 66-73, mobile dropdown)
Apply the same vertical layout changes as above to keep mobile and desktop consistent.
