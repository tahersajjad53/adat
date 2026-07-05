import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTextLines } from '@/hooks/useTextLines';
import { useText } from '@/hooks/useTextsLibrary';
import { useReaderPrefs } from '@/hooks/useReaderPrefs';
import { ReaderHeader } from '@/components/reader/ReaderHeader';
import { ReaderSkeleton } from '@/components/reader/ReaderSkeleton';
import { AudioBar } from '@/components/reader/AudioBar';
import { toArabicIndic } from '@/lib/arabicDigits';

const Reader: React.FC = () => {
  const { textId } = useParams<{ textId: string }>();
  const { data: text } = useText(textId);
  const { data: lines, isLoading, error } = useTextLines(textId);
  const { fontSizePx } = useReaderPrefs();

  return (
    <>
      <div className="px-4 md:px-6 pb-32 max-w-2xl mx-auto">
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
          <p
            dir="rtl"
            lang="ar"
            className="arabic-quran text-foreground pt-6"
            style={{ fontSize: `${fontSizePx}px` }}
          >
            {lines.map((line) => (
              <React.Fragment key={line.id}>
                <span id={`verse-${line.line_no}`}>{line.arabic_text}</span>
                <span aria-hidden="true" className="ayah-marker">
                  {' '}
                  ﴿{toArabicIndic(line.line_no)}﴾
                </span>
                <span className="sr-only">Verse {line.line_no}. </span>
                {' '}
              </React.Fragment>
            ))}
          </p>
        )}
      </div>

      {text?.youtube_id && <AudioBar youtubeId={text.youtube_id} label={text.title ?? 'Recitation'} />}
    </>
  );
};

export default Reader;
