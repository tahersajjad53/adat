import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'ibadat:reader:prefs';
const EVENT = 'ibadat:reader:prefs-changed';

/** 5 discrete Arabic font sizes, in px. Index 2 = default (medium). */
export const READER_FONT_SIZES = [22, 28, 34, 40, 46] as const;
export type ReaderFontStep = 0 | 1 | 2 | 3 | 4;

export interface ReaderPrefs {
  fontStep: ReaderFontStep;
  showTransliteration: boolean;
  showTranslation: boolean;
}

const DEFAULTS: ReaderPrefs = {
  fontStep: 2,
  showTransliteration: false,
  showTranslation: false,
};

function readPrefs(): ReaderPrefs {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<ReaderPrefs>;
    return {
      fontStep: (Math.min(4, Math.max(0, parsed.fontStep ?? 2)) as ReaderFontStep),
      showTransliteration: !!parsed.showTransliteration,
      showTranslation: !!parsed.showTranslation,
    };
  } catch {
    return DEFAULTS;
  }
}

/** Global reader preferences persisted in localStorage; shared across components. */
export function useReaderPrefs() {
  const [prefs, setPrefsState] = useState<ReaderPrefs>(DEFAULTS);

  useEffect(() => {
    setPrefsState(readPrefs());
    const handler = () => setPrefsState(readPrefs());
    window.addEventListener(EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const update = useCallback((patch: Partial<ReaderPrefs>) => {
    const next = { ...readPrefs(), ...patch };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setPrefsState(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const increaseFont = useCallback(
    () => update({ fontStep: Math.min(4, prefs.fontStep + 1) as ReaderFontStep }),
    [prefs.fontStep, update],
  );
  const decreaseFont = useCallback(
    () => update({ fontStep: Math.max(0, prefs.fontStep - 1) as ReaderFontStep }),
    [prefs.fontStep, update],
  );

  return {
    prefs,
    fontSizePx: READER_FONT_SIZES[prefs.fontStep],
    setPrefs: update,
    increaseFont,
    decreaseFont,
    canIncrease: prefs.fontStep < 4,
    canDecrease: prefs.fontStep > 0,
  };
}
