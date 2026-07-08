/**
 * Normalize transliteration text so "innī ẓā lafī" and "inni eza lafi" match.
 * - lowercase
 * - Unicode NFD then strip combining marks (removes ā, ī, ū, ṭ, ẓ diacritics)
 * - strip apostrophes / hyphens / dots
 * - collapse whitespace
 */
export function normalizeTranslit(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’'`^~.\-_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Find `query` inside `snippet` using the normalized form, and return the
 * original-substring split so the caller can bold the middle piece.
 * Returns null if no match.
 */
export function highlightMatch(
  snippet: string,
  query: string
): { before: string; match: string; after: string } | null {
  const normQuery = normalizeTranslit(query);
  if (!normQuery) return null;

  // Build a map from normalized-index -> original-index by walking the snippet.
  const originalChars: string[] = [];
  const normalizedChars: string[] = [];
  for (let i = 0; i < snippet.length; i++) {
    const ch = snippet[i];
    const n = normalizeTranslit(ch);
    if (n.length > 0) {
      for (const nc of n) {
        originalChars.push(String(i));
        normalizedChars.push(nc);
      }
    } else {
      // dropped char (diacritic/punct) - skip
    }
  }
  const normStr = normalizedChars.join('');
  const idx = normStr.indexOf(normQuery);
  if (idx === -1) return null;

  const startOrig = Number(originalChars[idx]);
  const endOrig = Number(originalChars[idx + normQuery.length - 1]) + 1;

  return {
    before: snippet.slice(0, startOrig),
    match: snippet.slice(startOrig, endOrig),
    after: snippet.slice(endOrig),
  };
}
