import React, { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTextLines } from '@/hooks/useTextLines';
import { useText } from '@/hooks/useTextsLibrary';
import { useReaderPrefs } from '@/hooks/useReaderPrefs';
import { useLastRead } from '@/hooks/useLastRead';
import { ReaderHeader } from '@/components/reader/ReaderHeader';
import { VerseBlock } from '@/components/reader/VerseBlock';
import { ReaderSkeleton } from '@/components/reader/ReaderSkeleton';

const Reader: React.FC = () => {
  const { textId } = useParams<{ textId: string }>();
  const { data: text } = useText(textId);
  const { data: lines, isLoading, error } = useTextLines(textId);
  const { prefs, fontSizePx } = useReaderPrefs();
  const { lastReadLine, setLastRead } = useLastRead(textId);

  const restoredRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Resume at last-read verse once lines land.
  useEffect(() => {
    if (restoredRef.current) return;
    if (!lines || lines.length === 0) return;
    if (!lastReadLine || lastReadLine <= 1) {
      restoredRef.current = true;
      return;
    }
    const el = document.getElementById(`verse-${lastReadLine}`);
    if (el) {
      el.scrollIntoView({ behavior: 'auto', block: 'start' });
      restoredRef.current = true;
    }
  }, [lines, lastReadLine]);

  // Track current visible verse to persist as last-read.
  useEffect(() => {
    if (!lines || lines.length === 0) return;
    const node = containerRef.current;
    if (!node) return;

    let ticking = false;
    let currentTop = -1;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const raw = (entry.target as HTMLElement).id.replace('verse-', '');
          const n = Number.parseInt(raw, 10);
          if (Number.isFinite(n) && n !== currentTop) {
            currentTop = n;
            if (!ticking) {
              ticking = true;
              window.setTimeout(() => {
                setLastRead(currentTop);
                ticking = false;
              }, 400);
            }
          }
        }
      },
      { root: null, rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    );

    const els = node.querySelectorAll('[id^="verse-"]');
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [lines, setLastRead]);

  return (
    <div className="px-4 md:px-6 pb-24 max-w-2xl mx-auto">
      <ReaderHeader title={text?.title} titleAr={text?.title_ar} />

      {isLoading && <ReaderSkeleton />}

      {error && (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground mb-3">
            Couldn't load this text.
          </p>
          <Link to="/dua" className="text-sm underline">
            Back to Library
          </Link>
        </div>
      )}

      {!isLoading && !error && lines && lines.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground mb-3">
            This text has no verses yet.
          </p>
          <Link to="/dua" className="text-sm underline">
            Back to Library
          </Link>
        </div>
      )}

      {lines && lines.length > 0 && (
        <div ref={containerRef} className="pt-4">
          {lines.map((line) => (
            <VerseBlock
              key={line.id}
              line={line}
              fontSizePx={fontSizePx}
              showTransliteration={prefs.showTransliteration}
              showTranslation={prefs.showTranslation}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Reader;
