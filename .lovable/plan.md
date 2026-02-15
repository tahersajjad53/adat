

# Fix Date Input Fields Exceeding Container Width

## Problem
On mobile (iOS especially), native `<input type="date">` elements render browser-specific date picker controls that push the input wider than its parent container. The `overflow-hidden` class on the input itself clips inner content but doesn't prevent the element from growing beyond bounds.

## Solution
Add `overflow-hidden` to the wrapping `<div>` containers around date inputs so the parent clips the overflow, and also ensure the inputs themselves are constrained. This is a targeted fix in two files.

## Changes

### 1. GoalFormSheet (`src/components/goals/GoalFormSheet.tsx`)
- On the start date wrapper div (line 155), change `className="space-y-2"` to `className="space-y-2 overflow-hidden"`.
- On the end date wrapper div (line 180), change `className="space-y-2"` to `className="space-y-2 overflow-hidden"`.

### 2. RecurrenceSelector (`src/components/goals/RecurrenceSelector.tsx`)
- On the "Due date" input (line 324-329, for one-time goals), add `className="overflow-hidden"` to the Input element.
- On the wrapping div (line 322), change `className="space-y-2"` to `className="space-y-2 overflow-hidden"`.

These small changes ensure the parent containers clip any native browser date-picker overflow, keeping all fields aligned within the form margins.
