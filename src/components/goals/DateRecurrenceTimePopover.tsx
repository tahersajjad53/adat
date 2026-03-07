import React, { useState } from 'react';
import { format, addDays, nextSaturday, nextMonday } from 'date-fns';
import { gregorianToBohra, formatHijriDate } from '@/lib/hijri';
import {
  Calendar as CalendarIcon,
  SunLight,
  Sofa,
  CalendarArrowDown,
  Slash,
  Clock,
  Repeat,
} from 'iconoir-react';
import { useCalendar } from '@/contexts/CalendarContext';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import TimePicker from './TimePicker';
import RecurrenceSelector from './RecurrenceSelector';
import HijriCalendarGrid from './HijriCalendarGrid';
import type { RecurrenceType, RecurrencePattern } from '@/types/goals';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDateShort(dateStr: string): string {
  if (!dateStr) return 'No date';
  const d = new Date(dateStr + 'T12:00:00');
  return format(d, 'd MMM yyyy');
}

function formatRecurrenceSummary(
  recurrenceType: RecurrenceType,
  recurrenceDays: number[],
  recurrencePattern: RecurrencePattern | null,
): string {
  if (recurrenceType === 'daily') return 'Every day';
  if (recurrenceType === 'weekly') {
    if (recurrenceDays.length === 0) return 'Every week';
    return 'Every week on ' + recurrenceDays.map((d) => DAY_NAMES[d]).join(', ');
  }
  if (recurrenceType === 'one-time') return 'One-time';
  if (recurrenceType === 'annual' && recurrencePattern?.type === 'annual') {
    const monthNames = recurrencePattern.calendarType === 'gregorian' ? MONTH_NAMES : HIJRI_MONTH_NAMES;
    const month = monthNames[(recurrencePattern.annualMonth ?? 1) - 1] ?? '';
    const day = recurrencePattern.monthlyDay ?? 1;
    return `Every year on ${day} ${month}`;
  }
  if (recurrenceType === 'annual') return 'Annual';
  if (recurrenceType === 'custom' && recurrencePattern?.type === 'interval') {
    const n = recurrencePattern.interval ?? 2;
    const u = recurrencePattern.intervalUnit ?? 'days';
    return `Every ${n} ${u}`;
  }
  if (recurrenceType === 'custom' && recurrencePattern?.type === 'monthly') {
    return `Every month on the ${recurrencePattern.monthlyDay ?? 1}${getOrdinal(recurrencePattern.monthlyDay ?? 1)}`;
  }
  return 'Custom';
}

const HIJRI_MONTH_NAMES = [
  'Muharram', 'Safar', 'Rabi I', 'Rabi II', 'Jumada I', 'Jumada II',
  'Rajab', 'Shabaan', 'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah',
];

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export interface DateRecurrenceTimePopoverProps {
  date: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
  recurrenceType: RecurrenceType;
  recurrenceDays: number[];
  recurrencePattern: RecurrencePattern | null;
  onRecurrenceTypeChange: (type: RecurrenceType) => void;
  onRecurrenceDaysChange: (days: number[]) => void;
  onRecurrencePatternChange: (pattern: RecurrencePattern | null) => void;
  preferredTime: string | null;
  onPreferredTimeChange: (time: string | null) => void;
  disabled?: boolean;
  isOneTime?: boolean;
}

type CalendarMode = 'gregorian' | 'hijri';

const DateRecurrenceTimePopover: React.FC<DateRecurrenceTimePopoverProps> = ({
  date,
  onDateChange,
  recurrenceType,
  recurrenceDays,
  recurrencePattern,
  onRecurrenceTypeChange,
  onRecurrenceDaysChange,
  onRecurrencePatternChange,
  preferredTime,
  onPreferredTimeChange,
  disabled = false,
  isOneTime = false,
}) => {
  const { location, currentDate: calendarDate } = useCalendar();
  const isMobile = useIsMobile();
  const timezone = location?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [open, setOpen] = useState(false);
  const [showRecurrence, setShowRecurrence] = useState(false);
  const [showCustomRecurrence, setShowCustomRecurrence] = useState(false);
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('gregorian');

  const getTodayInTz = (): Date => {
    const opts: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    const parts = new Intl.DateTimeFormat('en-CA', opts).formatToParts(new Date());
    const y = parts.find((p) => p.type === 'year')?.value ?? '';
    const m = parts.find((p) => p.type === 'month')?.value ?? '';
    const d = parts.find((p) => p.type === 'day')?.value ?? '';
    return new Date(`${y}-${m}-${d}T12:00:00`);
  };

  const todayTz = getTodayInTz();
  const tomorrowTz = addDays(todayTz, 1);
  const weekendTz = nextSaturday(todayTz);
  const nextWeekTz = nextMonday(todayTz);

  const toYMD = (d: Date) => format(d, 'yyyy-MM-dd');

  // Get today's Hijri (Maghrib-aware) for display
  const todayHijri = calendarDate?.hijri ?? gregorianToBohra(todayTz, timezone);
  const tomorrowHijri = calendarDate
    ? gregorianToBohra(tomorrowTz, timezone)
    : gregorianToBohra(tomorrowTz, timezone);
  // If after Maghrib, tomorrow's Hijri is advanced too
  const tomorrowHijriDisplay = calendarDate?.isAfterMaghrib
    ? (() => {
        const h = gregorianToBohra(tomorrowTz, timezone);
        return { ...h, day: h.day + 1 > 30 ? 1 : h.day + 1, monthName: h.monthName };
        // Simplified — use proper advance
      })()
    : tomorrowHijri;

  const formatHijriShort = (h: { day: number; monthName: string }) =>
    `${h.day} ${h.monthName}`;

  // Preset right-side labels depend on calendar mode
  const getPresetRight = (gregDate: Date) => {
    if (calendarMode === 'hijri') {
      const h = gregorianToBohra(gregDate, timezone);
      // If after Maghrib, advance the Hijri day for display
      if (calendarDate?.isAfterMaghrib && toYMD(gregDate) === toYMD(todayTz)) {
        return formatHijriShort(todayHijri);
      }
      return formatHijriShort(h);
    }
    return format(gregDate, 'EEE');
  };

  const getNextWeekRight = (gregDate: Date) => {
    if (calendarMode === 'hijri') {
      const h = gregorianToBohra(gregDate, timezone);
      return formatHijriShort(h);
    }
    return format(gregDate, 'EEE d MMM');
  };

  const presetOptions = [
    { label: 'Today', date: todayTz, icon: CalendarIcon, right: getPresetRight(todayTz) },
    { label: 'Tomorrow', date: tomorrowTz, icon: SunLight, right: getPresetRight(tomorrowTz) },
    { label: 'This weekend', date: weekendTz, icon: Sofa, right: getPresetRight(weekendTz) },
    { label: 'Next week', date: nextWeekTz, icon: CalendarArrowDown, right: getNextWeekRight(nextWeekTz) },
  ];

  const handlePreset = (newDate: string | null) => {
    if (newDate) {
      onDateChange(newDate);
    } else {
      if (isOneTime) {
        onDateChange('');
      }
      setOpen(false);
    }
  };

  const handleRecurrencePreset = (
    type: RecurrenceType,
    days?: number[],
    pattern?: RecurrencePattern | null,
  ) => {
    onRecurrenceTypeChange(type);
    if (days) onRecurrenceDaysChange(days);
    if (pattern !== undefined) onRecurrencePatternChange(pattern);
    setShowCustomRecurrence(type === 'custom');
  };

  const handleDateSelect = (d: Date | undefined) => {
    if (d) onDateChange(toYMD(d));
  };

  const handleHijriDateSelect = (dateStr: string) => {
    onDateChange(dateStr);
  };

  const selectedDate = date ? new Date(date + 'T12:00:00') : undefined;
  const dayOfWeek = date ? new Date(date + 'T12:00:00').getDay() : 0;
  const dayOfMonth = date ? new Date(date + 'T12:00:00').getDate() : 1;
  const monthOfYear = date ? new Date(date + 'T12:00:00').getMonth() + 1 : 1;
  const hijriDate = date ? gregorianToBohra(new Date(date + 'T12:00:00'), timezone) : null;

  // Default calendar type for recurrence presets based on mode
  const defaultCalType = calendarMode === 'hijri' ? 'hijri' : 'gregorian';

  const recurrencePresets = [
    { label: 'Off', onClick: () => handleRecurrencePreset('one-time') },
    { label: 'Every day', onClick: () => handleRecurrencePreset('daily') },
    {
      label: `Every week on ${DAY_NAMES[dayOfWeek]}`,
      onClick: () => handleRecurrencePreset('weekly', [dayOfWeek]),
    },
    {
      label: 'Every weekday (Mon–Fri)',
      onClick: () => handleRecurrencePreset('weekly', [1, 2, 3, 4, 5]),
    },
    // Gregorian monthly/annual
    ...(calendarMode === 'gregorian' ? [
      {
        label: `Every month on the ${dayOfMonth}${getOrdinal(dayOfMonth)}`,
        onClick: () =>
          handleRecurrencePreset('custom', undefined, {
            type: 'monthly',
            monthlyDay: dayOfMonth,
            calendarType: 'gregorian',
          }),
      },
      {
        label: `Every year on ${dayOfMonth} ${MONTH_NAMES[monthOfYear - 1]}`,
        onClick: () =>
          handleRecurrencePreset('annual', undefined, {
            type: 'annual',
            annualMonth: monthOfYear,
            monthlyDay: dayOfMonth,
            calendarType: 'gregorian',
          }),
      },
    ] : []),
    // Hijri monthly/annual
    ...(hijriDate ? [
      {
        label: `Every month on ${hijriDate.day} ${hijriDate.monthName} (Hijri)`,
        onClick: () =>
          handleRecurrencePreset('custom', undefined, {
            type: 'monthly',
            monthlyDay: hijriDate.day,
            calendarType: 'hijri',
          }),
      },
      {
        label: `Every year on ${hijriDate.day} ${hijriDate.monthName} (Hijri)`,
        onClick: () =>
          handleRecurrencePreset('annual', undefined, {
            type: 'annual',
            annualMonth: hijriDate.month,
            monthlyDay: hijriDate.day,
            calendarType: 'hijri',
          }),
      },
    ] : []),
  ];

  const formatTimeDisplay = (hhmm: string | null) => {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const triggerLabel = date
    ? `${formatDateShort(date)}${preferredTime ? ` at ${formatTimeDisplay(preferredTime)}` : ''} · ${formatRecurrenceSummary(recurrenceType, recurrenceDays, recurrencePattern)}`
    : 'Add date';

  const triggerButton = (
    <button
      type="button"
      disabled={disabled}
      className="flex items-center min-h-9 w-full text-left text-sm hover:bg-accent/50 rounded-md px-2 py-1.5 -mx-2 transition-colors"
    >
      <span className={date ? 'text-foreground' : 'text-muted-foreground'}>{triggerLabel}</span>
    </button>
  );

  // Header: show the alternate calendar as subtitle
  const headerTitle = date
    ? calendarMode === 'hijri' && hijriDate
      ? formatHijriDate(hijriDate, 'long') + ' H'
      : formatDateShort(date)
    : 'Pick a date';

  const headerSubtitle = date
    ? calendarMode === 'hijri'
      ? formatDateShort(date)
      : hijriDate
        ? formatHijriDate(hijriDate, 'long') + ' H'
        : null
    : null;

  const calendarToggle = (
    <div className="flex items-center bg-muted rounded-lg p-0.5 mx-2 mb-2">
      <button
        type="button"
        onClick={() => setCalendarMode('gregorian')}
        className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition-colors ${
          calendarMode === 'gregorian'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Gregorian
      </button>
      <button
        type="button"
        onClick={() => setCalendarMode('hijri')}
        className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition-colors ${
          calendarMode === 'hijri'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Hijri
      </button>
    </div>
  );

  const modalContent = (
    <div className="min-w-[320px] max-h-[70vh] overflow-y-auto">
      {/* Calendar mode toggle */}
      {calendarToggle}

      {/* Date presets */}
      <div className="px-2 py-2 space-y-0.5">
        {presetOptions.map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => handlePreset(toYMD(opt.date))}
            className="flex items-center gap-3 w-full px-2 py-2 text-sm hover:bg-accent rounded-md"
          >
            <opt.icon className="size-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 text-left">{opt.label}</span>
            <span className="text-muted-foreground text-xs">{opt.right}</span>
          </button>
        ))}
        {isOneTime && (
          <button
            type="button"
            onClick={() => handlePreset(null)}
            className="flex items-center gap-3 w-full px-2 py-2 text-sm hover:bg-accent rounded-md"
          >
            <Slash className="size-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 text-left">No date</span>
          </button>
        )}
      </div>

      {/* Calendar */}
      <div className="border-t px-4 py-3 w-full flex justify-center">
        <div className="w-fit">
          {calendarMode === 'gregorian' ? (
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
            />
          ) : (
            <HijriCalendarGrid
              selected={date}
              todayHijri={todayHijri}
              onSelect={handleHijriDateSelect}
              timezone={timezone}
            />
          )}
        </div>
      </div>

      {/* Time */}
      <div className="border-t px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Time</span>
        </div>
        <TimePicker
          value={preferredTime}
          onChange={onPreferredTimeChange}
          disabled={disabled}
          placeholder="Add time"
        />
      </div>

      {/* Repeat */}
      <div className="border-t px-4 py-3">
        <button
          type="button"
          onClick={() => setShowRecurrence(!showRecurrence)}
          className="flex items-center gap-2 w-full text-left mb-2"
        >
          <Repeat className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Repeat</span>
        </button>
        {showRecurrence && (
          <div className="space-y-1">
            {recurrencePresets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={p.onClick}
                className="block w-full px-2 py-1.5 text-sm text-left hover:bg-accent rounded-md"
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setShowCustomRecurrence(true);
                if (recurrenceType !== 'weekly' && recurrenceType !== 'custom' && recurrenceType !== 'annual') {
                  onRecurrenceTypeChange('weekly');
                  onRecurrenceDaysChange([]);
                }
              }}
              className="block w-full px-2 py-1.5 text-sm text-left hover:bg-accent rounded-md"
            >
              Custom...
            </button>
            {showCustomRecurrence && (
              <div className="mt-3 pt-3 border-t">
                <RecurrenceSelector
                  variant="custom"
                  recurrenceType={recurrenceType}
                  recurrenceDays={recurrenceDays}
                  recurrencePattern={recurrencePattern}
                  dueDate={date}
                  onRecurrenceTypeChange={onRecurrenceTypeChange}
                  onRecurrenceDaysChange={onRecurrenceDaysChange}
                  onRecurrencePatternChange={onRecurrencePatternChange}
                  onDueDateChange={onDateChange}
                  disabled={disabled}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t pt-4 pb-2">
        <Button
          variant="default"
          className="w-full"
          onClick={() => {
            setTimeout(() => setOpen(false), 0);
          }}
        >
          Done
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{triggerButton}</SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle>{headerTitle}</SheetTitle>
            {headerSubtitle && (
              <p className="text-sm text-muted-foreground">{headerSubtitle}</p>
            )}
          </SheetHeader>
          <div className="py-4">{modalContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle>{headerTitle}</DialogTitle>
          {headerSubtitle && (
            <p className="text-sm text-muted-foreground">{headerSubtitle}</p>
          )}
        </DialogHeader>
        {modalContent}
      </DialogContent>
    </Dialog>
  );
};

export default DateRecurrenceTimePopover;
