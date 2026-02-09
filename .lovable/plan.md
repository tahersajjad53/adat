

# Show Affirming Message at 100% Progress

## Change

In `src/pages/Dashboard.tsx`, update the fallback text on line 153 to show a positive message when the user has completed everything (100%), and keep the current message for when prayer data is genuinely unavailable.

### Logic
- If `overallPercentage === 100`: Show a short affirming message like **"Masha'Allah! All done for today."**
- Otherwise (no prayer data): Keep the existing "No prayer information available" message

### File: `src/pages/Dashboard.tsx` (line ~152-154)
Replace the else branch:
```tsx
) : overallPercentage === 100 ? (
  <p className="text-white/80 text-sm font-medium">Masha'Allah! All done for today.</p>
) : (
  <p className="text-white/70 text-sm">No prayer information available</p>
)}
```

This is a single-line change -- minimal and consistent with the existing light-variant text styling.

