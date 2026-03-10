

## Update "What's New" Popup to v3

The current popup (v2) lists older features. We need to bump it to v3 with the latest features added, so returning users see the new announcements.

### Changes: `src/components/WhatsNewPopup.tsx`

1. **Bump key** from `whats-new-v2` to `whats-new-v3`
2. **Replace UPDATES array** with the latest features:

```typescript
const UPDATES = [
  { emoji: '📿', text: 'Tasbeeh counters with beautiful radial progress rings' },
  { emoji: '🎨', text: 'Softer pastel prayer gradients across the app' },
  { emoji: '📅', text: 'Swipe between weeks on the Calendar page' },
  { emoji: '🏷️', text: 'Goals are now grouped by tags on your Today page' },
  { emoji: '🔀', text: 'Reorder your tag groups from Profile settings' },
  { emoji: '🔍', text: 'Filter goals by tag on the Goals page' },
];
```

The newest feature (Tasbeeh counters) goes first. Existing items stay since they were part of recent updates. The key bump ensures all users (including those who dismissed v2) see the popup again.

