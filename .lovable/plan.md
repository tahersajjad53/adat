

# Add "Create Your Own Goal" Option to Onboarding

## What Changes

### 1. Onboarding Step 2 (`src/pages/Onboarding.tsx`)
- Add a "Create your own" chip/button as the last option in the aspirations list, styled distinctly (e.g., dashed border or ghost style) to differentiate it from preset templates.
- When tapped, it saves any already-selected aspirations as goals (same as current "Continue" flow), then navigates to `/goals?new=1` instead of showing the loading screen.

### 2. Goals Page (`src/pages/Goals.tsx`)
- On mount, check for `?new=1` query parameter.
- If present, auto-open the GoalFormSheet and clear the query param from the URL (so refreshing doesn't re-trigger it).

## Technical Details

### `src/pages/Onboarding.tsx`
- Add a new button after the aspiration chips styled with a dashed border and a Plus icon: "Create your own".
- On click:
  1. If any preset aspirations are selected, insert those goals (reuse the existing goal-creation logic from step 3).
  2. Navigate to `/goals?new=1`.

### `src/pages/Goals.tsx`
- Add a `useEffect` that reads `searchParams` via `useSearchParams()` from react-router-dom.
- If `new` param is `"1"`, call `setFormOpen(true)` and remove the param.
- Import `useSearchParams` from `react-router-dom`.

## Flow
1. User reaches Step 2 (Aspirations)
2. They can select presets AND/OR tap "Create your own"
3. Tapping "Create your own" saves any selected presets, then lands on the Goals page with the form sheet already open
4. User creates their custom goal and continues naturally

