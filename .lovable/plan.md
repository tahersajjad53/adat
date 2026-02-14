

# Add Google Sign-In to Login and Signup Pages

## Overview
Add a "Continue with Google" button on both auth pages, with an "OR" divider separating it from the email/password form. Google provider is already enabled in Supabase.

## Changes

### 1. `src/contexts/AuthContext.tsx`
- Add `signInWithGoogle` method to the context type and provider
- Uses `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })`

### 2. `src/pages/Auth.tsx`
Restructure layout to:
- Title + subtitle (unchanged)
- "Continue with Google" button (outline variant, Google "G" SVG icon)
- "OR" horizontal divider (line — text — line)
- Existing email/password form
- "Don't have an account?" link

### 3. `src/pages/Signup.tsx`
Same pattern:
- Title + subtitle
- "Continue with Google" button
- "OR" divider
- Existing signup form fields
- "Already have an account?" link

### Technical Details

**Google button styling**: Outline variant button, full width, with an inline Google "G" SVG (colored logo). Text: "Continue with Google".

**OR divider**: A flex row with two horizontal lines and centered "OR" text in muted-foreground, like:
```tsx
<div className="flex items-center gap-3">
  <Separator className="flex-1" />
  <span className="text-xs text-muted-foreground uppercase">or</span>
  <Separator className="flex-1" />
</div>
```

## Files
- **Edit**: `src/contexts/AuthContext.tsx`
- **Edit**: `src/pages/Auth.tsx`
- **Edit**: `src/pages/Signup.tsx`

