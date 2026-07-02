# Phase 2 — Library Screen

Replace the "coming soon" placeholder on the Dua page with a browsable library of reader texts, sourced from the Phase 1 hooks. No reader UI yet — tapping an item is a no-op stub until Phase 3 wires up routing.

## What the user sees

The Dua tab (`/dua`) becomes a scrollable library:

- **Header:** "Ibadat" title in the app's display font, with a short subtitle like "Read and reflect."
- **Sections grouped by category** (e.g. "Quran", then "Duas"). Category name uses the standard section-header style already in the app (`font-display tracking-tight text-xl`).
- **Cards, one per text**, listed vertically inside each section:
  - Arabic title on the right, rendered RTL in Kanz al Marjaan via the new `.arabic-body` utility (currently: يس).
  - Latin title on the left in the app's body font (currently: "Surah Yaseen").
  - A small type badge ("Quran" or "Dua") and, when present, the source (`source_kitab`).
  - A subtle verified tick when `verified = true`.
  - Whole card is tappable, with the standard cozy card treatment used elsewhere in the app (rounded, soft border, muted hover).
- **Loading state:** three skeleton cards.
- **Empty state:** a calm message ("No texts available yet") reusing the visual language of the existing empty states, so it feels intentional rather than broken.

Because only Surah Yaseen exists in the database today (and it's still `verified = false`), production users will see the empty state until the flag is flipped. In the preview/dev build the dev bypass from Phase 1 keeps Yaseen visible so we can review the layout.

## What tapping a card does

For Phase 2, tapping a card is a stub — it will simply mark that text as the "intended target" (no navigation, no toast). Phase 3 replaces this with real navigation to `/dua/:textId`. This keeps Phase 2 fully non-destructive: no routes added, no reader shell to maintain twice.

If you'd prefer we skip the stub and leave cards visually tappable but inert, that's a one-line change — happy either way.

## Visual direction

Follows the app's existing cozy, card-based sequential layout. No new color tokens, no new fonts beyond Al-Kanz (already loaded). Works in all three themes (Oudh, Bhukur, Khalaf) because everything uses semantic tokens.

## Technical notes

- **New files:** `src/components/reader/LibraryList.tsx`, `src/components/reader/LibraryCard.tsx`, `src/components/reader/LibrarySkeleton.tsx`.
- **Edited:** `src/pages/Dua.tsx` — replace placeholder with `<LibraryList />`, keep the page container and top padding consistent with other pages.
- **Data:** consumes `useTextsLibrary()` from Phase 1. No new queries.
- **Arabic rendering:** titles use `<span dir="rtl" lang="ar" className="arabic-body">{title_ar}</span>`, rendered directly from the database string with no transforms.
- **Untouched:** routing (`App.tsx`), bottom nav, database, `text_lines`, all Phase 1 hooks.

## Out of scope for Phase 2

Reader route, verse rendering, ayah markers, font-size controls, transliteration/translation toggles, last-read resume, search/filter within the library. All arrive in Phases 3 and 4.

## One decision needed before build

Should tapping a card in Phase 2 be a no-op, or should we go ahead and add the `/dua/:textId` route now with a minimal placeholder screen so the navigation feels alive during review? Either is quick; the placeholder route is slightly nicer for QA but adds a file we'll rewrite in Phase 3.
