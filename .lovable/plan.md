
# Theme Overhaul: Cogo-Inspired Teal & Sage Palette

## Color Analysis from Inspiration

From the uploaded image, I've identified a sophisticated, calming color palette:

| Role | Color | HSL Value | Usage |
|------|-------|-----------|-------|
| **Deep Teal** | Dark petrol blue | `185 45% 25%` | Primary, backgrounds, text |
| **Sage Green** | Soft mint/sage | `100 35% 88%` | Cards, secondary surfaces |
| **Dark Teal Text** | Navy-teal | `185 50% 20%` | Headings on light backgrounds |
| **Off-White** | Cream/white | `30 20% 97%` | Light background, contrast |

## Design Philosophy

This palette conveys:
- **Calm & Spiritual**: The teal and sage evoke tranquility, appropriate for a prayer app
- **Natural**: Earthy greens connect to nature and growth
- **Premium**: Sophisticated color pairing feels modern yet timeless
- **High Contrast**: Dark teal on sage maintains excellent readability

## Implementation Plan

### File: `src/index.css`

Update the CSS custom properties with the new color scheme:

**Light Mode:**
```css
:root {
  --background: 100 35% 88%;        /* Sage green - main background */
  --foreground: 185 50% 20%;        /* Dark teal - text */
  
  --card: 100 30% 94%;              /* Lighter sage - cards */
  --card-foreground: 185 50% 20%;   /* Dark teal */
  
  --primary: 185 45% 25%;           /* Deep teal - buttons, accents */
  --primary-foreground: 100 35% 95%;/* Light sage for contrast */
  
  --secondary: 100 25% 92%;         /* Subtle sage variation */
  --secondary-foreground: 185 45% 25%;
  
  --muted: 100 20% 90%;             /* Muted sage */
  --muted-foreground: 185 30% 40%;  /* Medium teal */
  
  --accent: 185 40% 30%;            /* Teal accent */
  --accent-foreground: 100 35% 95%;
  
  --border: 185 20% 75%;            /* Soft teal-tinted border */
  --input: 185 20% 80%;
  --ring: 185 45% 25%;              /* Deep teal focus ring */
}
```

**Dark Mode:**
```css
.dark {
  --background: 185 45% 12%;        /* Very dark teal */
  --foreground: 100 30% 92%;        /* Light sage text */
  
  --card: 185 40% 16%;              /* Slightly lighter dark teal */
  --card-foreground: 100 30% 92%;
  
  --primary: 100 35% 75%;           /* Sage accent in dark mode */
  --primary-foreground: 185 45% 15%;
  
  --secondary: 185 35% 20%;
  --secondary-foreground: 100 30% 88%;
  
  --muted: 185 30% 18%;
  --muted-foreground: 100 20% 65%;
  
  --accent: 100 30% 70%;
  --accent-foreground: 185 45% 12%;
  
  --border: 185 30% 22%;
  --input: 185 30% 22%;
  --ring: 100 35% 75%;
}
```

**Sidebar (matching theme):**
```css
--sidebar-background: 185 45% 25%;     /* Deep teal sidebar */
--sidebar-foreground: 100 30% 92%;     /* Sage text */
--sidebar-primary: 100 35% 88%;
--sidebar-primary-foreground: 185 45% 20%;
--sidebar-accent: 185 40% 30%;
--sidebar-accent-foreground: 100 35% 95%;
--sidebar-border: 185 35% 30%;
--sidebar-ring: 100 35% 75%;
```

## Visual Impact

| Element | Before (B&W) | After (Teal & Sage) |
|---------|--------------|---------------------|
| Background | Pure white | Soft sage green |
| Text | Black | Deep teal |
| Cards | White with gray border | Lighter sage with teal-tinted border |
| Buttons | Black | Deep teal |
| Sidebar | Light gray | Rich deep teal |

## Files to Modify

1. **`src/index.css`** - Update all CSS custom properties in `:root` and `.dark` with the new palette

## Contextual Considerations

- **Prayer App Context**: Teal and sage evoke calmness, suitable for spiritual reflection
- **Readability**: Dark teal on sage maintains WCAG AA contrast ratios
- **Existing Components**: All Shadcn UI components will automatically inherit the new theme via CSS variables
- **Progress Bar**: The DailyMeter will use the primary teal color, standing out against sage backgrounds
