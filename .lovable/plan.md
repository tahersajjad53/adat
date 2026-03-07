

## Remove Center Dot from OnTimeMeter

**`src/components/profile/OnTimeMeter.tsx`** — Remove the two `<circle>` elements that form the needle's center dot (the filled primary circle r=4 and the smaller primary-foreground circle r=2). These overlap with the percentage text in the center.

Lines to remove:
```tsx
<circle cx={cx} cy={cy} r={4} className="fill-primary" />
<circle cx={cx} cy={cy} r={2} className="fill-primary-foreground" />
```

