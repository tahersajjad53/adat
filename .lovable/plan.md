

## Fix Tasbeeh Counter Text Overflow

### Changes in `src/pages/TasbeehCounter.tsx`

1. **Dynamic font size** — When count reaches 4+ digits, reduce from `text-8xl` to a smaller size. Use a simple conditional:
   - 1-3 digits: `text-8xl` (current)
   - 4 digits: `text-7xl`
   - 5+ digits: `text-6xl`

2. **Zero line-height** — Change the count `<span>` from `leading-none` (which is `line-height: 1`) to `leading-[0]` (which is `line-height: 0`), and remove the `translateY(0.05em)` hack since zero line-height eliminates baseline offset issues.

### Specific edit (lines ~107-109)

```tsx
// Before
<span className="text-8xl font-bold text-foreground tabular-nums leading-none" style={{ transform: 'translateY(0.05em)' }}>
  {counter.current_count}
</span>

// After
<span className={`font-bold text-foreground tabular-nums leading-[0] ${
  counter.current_count >= 10000 ? 'text-6xl' : counter.current_count >= 1000 ? 'text-7xl' : 'text-8xl'
}`}>
  {counter.current_count}
</span>
```

Two lines changed, no new files.

