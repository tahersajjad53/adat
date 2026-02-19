import React, { useState } from 'react';
import { format, addDays, nextSaturday, nextMonday } from 'date-fns';
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
  /** For one-time goals, we use due_date; for recurring, dueDate is not used by popover (parent handles) */
  isOneTime?: boolean;
}

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
  const { location } = useCalendar();
  const isMobile = useIsMobile();
  const timezone = location?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [open, setOpen] = useState(false);
  const [showRecurrence, setShowRecurrence] = useState(false);
  const [showCustomRecurrence, setShowCustomRecurrence] = useState(false);

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

  const presetOptions = [
    { label: 'Today', date: todayTz, icon: CalendarIcon, right: format(todayTz, 'EEE') },
    { label: 'Tomorrow', date: tomorrowTz, icon: SunLight, right: format(tomorrowTz, 'EEE') },
    { label: 'This weekend', date: weekendTz, icon: Sofa, right: format(weekendTz, 'EEE') },
    { label: 'Next week', date: nextWeekTz, icon: CalendarArrowDown, right: format(nextWeekTz, 'EEE d MMM') },
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

  const selectedDate = date ? new Date(date + 'T12:00:00') : undefined;
  const dayOfWeek = date ? new Date(date + 'T12:00:00').getDay() : 0;
  const dayOfMonth = date ? new Date(date + 'T12:00:00').getDate() : 1;
  const monthOfYear = date ? new Date(date + 'T12:00:00').getMonth() + 1 : 1;

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

  const modalContent = (
    <div className="min-w-[320px] max-h-[70vh] overflow-y-auto">
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
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
          />
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
            // Defer close so parent state from preset/date selection is committed before sheet unmounts
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
            <SheetTitle>{date ? formatDateShort(date) : 'Pick a date'}</SheetTitle>
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
          <DialogTitle>{date ? formatDateShort(date) : 'Pick a date'}</DialogTitle>
        </DialogHeader>
        {modalContent}
      </DialogContent>
    </Dialog>
  );
};

export default DateRecurrenceTimePopover;
