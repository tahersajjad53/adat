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
import type { CalendarType, ReminderType, Sabeel, SabeelInput } from '@/types/dues';

interface SabeelFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sabeel?: Sabeel | null;
  onSubmit: (data: SabeelInput) => Promise<void>;
  isLoading?: boolean;
}

const SabeelFormSheet: React.FC<SabeelFormSheetProps> = ({
  open,
  onOpenChange,
  sabeel,
  onSubmit,
  isLoading = false,
}) => {
  const isMobile = useIsMobile();
  const { currentDate } = useCalendar();

  // Form state
  const [calendarType, setCalendarType] = useState<CalendarType>('hijri');
  const [sabeelName, setSabeelName] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [startMonth, setStartMonth] = useState<number>(1);
  const [startYear, setStartYear] = useState<number>(1446);
  const [endMonth, setEndMonth] = useState<number | null>(null);
  const [endYear, setEndYear] = useState<number | null>(null);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [reminderType, setReminderType] = useState<ReminderType>('before_7_days');
  const [reminderDay, setReminderDay] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);

  // Reset form when opening or sabeel changes
  useEffect(() => {
    if (open) {
      if (sabeel) {
        // Editing existing sabeel
        setCalendarType(sabeel.calendar_type);
        setSabeelName(sabeel.sabeel_name);
        setMonthlyAmount(sabeel.monthly_amount.toString());
        setStartMonth(sabeel.start_month);
        setStartYear(sabeel.start_year);
        setEndMonth(sabeel.end_month || null);
        setEndYear(sabeel.end_year || null);
        setHasEndDate(!!sabeel.end_month);
        setReminderType(sabeel.reminder_type);
        setReminderDay(sabeel.reminder_day || null);
        setIsActive(sabeel.is_active);
      } else {
        // Creating new sabeel - set defaults based on current date
        setCalendarType('hijri');
        setSabeelName('');
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
  }, [open, sabeel, currentDate]);

  // Update default dates when calendar type changes
  useEffect(() => {
    if (!sabeel && currentDate) {
      if (calendarType === 'hijri') {
        setStartMonth(currentDate.hijri.month);
        setStartYear(currentDate.hijri.year);
      } else {
        setStartMonth(currentDate.gregorian.getMonth() + 1);
        setStartYear(currentDate.gregorian.getFullYear());
      }
    }
  }, [calendarType, sabeel, currentDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: SabeelInput = {
      sabeel_name: sabeelName.trim(),
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

  const isEditing = !!sabeel;
  const title = isEditing ? 'Edit Sabeel' : 'Add Sabeel';
  const description = isEditing
    ? 'Update your Sabeel details'
    : 'Add a new Sabeel for your family';

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Calendar Type */}
      <CalendarTypeSelector
        value={calendarType}
        onChange={setCalendarType}
        disabled={isLoading}
      />

      {/* Sabeel Name */}
      <div className="space-y-2">
        <Label htmlFor="sabeelName">Sabeel Name</Label>
        <Input
          id="sabeelName"
          value={sabeelName}
          onChange={(e) => setSabeelName(e.target.value)}
          placeholder="e.g., T0046A"
          disabled={isLoading}
          required
        />
      </div>

      {/* Monthly Amount */}
      <div className="space-y-2">
        <Label htmlFor="monthlyAmount">Monthly Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            ₹
          </span>
          <Input
            id="monthlyAmount"
            type="number"
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(e.target.value)}
            placeholder="0"
            className="pl-7"
            disabled={isLoading}
            required
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Start Date */}
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

      {/* End Date Toggle */}
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

      {/* End Date (conditional) */}
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

      {/* Reminder Settings */}
      <ReminderSelector
        calendarType={calendarType}
        reminderType={reminderType}
        reminderDay={reminderDay}
        onReminderTypeChange={setReminderType}
        onReminderDayChange={setReminderDay}
        disabled={isLoading}
      />

      {/* Active Status */}
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
        disabled={isLoading || !sabeelName.trim() || !monthlyAmount}
        className="flex-1"
      >
        {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Add Sabeel'}
      </Button>
    </div>
  );

  // Use Sheet on mobile, Dialog on desktop
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
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

export default SabeelFormSheet;
