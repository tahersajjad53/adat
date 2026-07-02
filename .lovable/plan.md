# Phase 1 — Reader Foundations & Data Layer

Read-only groundwork so the Dua page can safely surface `texts` / `text_lines` from Supabase. No schema changes, no writes, no Arabic transformations.

## What gets built

**Typed data hooks (React Query)**
- `useTextsLibrary()` — fetches from `texts`, filters `verified = true` in production, groups by `category`, orders by `type` then `surah`/`title`.
- `useTextLines(textId)` — fetches from `text_lines` for a given text, ordered by `line_no`.
- Both are read-only, cached, and follow the existing hook patterns in `src/hooks/`.

**Local persistence helpers (localStorage only, no DB writes)**
- `useLastRead(textId)` — remembers the last visible `line_no` per text. Key: `ibadat:reader:lastRead:{textId}`.
- `useReaderPrefs()` — global reader preferences: Arabic font-size step, transliteration on/off, translation on/off. Defaults: medium size, both toggles off.

**Verified-flag handling**
- Production: only rows with `verified = true` appear.
- Build/QA: a dev-only bypass (env flag) so the seeded Surah Yaseen (currently `verified = false`) is visible while we build. Before Phase 2 ships publicly we'll ask you to flip Yaseen's `verified` to `true`.

**Arabic rendering utility**
- New CSS class `.arabic-body` in `src/index.css`: Kanz al Marjaan, `line-height: 2.1`, `unicode-bidi: plaintext`, generous vertical padding so tashkeel is never clipped.
- One throwaway sanity check page (or console log) confirms an Arabic line from Supabase renders byte-for-byte and diacritics are fully visible. Removed at end of phase.

## Guardrails already in place for later phases

- Arabic text will always be rendered via `{line.arabic_text}` directly — no `.normalize()`, `.replace()`, `.trim()`.
- Ayah markers (introduced in Phase 3) will be a sibling element, never concatenated into the Arabic string.
- Every Arabic container will carry `dir="rtl" lang="ar"`.

## Files touched in this phase

- **New:** `src/hooks/useTextsLibrary.ts`, `src/hooks/useTextLines.ts`, `src/hooks/useLastRead.ts`, `src/hooks/useReaderPrefs.ts`
- **Edited:** `src/index.css` (add `.arabic-body` utility)
- **Unchanged:** `src/pages/Dua.tsx` (placeholder stays until Phase 2), database schema, `texts` / `text_lines` rows.

## Out of scope for Phase 1

- Library UI, reader UI, routing changes, ayah markers, font-size controls, settings sheet. All arrive in Phases 2–4.
