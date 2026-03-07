import React from 'react';
import { cn } from '@/lib/utils';
import { NavArrowLeft, NavArrowRight } from 'iconoir-react';
import { Button } from '@/components/ui/button';

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

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => onShiftWeek(-1)}
      >
        <NavArrowLeft className="h-4 w-4" />
      </Button>

      <div className="flex flex-1 justify-between">
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
                'flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-2 transition-all relative',
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

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => onShiftWeek(1)}
      >
        <NavArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
