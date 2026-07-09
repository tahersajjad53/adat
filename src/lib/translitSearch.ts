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

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'y']);
const DIGRAPHS: Record<string, string> = {
  kh: 'k',
  gh: 'g',
  sh: 's',
  th: 's',
  dh: 'z',
  ch: 's',
  ck: 'k',
};
const SINGLES: Record<string, string> = {
  q: 'k',
  c: 'k',
  z: 'z',
  x: 'ks',
};

/**
 * Reduce a normalized string to a consonant "skeleton" that collapses common
 * Arabic-transliteration spelling variants:
 *   "laqad"  -> "lkd"
 *   "lakad"  -> "lkd"
 *   "dhalika" -> "zlk"
 *   "zalika"  -> "zlk"
 * Returns the skeleton plus a map from skeleton-index -> source-index so we
 * can highlight the original substring that produced a match.
 */
function buildSkeleton(normalized: string): { skel: string; map: number[] } {
  const out: string[] = [];
  const map: number[] = [];
  let i = 0;
  let last = '';
  while (i < normalized.length) {
    const ch = normalized[i];
    if (ch === ' ') {
      i += 1;
      last = '';
      continue;
    }
    // Digraph lookahead
    const pair = normalized.slice(i, i + 2);
    let emit = '';
    let step = 1;
    if (pair.length === 2 && DIGRAPHS[pair]) {
      emit = DIGRAPHS[pair];
      step = 2;
    } else if (VOWELS.has(ch)) {
      i += 1;
      continue;
    } else if (SINGLES[ch]) {
      emit = SINGLES[ch];
    } else {
      emit = ch;
    }
    // Collapse doubled consonants
    if (emit === last) {
      i += step;
      continue;
    }
    for (const c of emit) {
      out.push(c);
      map.push(i);
    }
    last = emit;
    i += step;
  }
  return { skel: out.join(''), map };
}

export function toSkeleton(input: string): string {
  return buildSkeleton(normalizeTranslit(input)).skel;
}

export type MatchTier = 'exact' | 'fuzzy';

export interface MatchResult {
  before: string;
  match: string;
  after: string;
  tier: MatchTier;
}

/**
 * Try exact-normalized substring match first, then fall back to a forgiving
 * skeleton-substring match. Returns split original substring for highlighting
 * plus the tier so callers can annotate fuzzy hits.
 */
export function findMatch(snippet: string, query: string): MatchResult | null {
  const normQuery = normalizeTranslit(query);
  if (!normQuery) return null;

  // Build normalized snippet + map: normalizedIndex -> originalIndex
  const normChars: string[] = [];
  const normToOrig: number[] = [];
  for (let i = 0; i < snippet.length; i++) {
    const n = normalizeTranslit(snippet[i]);
    for (const nc of n) {
      normChars.push(nc);
      normToOrig.push(i);
    }
  }
  const normStr = normChars.join('');

  // Tier 1: exact normalized
  const exactIdx = normStr.indexOf(normQuery);
  if (exactIdx !== -1) {
    const startOrig = normToOrig[exactIdx];
    const endOrig = normToOrig[exactIdx + normQuery.length - 1] + 1;
    return {
      before: snippet.slice(0, startOrig),
      match: snippet.slice(startOrig, endOrig),
      after: snippet.slice(endOrig),
      tier: 'exact',
    };
  }

  // Tier 2: skeleton (only for queries of 3+ normalized chars, to limit noise)
  if (normQuery.length < 3) return null;

  const skelQuery = buildSkeleton(normQuery).skel;
  if (skelQuery.length < 2) return null;

  const { skel: skelSnippet, map: skelToNorm } = buildSkeleton(normStr);
  const skelIdx = skelSnippet.indexOf(skelQuery);
  if (skelIdx === -1) return null;

  const normStart = skelToNorm[skelIdx];
  const normEnd = skelToNorm[skelIdx + skelQuery.length - 1];
  const startOrig = normToOrig[normStart];
  const endOrig = normToOrig[Math.min(normEnd, normToOrig.length - 1)] + 1;

  return {
    before: snippet.slice(0, startOrig),
    match: snippet.slice(startOrig, endOrig),
    after: snippet.slice(endOrig),
    tier: 'fuzzy',
  };
}

/**
 * Back-compat wrapper for callers that only need the split, not the tier.
 */
export function highlightMatch(
  snippet: string,
  query: string
): { before: string; match: string; after: string } | null {
  const m = findMatch(snippet, query);
  if (!m) return null;
  const { before, match, after } = m;
  return { before, match, after };
}
