import React from 'react';
import { Calendar, Repeat } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import CondensedAttributeRow from './CondensedAttributeRow';
import type { RecurrenceType, RecurrencePattern } from '@/types/goals';

interface RecurrenceSelectorProps {
  recurrenceType: RecurrenceType;
  recurrenceDays: number[];
  recurrencePattern: RecurrencePattern | null;
  dueDate: string;
  onRecurrenceTypeChange: (type: RecurrenceType) => void;
  onRecurrenceDaysChange: (days: number[]) => void;
  onRecurrencePatternChange: (pattern: RecurrencePattern | null) => void;
  onDueDateChange: (date: string) => void;
  disabled?: boolean;
}

const DAY_LABELS = [
  { value: '0', label: 'S' },
  { value: '1', label: 'M' },
  { value: '2', label: 'T' },
  { value: '3', label: 'W' },
  { value: '4', label: 'T' },
  { value: '5', label: 'F' },
  { value: '6', label: 'S' },
];

const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi I', 'Rabi II', 'Jumada I', 'Jumada II',
  'Rajab', 'Shabaan', 'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah',
];

const GREGORIAN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  recurrenceType,
  recurrenceDays,
  recurrencePattern,
  dueDate,
  onRecurrenceTypeChange,
  onRecurrenceDaysChange,
  onRecurrencePatternChange,
  onDueDateChange,
  disabled = false,
}) => {
  const handleIntervalChange = (value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1) return;
    onRecurrencePatternChange({
      type: 'interval',
      interval: num,
      intervalUnit: recurrencePattern?.intervalUnit || 'days',
    });
  };

  const handleIntervalUnitChange = (unit: 'days' | 'weeks') => {
    onRecurrencePatternChange({
      type: 'interval',
      interval: recurrencePattern?.interval || 2,
      intervalUnit: unit,
    });
  };

  const handleMonthlyDayChange = (value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1 || num > 30) return;
    onRecurrencePatternChange({
      type: 'monthly',
      monthlyDay: num,
      calendarType: recurrencePattern?.calendarType || 'hijri',
    });
  };

  const handleMonthlyCalendarChange = (cal: 'hijri' | 'gregorian') => {
    onRecurrencePatternChange({
      type: 'monthly',
      monthlyDay: recurrencePattern?.monthlyDay || 1,
      calendarType: cal,
    });
  };

  const handleCustomTypeChange = (type: 'interval' | 'monthly') => {
    if (type === 'interval') {
      onRecurrencePatternChange({
        type: 'interval',
        interval: 2,
        intervalUnit: 'days',
      });
    } else {
      onRecurrencePatternChange({
        type: 'monthly',
        monthlyDay: 1,
        calendarType: 'hijri',
      });
    }
  };

  const handleAnnualCalendarChange = (cal: 'hijri' | 'gregorian') => {
    onRecurrencePatternChange({
      type: 'annual',
      annualMonth: recurrencePattern?.annualMonth || 1,
      monthlyDay: recurrencePattern?.monthlyDay || 1,
      calendarType: cal,
    });
  };

  const handleAnnualMonthChange = (month: string) => {
    onRecurrencePatternChange({
      type: 'annual',
      annualMonth: parseInt(month, 10),
      monthlyDay: recurrencePattern?.monthlyDay || 1,
      calendarType: recurrencePattern?.calendarType || 'hijri',
    });
  };

  const handleAnnualDayChange = (value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1 || num > 30) return;
    onRecurrencePatternChange({
      type: 'annual',
      annualMonth: recurrencePattern?.annualMonth || 1,
      monthlyDay: num,
      calendarType: recurrencePattern?.calendarType || 'hijri',
    });
  };

  return (
    <div className="space-y-2">
      <CondensedAttributeRow icon={<Repeat className="size-4" />}>
        <Select
          value={recurrenceType}
          onValueChange={(v) => onRecurrenceTypeChange(v as RecurrenceType)}
          disabled={disabled}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Repeats" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
            <SelectItem value="one-time">One-time</SelectItem>
            <SelectItem value="annual">Annual</SelectItem>
          </SelectContent>
        </Select>
      </CondensedAttributeRow>

      {recurrenceType === 'weekly' && (
        <CondensedAttributeRow icon={<Repeat className="size-4" />} label="On days">
          <ToggleGroup
            type="multiple"
            value={recurrenceDays.map(String)}
            onValueChange={(vals) => onRecurrenceDaysChange(vals.map(Number))}
            className="justify-start gap-1"
            disabled={disabled}
          >
            {DAY_LABELS.map((day) => (
              <ToggleGroupItem
                key={day.value}
                value={day.value}
                className="h-8 w-8 rounded-full text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                aria-label={day.label}
              >
                {day.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CondensedAttributeRow>
      )}

      {recurrenceType === 'custom' && (
        <>
          <CondensedAttributeRow icon={<Repeat className="size-4" />} label="Pattern">
            <Select
              value={recurrencePattern?.type || 'interval'}
              onValueChange={(v) => handleCustomTypeChange(v as 'interval' | 'monthly')}
              disabled={disabled}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interval">Every N days/weeks</SelectItem>
                <SelectItem value="monthly">Day of month</SelectItem>
              </SelectContent>
            </Select>
          </CondensedAttributeRow>

          {recurrencePattern?.type === 'interval' && (
            <CondensedAttributeRow icon={<Repeat className="size-4" />}>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground shrink-0">Every</span>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={recurrencePattern.interval || 2}
                  onChange={(e) => handleIntervalChange(e.target.value)}
                  className="h-9 w-20"
                  disabled={disabled}
                />
                <Select
                  value={recurrencePattern.intervalUnit || 'days'}
                  onValueChange={(v) => handleIntervalUnitChange(v as 'days' | 'weeks')}
                  disabled={disabled}
                >
                  <SelectTrigger className="h-9 w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">days</SelectItem>
                    <SelectItem value="weeks">weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CondensedAttributeRow>
          )}

          {recurrencePattern?.type === 'monthly' && (
            <>
              <CondensedAttributeRow icon={<Repeat className="size-4" />}>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground shrink-0">Day</span>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={recurrencePattern.monthlyDay || 1}
                    onChange={(e) => handleMonthlyDayChange(e.target.value)}
                    className="h-9 w-20"
                    disabled={disabled}
                  />
                  <span className="text-sm text-muted-foreground shrink-0">of each month</span>
                </div>
              </CondensedAttributeRow>
              <CondensedAttributeRow icon={<Repeat className="size-4" />} label="Calendar">
                <Select
                  value={recurrencePattern.calendarType || 'hijri'}
                  onValueChange={(v) => handleMonthlyCalendarChange(v as 'hijri' | 'gregorian')}
                  disabled={disabled}
                >
                  <SelectTrigger className="h-9 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hijri">Hijri</SelectItem>
                    <SelectItem value="gregorian">Gregorian</SelectItem>
                  </SelectContent>
                </Select>
              </CondensedAttributeRow>
            </>
          )}
        </>
      )}

      {recurrenceType === 'annual' && (
        <>
          <CondensedAttributeRow icon={<Repeat className="size-4" />} label="Calendar">
            <Select
              value={recurrencePattern?.calendarType || 'hijri'}
              onValueChange={(v) => handleAnnualCalendarChange(v as 'hijri' | 'gregorian')}
              disabled={disabled}
            >
              <SelectTrigger className="h-9 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hijri">Hijri</SelectItem>
                <SelectItem value="gregorian">Gregorian</SelectItem>
              </SelectContent>
            </Select>
          </CondensedAttributeRow>
          <CondensedAttributeRow icon={<Repeat className="size-4" />} label="Month">
            <Select
              value={String(recurrencePattern?.annualMonth || 1)}
              onValueChange={handleAnnualMonthChange}
              disabled={disabled}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {((recurrencePattern?.calendarType || 'hijri') === 'hijri' ? HIJRI_MONTHS : GREGORIAN_MONTHS).map((name, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CondensedAttributeRow>
          <CondensedAttributeRow icon={<Repeat className="size-4" />} label="Day">
            <Input
              type="number"
              min="1"
              max="30"
              value={recurrencePattern?.monthlyDay || 1}
              onChange={(e) => handleAnnualDayChange(e.target.value)}
              className="h-9 w-20"
              disabled={disabled}
            />
          </CondensedAttributeRow>
        </>
      )}

      {recurrenceType === 'one-time' && (
        <CondensedAttributeRow icon={<Calendar className="size-4" />} label="Due date">
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => onDueDateChange(e.target.value)}
            disabled={disabled}
            className="h-9 overflow-hidden"
          />
        </CondensedAttributeRow>
      )}
    </div>
  );
};

export default RecurrenceSelector;
