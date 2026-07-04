## What's actually happening

The Supabase data is correct. Every verse is stored in proper Uthmani script, character-for-character. The problem is the font.

The reader currently uses **Al-Kanz**, a decorative Arabic display font. I inspected its character set and it is missing almost every Quran-specific mark used in Surah Yaseen:

- Small high sukun ۡ (U+06E1)
- Small high seen, meem, waqf marks (U+06D6–U+06ED)
- Superscript hamza / maddah ٓ ٔ ٕ ٖ ٗ (U+0653–U+0657)
- Rounded fathatan / kasratan / dammatan ࣰ ࣱ ࣲ (U+08F0–U+08F2)

When even one mark in a word is missing from the primary font, the browser silently falls back to a different font just for that character. That fallback breaks Al-Kanz's shaping engine mid-word, so the letters on either side of the mark drop back to their isolated forms — this is what looks like "words that should be joined are not joined." It is not a rendering bug in our code; the font simply cannot render Quranic text.

Al-Kanz is fine for headings and titles (surah names, page chrome). It is not usable as the body font for Quran or any tashkeel-heavy dua.

## The fix

Introduce a second Arabic font dedicated to reader body text, chosen specifically for full Uthmani coverage, and route only the verse body through it. Al-Kanz stays for titles and app chrome so the visual identity is preserved.

**Font choice: Amiri Quran** (SIL OFL, free, ~400 KB woff2). It is the reference open-source Uthmani font, covers every mark above, and matches the printed Mushaf aesthetic we're aiming for. Amiri Quran is a single-weight family purpose-built for the Quran — no styling variants needed.

Fallback stack for safety: `'Amiri Quran', 'Scheherazade New', 'Noto Naskh Arabic', serif`.

## Changes

1. **Add the font file.** Drop `AmiriQuran-Regular.woff2` into `src/assets/fonts/` and register it via `@font-face` in `src/index.css` with the same Arabic `unicode-range` we use today so it only loads when Arabic is on screen. Keep `font-display: swap`.
2. **Split the utility classes in `src/index.css`.**
   - Keep `.arabic-body` using Al-Kanz — used only by the reader header's Arabic title and other short display strings.
   - Add a new `.arabic-quran` utility: Amiri Quran, `line-height: 2.2`, `unicode-bidi: plaintext`, `text-align: right`, `font-feature-settings` unchanged. This is what verses render in.
   - Tune `.ayah-marker` to inherit the same font so the ornamental parentheses match the verse weight.
3. **Update `src/pages/Reader.tsx`** to apply `.arabic-quran` on the verse paragraph instead of `.arabic-body`. No structural change — same single flowing paragraph, same ayah markers, same font-size stepper. The header keeps `.arabic-body` (Al-Kanz) for the surah title.
4. **Re-tune the font-size steps in `src/hooks/useReaderPrefs.ts`.** Amiri Quran has a smaller x-height than Al-Kanz, so today's default (index 2) reads about one step too small once we swap. Shift the 5-step ladder up by ~2 px per step (roughly 24 / 28 / 32 / 38 / 46) so the default still feels like comfortable reading size on mobile.
5. **Verify.** Open Surah Yaseen and confirm every ayah renders with joined letters, tashkeel sitting cleanly above/below without clipping, and the ﴿n﴾ markers still inline. Spot-check ayah 8 (`أَعۡنَٰقِهِمۡ`, `أَغۡلَٰلٗا`) and ayah 9 (`فَأَغۡشَيۡنَٰهُمۡ`) — these are the words that were breaking, because they each contain a small-high sukun plus fathatan-with-tail.

## Why not other options

- **Force Al-Kanz to render the missing marks via CSS or feature flags** — impossible, the glyphs aren't in the font file.
- **Strip the Quranic marks from the DB text** — destructive and religiously incorrect; loses the Uthmani reading.
- **Ship a full Uthmanic font like KFGQPC Uthman Taha** — better coverage than Amiri Quran in some edge cases but licensing is restrictive and the file is ~1 MB. Not worth it for the current scope; Amiri Quran covers 100% of Yaseen.
- **Rely on system fonts** — inconsistent across iOS / Android / desktop; the whole point of shipping our own font is a predictable Mushaf look.

## Out of scope

Search, bookmarks, audio, verse-level sharing, transliteration/translation display (already removed), typography theming per surah. Those stay Phase 4+.
