import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getDayOptions } from '@/lib/calendarUtils';
import type { CalendarType, ReminderType } from '@/types/dues';

interface ReminderSelectorProps {
  calendarType: CalendarType;
  reminderType: ReminderType;
  reminderDay?: number | null;
  onReminderTypeChange: (type: ReminderType) => void;
  onReminderDayChange: (day: number | null) => void;
  disabled?: boolean;
}

const ReminderSelector: React.FC<ReminderSelectorProps> = ({
  calendarType,
  reminderType,
  reminderDay,
  onReminderTypeChange,
  onReminderDayChange,
  disabled = false,
}) => {
  const dayOptions = getDayOptions(calendarType);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Reminder</Label>
      <RadioGroup
        value={reminderType}
        onValueChange={(value) => onReminderTypeChange(value as ReminderType)}
        disabled={disabled}
        className="space-y-2"
      >
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="before_7_days" id="before_7_days" />
          <Label
            htmlFor="before_7_days"
            className="text-sm font-normal cursor-pointer"
          >
            7 days before month end
          </Label>
        </div>

        <div className="flex items-center space-x-3">
          <RadioGroupItem value="last_day" id="last_day" />
          <Label
            htmlFor="last_day"
            className="text-sm font-normal cursor-pointer"
          >
            Last day of month
          </Label>
        </div>

        <div className="flex items-center space-x-3">
          <RadioGroupItem value="custom" id="custom" />
          <Label
            htmlFor="custom"
            className="text-sm font-normal cursor-pointer"
          >
            Custom day
          </Label>
        </div>
      </RadioGroup>

      {reminderType === 'custom' && (
        <div className="ml-6 mt-2">
          <Select
            value={reminderDay?.toString() || ''}
            onValueChange={(value) => onReminderDayChange(parseInt(value, 10))}
            disabled={disabled}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Day" />
            </SelectTrigger>
            <SelectContent>
              {dayOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Remind on day {reminderDay || '...'} of each{' '}
            {calendarType === 'hijri' ? 'Hijri' : 'Gregorian'} month
          </p>
        </div>
      )}
    </div>
  );
};

export default ReminderSelector;
