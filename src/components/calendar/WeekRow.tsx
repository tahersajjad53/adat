import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

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

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const WeekRow: React.FC<WeekRowProps> = ({
  weekDates,
  selectedDate,
  onSelectDate,
  onShiftWeek,
  qazaDays,
}) => {
  const todayKey = formatDateKey(new Date());
  const selectedKey = formatDateKey(selectedDate);
  const touchStartX = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      onShiftWeek(delta > 0 ? -1 : 1);
    }
  };

  return (
    <div
      className="flex w-full justify-between"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
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
              'flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 transition-all relative',
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
  );
};
