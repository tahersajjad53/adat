import { useCallback, useEffect, useState } from 'react';

const keyFor = (textId: string) => `ibadat:reader:lastRead:${textId}`;

/**
 * Remembers the last visible line_no for a given text in localStorage.
 * No DB writes.
 */
export function useLastRead(textId: string | undefined) {
  const [lineNo, setLineNoState] = useState<number | null>(null);

  useEffect(() => {
    if (!textId) return;
    try {
      const raw = window.localStorage.getItem(keyFor(textId));
      setLineNoState(raw ? Number.parseInt(raw, 10) || null : null);
    } catch {
      setLineNoState(null);
    }
  }, [textId]);

  const setLastRead = useCallback(
    (n: number) => {
      if (!textId) return;
      try {
        window.localStorage.setItem(keyFor(textId), String(n));
        setLineNoState(n);
      } catch {
        /* storage unavailable — ignore */
      }
    },
    [textId],
  );

  const clearLastRead = useCallback(() => {
    if (!textId) return;
    try {
      window.localStorage.removeItem(keyFor(textId));
      setLineNoState(null);
    } catch {
      /* ignore */
    }
  }, [textId]);

  return { lastReadLine: lineNo, setLastRead, clearLastRead };
}
