

## Conditional Text Size: Arabic = Large, English = Small

### Approach
Create a utility function `hasArabic(text: string)` that checks if a string contains Arabic Unicode characters. Use it to conditionally apply `text-base` (Arabic) or `text-sm` (English) on description text.

### Files

**New: `src/lib/textUtils.ts`**
- Export `hasArabic(text: string): boolean` — tests against regex `/[\u0600-\u06FF\u0750-\u077F\u0870-\u089F\uFB50-\uFDFF\uFE70-\uFEFF]/`

**Edit: `src/components/goals/TodaysGoals.tsx`**
- Lines 236, 316: Change `text-base` to `${hasArabic(goal.description) ? 'text-base' : 'text-sm'}`

**Edit: `src/components/goals/GoalCard.tsx`**
- Line 142: Change `text-sm` to `${hasArabic(goal.description) ? 'text-base' : 'text-sm'}`

**Edit: `src/components/goals/GoalDetailSheet.tsx`**
- Description text: Apply same conditional sizing (`text-2xl` for Arabic, `text-base` for English) if applicable

