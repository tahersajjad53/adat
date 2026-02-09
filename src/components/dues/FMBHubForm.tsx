import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CalendarTypeSelector from './CalendarTypeSelector';
import ReminderSelector from './ReminderSelector';
import { getMonthOptions, getYearOptions } from '@/lib/calendarUtils';
import { useCalendar } from '@/contexts/CalendarContext';
import type { CalendarType, ReminderType, FMBHub, FMBHubInput } from '@/types/dues';

interface FMBHubFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sabeelId: string;
  fmbHub?: FMBHub | null;
  onSubmit: (data: FMBHubInput) => Promise<void>;
  isLoading?: boolean;
}

const FMBHubForm: React.FC<FMBHubFormProps> = ({
  open,
  onOpenChange,
  sabeelId,
  fmbHub,
  onSubmit,
  isLoading = false,
}) => {
  const isMobile = useIsMobile();
  const { currentDate } = useCalendar();

  // Form state
  const [calendarType, setCalendarType] = useState<CalendarType>('hijri');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [startMonth, setStartMonth] = useState<number>(1);
  const [startYear, setStartYear] = useState<number>(1446);
  const [endMonth, setEndMonth] = useState<number | null>(null);
  const [endYear, setEndYear] = useState<number | null>(null);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [reminderType, setReminderType] = useState<ReminderType>('before_7_days');
  const [reminderDay, setReminderDay] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);

  // Reset form when opening or fmbHub changes
  useEffect(() => {
    if (open) {
      if (fmbHub) {
        setCalendarType(fmbHub.calendar_type);
        setMonthlyAmount(fmbHub.monthly_amount.toString());
        setStartMonth(fmbHub.start_month);
        setStartYear(fmbHub.start_year);
        setEndMonth(fmbHub.end_month || null);
        setEndYear(fmbHub.end_year || null);
        setHasEndDate(!!fmbHub.end_month);
        setReminderType(fmbHub.reminder_type);
        setReminderDay(fmbHub.reminder_day || null);
        setIsActive(fmbHub.is_active);
      } else {
        setCalendarType('hijri');
        setMonthlyAmount('');
        setStartMonth(currentDate?.hijri.month || 1);
        setStartYear(currentDate?.hijri.year || 1446);
        setEndMonth(null);
        setEndYear(null);
        setHasEndDate(false);
        setReminderType('before_7_days');
        setReminderDay(null);
        setIsActive(true);
      }
    }
  }, [open, fmbHub, currentDate]);

  useEffect(() => {
    if (!fmbHub && currentDate) {
      if (calendarType === 'hijri') {
        setStartMonth(currentDate.hijri.month);
        setStartYear(currentDate.hijri.year);
      } else {
        setStartMonth(currentDate.gregorian.getMonth() + 1);
        setStartYear(currentDate.gregorian.getFullYear());
      }
    }
  }, [calendarType, fmbHub, currentDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: FMBHubInput = {
      sabeel_id: sabeelId,
      monthly_amount: parseFloat(monthlyAmount) || 0,
      calendar_type: calendarType,
      start_month: startMonth,
      start_year: startYear,
      end_month: hasEndDate ? endMonth : null,
      end_year: hasEndDate ? endYear : null,
      reminder_type: reminderType,
      reminder_day: reminderType === 'custom' ? reminderDay : null,
      is_active: isActive,
    };

    await onSubmit(data);
  };

  const monthOptions = getMonthOptions(calendarType);
  const yearOptions = currentDate
    ? getYearOptions(calendarType, currentDate.hijri, currentDate.gregorian)
    : [];

  const isEditing = !!fmbHub;
  const title = isEditing ? 'Edit FMB Hub' : 'Add FMB Hub';
  const description = isEditing
    ? 'Update your FMB Hub contribution'
    : 'Configure your FMB Hub contribution for this Sabeel';

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CalendarTypeSelector
        value={calendarType}
        onChange={setCalendarType}
        disabled={isLoading}
      />

      <div className="space-y-2">
        <Label htmlFor="monthlyAmount">Monthly Contribution</Label>
        <Input
          id="monthlyAmount"
          type="number"
          value={monthlyAmount}
          onChange={(e) => setMonthlyAmount(e.target.value)}
          placeholder="0"
          disabled={isLoading}
          required
          min="0"
          step="0.01"
        />
      </div>

      <div className="space-y-2">
        <Label>Start Date</Label>
        <div className="grid grid-cols-2 gap-3">
          <Select
            value={startMonth.toString()}
            onValueChange={(v) => setStartMonth(parseInt(v, 10))}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value.toString()}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={startYear.toString()}
            onValueChange={(v) => setStartYear(parseInt(v, 10))}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value.toString()}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="hasEndDate" className="cursor-pointer">
          Set end date
        </Label>
        <Switch
          id="hasEndDate"
          checked={hasEndDate}
          onCheckedChange={setHasEndDate}
          disabled={isLoading}
        />
      </div>

      {hasEndDate && (
        <div className="space-y-2">
          <Label>End Date</Label>
          <div className="grid grid-cols-2 gap-3">
            <Select
              value={endMonth?.toString() || ''}
              onValueChange={(v) => setEndMonth(parseInt(v, 10))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={endYear?.toString() || ''}
              onValueChange={(v) => setEndYear(parseInt(v, 10))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <ReminderSelector
        calendarType={calendarType}
        reminderType={reminderType}
        reminderDay={reminderDay}
        onReminderTypeChange={setReminderType}
        onReminderDayChange={setReminderDay}
        disabled={isLoading}
      />

      {isEditing && (
        <div className="flex items-center justify-between">
          <Label htmlFor="isActive" className="cursor-pointer">
            Active
          </Label>
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={setIsActive}
            disabled={isLoading}
          />
        </div>
      )}
    </form>
  );

  const footer = (
    <div className="flex gap-3">
      <Button
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isLoading}
        className="flex-1"
      >
        Cancel
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={isLoading || !monthlyAmount}
        className="flex-1"
      >
        {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Add FMB Hub'}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <div className="py-4">{formContent}</div>
          <SheetFooter>{footer}</SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-2">{formContent}</div>
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FMBHubForm;
