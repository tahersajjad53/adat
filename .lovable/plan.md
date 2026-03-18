

## Diagnosis: Corrupted Dependency State

The root error is:
```
Cannot find package 'vite' imported from /opt/template-node-modules/@vitejs/plugin-react-swc/index.js
```

This is an infrastructure-level dependency resolution failure. All the TypeScript errors (SheetContent missing `className`, `@supabase/supabase-js` missing exports, `@tanstack/react-query` missing `QueryClient`, etc.) are **cascading symptoms** — when Vite can't resolve, the TS compiler can't load type definitions from `node_modules`, so every third-party type breaks.

The actual source code is correct. `sheet.tsx` properly extends `React.ComponentPropsWithoutRef` which includes `className`. The imports in `AuthContext.tsx`, `App.tsx`, etc. are all standard and valid.

### Fix

**Trigger a dependency reinstall** by making a trivial, no-op change to `package.json` — for example, bumping the version from `"0.0.0"` to `"0.0.1"`. This forces Lovable's build system to re-resolve and reinstall all packages, clearing the corrupted state.

No other code changes needed. Single file, single line.

