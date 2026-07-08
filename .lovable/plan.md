
## Dua Library Search

Add a search affordance to the Dua library that lets users type a transliteration snippet (e.g. "inni eza lafi") and jump directly to the matching verse inside a text.

### UX

**Entry point — search icon in the header**
- On the `/dua` route only, replace the right-hand spacer in the mobile header with a search icon (Iconoir `Search`), sitting on the same row as the Ibadat logo.
- Tapping the icon reveals a search input at the top of the Dua page (the icon toggles open/close). The header itself keeps the logo; the input lives inside the page so it can grow, show results, and stay clear of the safe-area/blur.

**Search input + results (inside `/dua` page)**
- Slim rounded input with placeholder "Search transliteration…" and a clear (×) button.
- Debounced ~200 ms. Minimum 2 characters before querying.
- While a query is active, the category pill row and the normal library list are hidden and replaced by a results list. Clearing the input restores the library.
- Each result row shows:
  - Text title (e.g. "Surah Yaseen") and small verse label ("Verse 12").
  - A one-line transliteration snippet with the matched substring **bolded**.
- Tapping a result navigates to `/dua/{textId}#verse-{line_no}`.
- Empty state: "No matches for '{query}'".

**Jump-to-verse in the Reader**
- On mount, if `location.hash` matches `#verse-N`, scroll that verse into view (`scrollIntoView({ block: 'center' })`) after lines have loaded, and briefly highlight it (subtle background flash for ~1.2 s) so the user can locate the exact line inside the continuous Arabic paragraph.

### Search behaviour

- Query `text_lines` with `ilike` on `transliteration` using `%<normalized-query>%`.
- Normalize both sides: lowercase, collapse whitespace, strip common diacritics/punctuation (`'`, `’`, `-`, `.`) so "inni eza lafi" matches "innī ẹzā lafī" style variants. Applied client-side to the snippet match and mirrored in the query where practical (the DB `ilike` will use the lowercased raw query; we accept some false negatives for diacritics beyond ASCII fold and rely on the transliteration column being fairly plain).
- Join to `texts` to get the title and to filter out unverified texts in production (mirroring `useTextsLibrary`'s `verified` filter).
- Order by text title, then `line_no`. Cap at 50 results with a "Refine your search" hint if hit.
- List every occurrence, including multiple matches in the same dua as separate rows.

### Files

**New**
- `src/hooks/useTextSearch.ts` — React Query hook `useTextSearch(query)` returning `{ id, textId, textTitle, lineNo, snippet, matchStart, matchEnd }[]`. Handles debouncing (via caller passing debounced value) and the normalized `ilike` query joined against verified `texts`.
- `src/components/reader/SearchResults.tsx` — Presentational list with title, verse number, and bolded snippet; `<Link>` to `/dua/{textId}#verse-{lineNo}`.
- `src/lib/translitSearch.ts` — Small helpers: `normalize(str)`, `highlightMatch(snippet, query)` (returns `[before, match, after]` for bolding).

**Edited**
- `src/components/layout/AppLayout.tsx` — On `/dua` (exact), render a `Search` icon button on the right; toggles a page-level open state via a custom event `dua:toggleSearch` (matches the pattern used for calendar/today tabs already in this file).
- `src/pages/Dua.tsx` — Listen for `dua:toggleSearch`, own the `open` + `query` state, render the search input + `SearchResults` when open and query ≥ 2 chars, otherwise render `LibraryList` as today.
- `src/pages/Reader.tsx` — After `lines` load, read `location.hash`; if it matches `#verse-N`, scroll to that span and apply a temporary highlight class.
- `src/index.css` — Add a small `.verse-flash` animation (background fade) used by the Reader highlight.

### Out of scope
- Fuzzy/phonetic matching beyond simple normalization.
- Searching Arabic text or translation (transliteration only, per request).
- Persisting recent searches.
