

## Fix: Restore Auth.tsx right panel text

The heading and subtitle changes from the approved plan were lost — the file still has the old "Welcome Back" and "Enter your credentials..." text. This is a simple re-application of two text changes:

1. **Heading** (line 63): Change "Welcome Back" to "السَّلَامُ عَلَيْكُمْ"
2. **Subtitle** (lines 64-66): Change "Enter your credentials to access your account" to "Track prayers, manage dues, and cultivate daily habits"

### File Modified
- `src/pages/Auth.tsx` -- lines 63-66 only

