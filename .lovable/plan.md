
## Forgiving transliteration search

Yes, this is very feasible. The library is small (a handful of surahs/duas, at most a few thousand verses), so we can afford a smarter matcher that runs client-side without any schema changes.

### Approach

Replace the current strict `ilike` with a **phonetic-skeleton match**. Both the stored transliteration and the user's query are reduced to the same simplified "skeleton" before comparing, so common spelling swaps ("lakad" vs "laqad", "dhalika" vs "zalika", "thumma" vs "summa") all collapse to the same key.

**Skeleton rules (applied in order):**
1. Lowercase + strip diacritics (ā, ī, ū, ṣ, ḍ, ṭ, ẓ, ḥ, ġ …).
2. Strip apostrophes, hyphens, dots.
3. Collapse Arabic-transliteration digraphs to a single canonical letter:
   - `kh`, `q`, `ck` → `k`
   - `gh` → `g`
   - `sh`, `th`, `ṣ` → `s`
   - `dh`, `z`, `ẓ` → `z`
   - `ch` → `s`
4. Collapse doubled consonants (`ll` → `l`, `mm` → `m`, …).
5. Optionally strip short vowels (`a`, `e`, `i`, `o`, `u`) to match consonant skeletons — this is what lets "lakad"/"laqad"/"laqaad" all reduce to `lkd`. We'll keep the first letter's vowel to reduce false positives at word starts.
6. Collapse whitespace.

So `laqad` → `lkd`, `lakad` → `lkd`, `dhālika` → `zlk`, `zalika` → `zlk`, `inni izā` → `nz` (matches "inni eza"), etc.

**Match tiers (best first, stop at first tier that returns results):**
1. **Exact normalized** — current behaviour (lowercase + diacritics stripped). Highest confidence.
2. **Skeleton substring** — the forgiving match above.

Results from tier 2 get a small "similar match" tag so the user knows it's a fuzzy hit vs an exact one.

### Where the search runs

Because the skeleton transform can't be expressed inside a plain SQL `ilike`, the fair-play options are:

- **Client-side over the full library.** Load every `text_lines` row once (per session, cached via React Query), run the matcher in memory. For the current library size this is a single ~small payload and gives us instant, forgiving search with zero DB work.
- Alternative: add a generated `translit_key` column + GIN index. More work, only worth it if the library grows to tens of thousands of lines. Not needed today.

Going with the client-side approach.

### Snippet highlighting

The existing highlighter uses the raw normalized query, which won't find "laqad" inside a snippet when the user typed "lakad". Extend `highlightMatch` so it walks the snippet building both a normalized-index map **and** a skeleton-index map, and highlights whichever tier matched. If the skeleton spans across characters that don't line up (e.g. "kh" collapsed to "k"), highlight the full covering original substring.

### Files

**Edited**
- `src/lib/translitSearch.ts` — Add `toSkeleton(str)` and a two-tier `findMatch(snippet, query)` that returns `{ before, match, after, tier: 'exact' | 'fuzzy' }`.
- `src/hooks/useTextSearch.ts` — Switch to a single library-wide query (`text_lines` + `texts!inner`, verified filter as today) cached under one key. In the `select`/post-processing step, iterate rows and keep those whose transliteration matches at tier 1 or tier 2. Sort exact matches before fuzzy, then by text title and line number. Cap at 50 with the existing "refine" hint.
- `src/components/reader/SearchResults.tsx` — Use the new `findMatch` result. Show a small muted "similar" pill on fuzzy hits so exact vs fuzzy is transparent.

**Unchanged**
- Search-icon entry point, page layout, debounce, keyboard handling, jump-to-verse behaviour.

### Trade-offs (called out for the design brief)

- **False positives:** vowel-stripping is aggressive. A three-letter query like "kd" would match a lot. We already require ≥ 2 characters; bumping the skeleton-tier minimum to 3 characters keeps noise down while still catching the "lakad" case.
- **Payload size:** loading the full library into memory is fine now (~kilobytes). If the library grows past a few thousand lines we should revisit the generated-column approach.
- **Ranking:** exact matches always show first, so users who type the "correct" spelling still get precise results at the top.
