import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import {
  getDaysInBohraMonth,
  getHijriMonthName,
  bohraToJDN,
  jdnToGregorian,
  gregorianToBohra,
  type HijriDate,
} from '@/lib/hijri';

interface HijriCalendarGridProps {
  /** Currently selected Gregorian date as YYYY-MM-DD */
  selected?: string;
  /** Today's Hijri date (post-Maghrib aware) */
  todayHijri: HijriDate;
  /** Called with Gregorian YYYY-MM-DD when a day is selected */
  onSelect: (dateStr: string) => void;
  timezone?: string;
}

const WEEKDAY_HEADERS_AR = ['أح', 'اث', 'ثل', 'أر', 'خم', 'جم', 'سب'];

function toArabicNumerals(n: number): string {
  return String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
}

export default function HijriCalendarGrid({
  selected,
  todayHijri,
  onSelect,
  timezone,
}: HijriCalendarGridProps) {
  // Initialize to the month of the selected date or today's Hijri
  const initialHijri = selected
    ? gregorianToBohra(new Date(selected + 'T12:00:00'), timezone)
    : todayHijri;

  const [viewMonth, setViewMonth] = useState(initialHijri.month);
  const [viewYear, setViewYear] = useState(initialHijri.year);

  const daysInMonth = getDaysInBohraMonth(viewMonth, viewYear);

  // Find what Gregorian weekday day 1 of this Hijri month falls on
  const firstDayJDN = bohraToJDN({ year: viewYear, month: viewMonth, day: 1 });
  const firstDayGreg = jdnToGregorian(firstDayJDN);
  const firstDayWeekday = new Date(
    firstDayGreg.year,
    firstDayGreg.month - 1,
    firstDayGreg.day
  ).getDay();

  // Selected Hijri date for highlighting
  const selectedHijri = selected
    ? gregorianToBohra(new Date(selected + 'T12:00:00'), timezone)
    : null;

  const handlePrev = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNext = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDayClick = (day: number) => {
    const jdn = bohraToJDN({ year: viewYear, month: viewMonth, day });
    const greg = jdnToGregorian(jdn);
    const dateStr = `${greg.year}-${String(greg.month).padStart(2, '0')}-${String(greg.day).padStart(2, '0')}`;
    onSelect(dateStr);
  };

  const isToday = (day: number) =>
    todayHijri.year === viewYear &&
    todayHijri.month === viewMonth &&
    todayHijri.day === day;

  const isSelected = (day: number) =>
    selectedHijri &&
    selectedHijri.year === viewYear &&
    selectedHijri.month === viewMonth &&
    selectedHijri.day === day;

  // Build grid cells: leading blanks + day numbers
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="p-3 pointer-events-auto" dir="rtl">
      {/* Header */}
      <div className="flex justify-center pt-1 relative items-center mb-4">
        <button
          type="button"
          onClick={handlePrev}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">
          {getHijriMonthName(viewMonth)} {viewYear}
        </span>
        <button
          type="button"
          onClick={handleNext}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1'
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="flex">
        {WEEKDAY_HEADERS.map((d) => (
          <div
            key={d}
            className="text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 mt-2">
        {cells.map((day, i) => (
          <div key={i} className="h-9 w-9 text-center text-sm p-0 relative">
            {day !== null ? (
              <button
                type="button"
                onClick={() => handleDayClick(day)}
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'h-9 w-9 p-0 font-normal',
                  isSelected(day) &&
                    'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                  isToday(day) && !isSelected(day) && 'bg-accent text-accent-foreground'
                )}
              >
                {day}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
