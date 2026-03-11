

## Fix Tasbeeh Text Sizing and Centering

Three targeted changes:

### 1. TasbeehCard (Today page) — larger, centered count
**File: `src/components/tasbeeh/TasbeehCard.tsx`** line 88

Change `text-lg` to `text-xl` for the count number. The centering container (`flex items-center justify-center`) is already correct, so this just needs a size bump.

### 2. TasbeehCounter detail page — center the title with nav arrows
**File: `src/pages/TasbeehCounter.tsx`** line 66

Add `text-center flex-1` to the h1 so it fills the space between the back button and the menu button, centering the title text properly.

### 3. TasbeehCounter detail page — much larger, centered count
**File: `src/pages/TasbeehCounter.tsx`** line 111

Increase the count from `text-6xl` to `text-8xl` (or `text-[96px]`). The button already uses `flex items-center justify-center` with the SVG absolutely positioned, so the span is already centered — just needs the size increase.

