# Document 8: Shared Hooks & Contexts Reference

> Mapping of web hooks to React Native equivalents. Most hooks port unchanged — only web-specific APIs need replacement.

---

## 8.1 Contexts to Port

### AuthContext

**Web location:** `src/contexts/AuthContext.tsx`

**Changes for RN:**
- Replace `window.location.origin` in `signUp` with your app's deep link URL scheme
- Replace `window.location.origin` in `signInWithGoogle` with deep link redirect
- For Google OAuth in RN, consider using `expo-auth-session` or `expo-web-browser`
- Everything else is identical

**Provides:**
```typescript
{
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email, password, fullName) => Promise<{ error }>;
  signIn: (email, password) => Promise<{ error }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}
```

### CalendarContext

**Web location:** `src/contexts/CalendarContext.tsx`

**Changes for RN:**
- Replace `navigator.geolocation` with `expo-location`:
  ```typescript
  import * as Location from 'expo-location';
  
  async function getCurrentLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') throw new Error('Location permission denied');
    const loc = await Location.getCurrentPositionAsync({});
    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
  ```
- `localStorage` caching in `prayerTimes.ts` → use `AsyncStorage`
- `Intl.DateTimeFormat` works in React Native (Hermes engine)
- Everything else is identical

**Provides:**
```typescript
{
  currentDate: DualDate | null;
  location: Location | null;
  maghribTime: string | null;
  isLoading: boolean;
  error: string | null;
  refreshDate: () => Promise<void>;
  setLocation: (location) => Promise<void>;
  requestLocationPermission: () => Promise<void>;
}
```

### ThemeContext

**Web location:** `src/contexts/ThemeContext.tsx`

**Changes for RN:**
- Remove `document.documentElement.classList` manipulation
- Remove `meta[name="theme-color"]` manipulation
- Instead, store active theme in context and provide color tokens
- Components read colors from `useTheme()` hook and apply via `StyleSheet`

**Provides:**
```typescript
{
  theme: 'oudh' | 'khalaf' | 'bhukur';
  setTheme: (theme) => void;
  colors: ThemeColors; // Add this: resolved color values for the active theme
}
```

---

## 8.2 Hooks to Port

### Zero-Change Hooks (copy as-is)

These hooks use only Supabase queries and pure TypeScript logic. No web APIs involved.

| Hook | File | Purpose |
|---|---|---|
| `useGoals` | `src/hooks/useGoals.ts` | CRUD on `goals` table. Uses `@tanstack/react-query` mutations. |
| `useGoalCompletions` | `src/hooks/useGoalCompletions.ts` | Toggle goal completion for today. Keys on pre-Maghrib Hijri date. |
| `useAdminGoalCompletions` | `src/hooks/useAdminGoalCompletions.ts` | Toggle dynamic goal completion. Same pattern as `useGoalCompletions`. |
| `useDynamicGoals` | `src/hooks/useDynamicGoals.ts` | Fetch published `admin_goals`, filter by due today. |
| `useUserPreferences` | `src/hooks/useUserPreferences.ts` | Dynamic goals toggle + sort order persistence. |
| `useTodayProgress` | `src/hooks/useTodayProgress.ts` | Pure computation: prayer count + goal count → percentage. |
| `useOverdueGoals` | `src/hooks/useOverdueGoals.ts` | 7-day lookback, batch-complete missed goals. |
| `useUserRole` | `src/hooks/useUserRole.ts` | Check if user has admin role. |

### Minimal-Change Hooks

| Hook | File | Change Required |
|---|---|---|
| `usePrayerLog` | `src/hooks/usePrayerLog.ts` | No web APIs used. Uses `useCalendar()` for dates and `Intl.DateTimeFormat` for timezone (both available in RN). **Copy as-is.** |
| `usePrayerTimes` | `src/hooks/usePrayerTimes.ts` | No web APIs. Calls `fetchPrayerTimes()` which uses `fetch()` (available in RN). **Copy as-is.** |
| `useMissedPrayers` | `src/hooks/useMissedPrayers.ts` | No web APIs. Pure Supabase queries + Hijri engine. **Copy as-is.** |

### Hooks Requiring Changes

| Hook | Change |
|---|---|
| `usePWAInstall` | **Delete** — not applicable to native apps |
| `use-mobile` | **Replace** — use `Dimensions.get('window').width` or `useWindowDimensions()` from React Native |

---

## 8.3 Library Files to Port

### `src/lib/prayerTimes.ts`

**Changes:**
- Replace `localStorage.getItem`/`setItem` with `AsyncStorage.getItem`/`setItem`
- Make cache functions `async` (AsyncStorage is async, localStorage is sync)
- Replace `navigator.geolocation` with `expo-location` (see CalendarContext changes)
- `fetch()` API works identically in React Native
- `Intl.DateTimeFormat` works in React Native

### `src/lib/hijri.ts`
**No changes.** Pure math + `Intl.DateTimeFormat` (available in Hermes).

### `src/lib/recurrence.ts`
**No changes.** Pure TypeScript, no web APIs.

### `src/lib/calendarUtils.ts`
**No changes.** Uses standard `Date` object only.

### `src/lib/utils.ts`
**Replace** — this contains `clsx` + `tailwind-merge` which are web-only. Not needed in RN.

---

## 8.4 Key Architecture Patterns

### React Query Setup
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Wrap your app
<QueryClientProvider client={queryClient}>
  <AuthProvider>
    <ThemeProvider>
      <CalendarProvider>
        <NavigationContainer>
          {/* ... */}
        </NavigationContainer>
      </CalendarProvider>
    </ThemeProvider>
  </AuthProvider>
</QueryClientProvider>
```

### Provider Nesting Order (must match web)
1. `QueryClientProvider` (outermost)
2. `AuthProvider`
3. `ThemeProvider`
4. `CalendarProvider`
5. Navigation (innermost)

### Supabase Client Pattern
All hooks import supabase from a central file:
```typescript
import { supabase } from '@/lib/supabase'; // or wherever you place it in RN
```

### Type Casting
The web app uses `(supabase as any)` in some hooks to bypass TypeScript strictness on table names. You can either:
1. Copy this pattern
2. Or generate proper types with `supabase gen types typescript`

---

## 8.5 API Integration

### Aladhan Prayer Times API
- **Endpoint:** `https://api.aladhan.com/v1/timings/{DD-MM-YYYY}`
- **Parameters:** `latitude`, `longitude`, `method=1` (Shia Ithna-Ashari), `timezone`
- **Response:** JSON with `data.timings` (prayer times) and `data.date.hijri` (Hijri date — but we DON'T use this; we compute Hijri locally with the Bohra engine)
- **Caching:** 24 hours per date+location combination

---

## Setup Prompt for Cursor

> "Port the following hooks and contexts from the web app:
>
> **Contexts** (3):
> - `AuthContext` — replace `window.location.origin` with app deep link
> - `CalendarContext` — replace `navigator.geolocation` with `expo-location`, replace `localStorage` with `AsyncStorage` in prayer times caching
> - `ThemeContext` — remove DOM manipulation, provide color tokens via context instead
>
> **Hooks** (copy as-is, no changes needed):
> `useGoals`, `useGoalCompletions`, `useAdminGoalCompletions`, `useDynamicGoals`, `useUserPreferences`, `useTodayProgress`, `useOverdueGoals`, `useUserRole`, `usePrayerLog`, `usePrayerTimes`, `useMissedPrayers`
>
> **Library files** (port with minor changes):
> - `prayerTimes.ts` — make caching async (AsyncStorage), replace geolocation
> - `hijri.ts`, `recurrence.ts`, `calendarUtils.ts` — copy as-is
>
> Maintain the same provider nesting order: QueryClient → Auth → Theme → Calendar → Navigation."
