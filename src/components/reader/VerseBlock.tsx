import React from 'react';
import { toArabicIndic } from '@/lib/arabicDigits';
import type { TextLine } from '@/hooks/useTextLines';

interface VerseBlockProps {
  line: TextLine;
  fontSizePx: number;
  showTransliteration: boolean;
  showTranslation: boolean;
}

/**
 * Renders one verse. `arabic_text` is rendered verbatim (never mutated); the
 * ﴿n﴾ marker is a sibling span so it can't leak into copy/paste of the ayah.
 */
export const VerseBlock: React.FC<VerseBlockProps> = ({
  line,
  fontSizePx,
  showTransliteration,
  showTranslation,
}) => {
  return (
    <article
      id={`verse-${line.line_no}`}
      className="py-6 border-b border-border/40 last:border-b-0 scroll-mt-24"
    >
      <p
        dir="rtl"
        lang="ar"
        className="arabic-body text-foreground"
        style={{ fontSize: `${fontSizePx}px` }}
      >
        <span>{line.arabic_text}</span>
        <span aria-hidden="true" className="ayah-marker">
          {' '}
          ﴿{toArabicIndic(line.line_no)}﴾
        </span>
        <span className="sr-only">Verse {line.line_no}</span>
      </p>

      {showTransliteration && line.transliteration && (
        <p className="mt-3 text-sm italic text-muted-foreground leading-relaxed">
          {line.transliteration}
        </p>
      )}

      {showTranslation && line.translation && (
        <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
          {line.translation}
        </p>
      )}
    </article>
  );
};
