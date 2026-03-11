import React, { useRef, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useMonthIndicators } from '@/hooks/useMonthIndicators';
import { gregorianToBohra, HijriDate } from '@/lib/hijri';

interface MonthViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toArabicNumerals(n: number): string {
  return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthWeeks(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];

  for (let i = 0; i < startDow; i++) currentWeek.push(null);

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(new Date(year, month, day));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  return weeks;
}

export const MonthView: React.FC<MonthViewProps> = ({ selectedDate, onSelectDate }) => {
  const [displayYear, setDisplayYear] = useState(selectedDate.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(selectedDate.getMonth());
  const [slideClass, setSlideClass] = useState('translate-y-0 opacity-100');
  const animating = useRef(false);
  const touchStartY = useRef(0);

  const { qazaDays, goalDays } = useMonthIndicators(displayYear, displayMonth);
  const weeks = getMonthWeeks(displayYear, displayMonth);
  const todayKey = formatDateKey(new Date());

  // Precompute Hijri dates for all days in the month
  const hijriMap = useMemo(() => {
    const map = new Map<string, HijriDate>();
    for (const week of weeks) {
      for (const date of week) {
        if (date) {
          map.set(formatDateKey(date), gregorianToBohra(date));
        }
      }
    }
    return map;
  }, [weeks]);

  // Derive Hijri month span for header
  const hijriHeader = useMemo(() => {
    const firstDate = new Date(displayYear, displayMonth, 1);
    const lastDate = new Date(displayYear, displayMonth + 1, 0);
    const firstHijri = hijriMap.get(formatDateKey(firstDate));
    const lastHijri = hijriMap.get(formatDateKey(lastDate));
    if (!firstHijri || !lastHijri) return '';

    if (firstHijri.month === lastHijri.month && firstHijri.year === lastHijri.year) {
      return `${firstHijri.monthNameArabic} ${toArabicNumerals(firstHijri.year)}`;
    }
    if (firstHijri.year === lastHijri.year) {
      return `${firstHijri.monthNameArabic} – ${lastHijri.monthNameArabic} ${toArabicNumerals(firstHijri.year)}`;
    }
    return `${firstHijri.monthNameArabic} ${toArabicNumerals(firstHijri.year)} – ${lastHijri.monthNameArabic} ${toArabicNumerals(lastHijri.year)}`;
  }, [hijriMap, displayYear, displayMonth]);

  const monthLabel = new Date(displayYear, displayMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const shiftMonth = useCallback((dir: -1 | 1) => {
    if (animating.current) return;
    animating.current = true;

    setSlideClass(dir === 1 ? '-translate-y-8 opacity-0' : 'translate-y-8 opacity-0');

    setTimeout(() => {
      setDisplayMonth(prev => {
        let newMonth = prev + dir;
        let newYear = displayYear;
        if (newMonth < 0) { newMonth = 11; newYear--; }
        if (newMonth > 11) { newMonth = 0; newYear++; }
        setDisplayYear(newYear);
        return newMonth;
      });

      setSlideClass(dir === 1 ? 'translate-y-8 opacity-0 !duration-0' : '-translate-y-8 opacity-0 !duration-0');

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSlideClass('translate-y-0 opacity-100');
          setTimeout(() => { animating.current = false; }, 200);
        });
      });
    }, 200);
  }, [displayYear]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(delta) > 50) {
      shiftMonth(delta > 0 ? -1 : 1);
    }
  };

  return (
    <div
      className="px-1 select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Month/Year header */}
      <div className="text-center mb-4">
        <h2 className="font-display tracking-tight font-normal text-xl">
          {monthLabel}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">{hijriHeader}</p>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Weeks grid */}
      <div className={cn('transition-all duration-200 ease-out grid gap-1', slideClass)}>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((date, di) => {
              if (!date) {
                return <div key={`empty-${di}`} className="py-2.5" />;
              }

              const dk = formatDateKey(date);
              const isToday = dk === todayKey;
              const hasQaza = qazaDays.has(dk);
              const hasGoals = goalDays.has(dk);
              const hijri = hijriMap.get(dk);

              return (
                <button
                  key={dk}
                  onClick={() => onSelectDate(date)}
                  className={cn(
                    'flex flex-col items-center gap-0 rounded-xl py-2.5 transition-colors',
                    isToday
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  <span className="text-sm font-medium leading-tight">{date.getDate()}</span>
                  {hijri && (
                    <span className="text-xl text-muted-foreground leading-none">
                      {hijri.day === 1
                        ? `${toArabicNumerals(hijri.day)} ${hijri.monthNameArabic.split(' ')[0]}`
                        : toArabicNumerals(hijri.day)}
                    </span>
                  )}
                  <div className="flex gap-0.5 h-1.5">
                    {hasQaza && <span className="h-1.5 w-1.5 rounded-full bg-destructive" />}
                    {hasGoals && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};