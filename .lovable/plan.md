## Phase 3 — Reader Screen

Replace the placeholder Reader route with the real reading view for a selected text (Surah Yaseen for launch). Mushaf-inspired: RTL, generous vertical rhythm, Al-Kanz for Arabic, no chrome distractions. Mobile-first.

### What the user sees

Route: `/dua/:textId` (already wired).

- **Compact top bar** (sticky, subtle frosted background matching the app pattern):
  - Left: back chevron → `/dua`, labelled "Library".
  - Center: Latin title (small) with Arabic title beneath in Al-Kanz.
  - Right: 3-dot menu with reader preferences (see below).
- **Verse column** (RTL, single centered column, max-width comfortable for reading):
  - One block per line from `text_lines`, ordered by `line_no`.
  - `arabic_text` rendered **verbatim** in the `.arabic-body` utility (Al-Kanz, RTL, plaintext bidi, generous line-height so tashkeel isn't clipped).
  - After each verse, an inline ayah marker `﴿n﴾` rendered as a **sibling span** — never concatenated into `arabic_text`. The number inside the marker uses Arabic-Indic digits (٠–٩) to match the Mushaf aesthetic already used on the Qaza page.
  - If reader prefs enable them, transliteration and translation appear beneath each verse in the app's body font, muted color, LTR. Hidden entirely when their toggle is off (not just faded).
- **Font-size control:** live in the top-bar menu. 5 discrete steps (already defined in `useReaderPrefs`), with A− / A+ buttons and a small indicator. Only the Arabic scales; transliteration/translation stay at their default body size.
- **Toggles:** Show transliteration, Show translation — both off by default, persisted in `localStorage` via existing `useReaderPrefs`.
- **Last-read resume:** on mount, if `useLastRead(textId)` has a value, scroll to that verse smoothly after render. As the user scrolls, the currently-visible verse updates last-read (debounced, no DB writes).
- **Loading state:** a few skeleton verse blocks matching the Arabic rhythm.
- **Empty / error state:** calm message ("This text has no verses yet" / "Couldn't load this text") with a link back to Library.

### Ayah marker

Rendered as: `<span aria-hidden="true" class="ayah-marker">﴿{arabicIndic(line_no)}﴾</span>` — inline, sized proportional to Arabic font, muted color, non-selectable. Screen readers get an `aria-label` like "Verse 5".

### Visual direction

- Uses existing semantic tokens; works in all three themes.
- No new fonts. Al-Kanz already loaded via `@font-face`.
- Reader body is deliberately minimal — no cards around verses, just breathing space and a hairline separator (`border-b border-border/40`) between verses. This matches the "closer to a printed Mushaf than a typical app screen" brief.
- Top bar uses the same frosted-blur pattern as the Today header for consistency.

### Technical notes

- **Edited:** `src/pages/Reader.tsx` — replaces placeholder.
- **New files:**
  - `src/components/reader/ReaderHeader.tsx` — sticky top bar with title + preferences menu.
  - `src/components/reader/ReaderPreferencesMenu.tsx` — font stepper + two toggles, using existing `useReaderPrefs`.
  - `src/components/reader/VerseBlock.tsx` — one verse: Arabic + inline marker, optional transliteration/translation.
  - `src/components/reader/ReaderSkeleton.tsx` — loading placeholders.
  - `src/lib/arabicDigits.ts` — small helper converting a Latin integer to Arabic-Indic digits (reused from the QazaNamaz pattern; extracted for reuse).
- **Data:** consumes existing `useTextLines(textId)`, `useReaderPrefs()`, `useLastRead(textId)`, and reads the parent `texts` row via a lightweight `useText(textId)` addition to `useTextsLibrary.ts` (single-row query, cached), so the header can show the correct title without waiting on the full library list.
- **Untouched:** database, RLS, routing map, bottom nav, Library screen, Phase 1 hooks' public API.

### Out of scope for Phase 3

Search within a text, bookmarks beyond last-read, audio recitation, verse sharing, cross-text navigation ("next surah"), translation source selector — these are Phase 4 candidates.

### Verification

- Open Surah Yaseen → 83 verse blocks render in order, RTL, each ending in `﴿n﴾` with the number matching `line_no`.
- Tashkeel (fatha, kasra, shadda, etc.) fully visible top and bottom of every line.
- Font A+ / A− scales only Arabic and persists after refresh.
- Transliteration and translation toggles are off by default; turning them on reveals the stored strings verbatim.
- Copying an Arabic verse pastes exactly the `arabic_text` string with no marker digits mixed in.
- Scrolling past a verse and returning to the library → reopening the text scrolls back to that verse.
