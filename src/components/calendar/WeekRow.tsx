import React, { useRef, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { gregorianToBohra } from '@/lib/hijri';

interface WeekRowProps {
  weekDates: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onShiftWeek: (direction: -1 | 1) => void;
  qazaDays: Set<string>;
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
function toArabicNumerals(n: number): string {
  return String(n).split('').map(d => ARABIC_DIGITS[parseInt(d)]).join('');
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const WeekRow: React.FC<WeekRowProps> = ({
  weekDates,
  selectedDate,
  onSelectDate,
  onShiftWeek,
  qazaDays,
}) => {
  const hijriDates = useMemo(() =>
    weekDates.map(d => gregorianToBohra(d)),
  [weekDates]);

  const todayKey = formatDateKey(new Date());
  const selectedKey = formatDateKey(selectedDate);
  const touchStartX = useRef(0);
  const [slideClass, setSlideClass] = useState('translate-x-0 opacity-100');
  const animating = useRef(false);

  const handleSwipe = useCallback((direction: -1 | 1) => {
    if (animating.current) return;
    animating.current = true;

    // Slide out
    setSlideClass(
      direction === 1
        ? '-translate-x-full opacity-0'
        : 'translate-x-full opacity-0'
    );

    setTimeout(() => {
      onShiftWeek(direction);
      // Jump to entry position (no transition)
      setSlideClass(
        direction === 1
          ? 'translate-x-full opacity-0 !duration-0'
          : '-translate-x-full opacity-0 !duration-0'
      );

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSlideClass('translate-x-0 opacity-100');
          setTimeout(() => {
            animating.current = false;
          }, 200);
        });
      });
    }, 200);
  }, [onShiftWeek]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      handleSwipe(delta > 0 ? -1 : 1);
    }
  };

  return (
    <div
      className="w-full overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className={cn(
          'flex w-full justify-between transition-all duration-200 ease-out',
          slideClass
        )}
      >
        {weekDates.map((date) => {
          const dk = formatDateKey(date);
          const isSelected = dk === selectedKey;
          const isToday = dk === todayKey;
          const hasQaza = qazaDays.has(dk);

          return (
            <button
              key={dk}
              onClick={() => onSelectDate(date)}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 transition-colors relative',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : isToday
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <span className="text-[10px] font-medium uppercase tracking-wider">
                {DAY_NAMES[date.getDay()]}
              </span>
              <span className={cn('text-sm font-semibold', isSelected && 'text-primary-foreground')}>
                {date.getDate()}
              </span>
              {hasQaza && (
                <span className={cn(
                  'absolute top-1 right-1 h-1.5 w-1.5 rounded-full',
                  isSelected ? 'bg-primary-foreground/80' : 'bg-destructive'
                )} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
