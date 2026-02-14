

## Auth Page Updates

### Left Panel (AuthLayout.tsx)

1. **Title**: Change "Your Spiritual Life, Organized" to "Your Companion for Consistent Ibadat"

2. **Subtitle area**: Replace the current subtitle with the Lisan ud-Dawat text followed by a styled label:
   - Line 1: عبادت نی پابندی ماں آپنو ساتھی
   - Line 2: Small all-caps label with wide letter-spacing: "DESIGNED FOR DAWOODI BOHRAS"

3. **Logo color**: Remove `brightness-0 invert` filters so the logo renders in its native brand green (the SVG is already green by default)

### Right Panel (Auth.tsx)

4. **Heading**: Change "Welcome Back" to "السَّلَامُ عَلَيْكُمْ"

5. **Subtitle**: Change "Enter your credentials to access your account" to "Track prayers, manage dues, and cultivate daily habits"

### Mobile

6. **Logo size**: Increase the mobile logo from `w-20` to `w-28` for better visibility

### Files Modified
- `src/components/auth/AuthLayout.tsx` -- left panel text, logo styling, mobile logo size
- `src/pages/Auth.tsx` -- right panel heading and subtitle text
