

# Make All Input Fields Fully Rounded

## Overview
Update form input elements to use `rounded-full` (pill shape) to match the button styling across the entire app.

## Changes

### 1. Input component (`src/components/ui/input.tsx`)
- Change `rounded-md` to `rounded-full` in the className string.

### 2. Textarea component (`src/components/ui/textarea.tsx`)
- Change `rounded-md` to `rounded-2xl` (since `rounded-full` on a multi-line textarea looks odd, a generous rounding keeps the aesthetic consistent without distortion).

### 3. Command input (`src/components/ui/command.tsx`)
- The `CommandInput` wraps a standard input inside the combobox/command component (used by LocationSelector etc.). This inherits its own styling and will not need changes since it sits inside a popover container.

## Scope
- Only the base UI primitives (`Input`, `Textarea`) are updated, so every page that uses them (Auth, Profile, Goals, Onboarding, etc.) automatically gets the rounded style.
- Sidebar items, menus, and other non-input elements keep their current rounding.

