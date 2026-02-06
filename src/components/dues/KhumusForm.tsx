import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { useCalendar } from '@/contexts/CalendarContext';
import type { CalendarType, ReminderType, CalculationType, Khumus, KhumusInput } from '@/types/dues';

interface KhumusFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sabeelId: string;
  khumus?: Khumus | null;
  onSubmit: (data: KhumusInput) => Promise<void>;
  isLoading?: boolean;
}

const KhumusForm: React.FC<KhumusFormProps> = ({
  open,
  onOpenChange,
  sabeelId,
  khumus,
  onSubmit,
  isLoading = false,
}) => {
  const isMobile = useIsMobile();
  const { currentDate } = useCalendar();

  // Form state
  const [personName, setPersonName] = useState('');
  const [calculationType, setCalculationType] = useState<CalculationType>('fixed');
  const [fixedAmount, setFixedAmount] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [percentageRate, setPercentageRate] = useState('20');
  const [calendarType, setCalendarType] = useState<CalendarType>('hijri');
  const [reminderType, setReminderType] = useState<ReminderType>('before_7_days');
  const [reminderDay, setReminderDay] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);

  // Reset form when opening or khumus changes
  useEffect(() => {
    if (open) {
      if (khumus) {
        setPersonName(khumus.person_name);
        setCalculationType(khumus.calculation_type);
        setFixedAmount(khumus.fixed_amount?.toString() || '');
        setMonthlyIncome(khumus.monthly_income?.toString() || '');
        setPercentageRate(khumus.percentage_rate.toString());
        setCalendarType(khumus.calendar_type);
        setReminderType(khumus.reminder_type);
        setReminderDay(khumus.reminder_day || null);
        setIsActive(khumus.is_active);
      } else {
        setPersonName('');
        setCalculationType('fixed');
        setFixedAmount('');
        setMonthlyIncome('');
        setPercentageRate('20');
        setCalendarType('hijri');
        setReminderType('before_7_days');
        setReminderDay(null);
        setIsActive(true);
      }
    }
  }, [open, khumus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: KhumusInput = {
      sabeel_id: sabeelId,
      person_name: personName.trim(),
      calculation_type: calculationType,
      fixed_amount: calculationType === 'fixed' ? parseFloat(fixedAmount) || 0 : null,
      monthly_income: calculationType === 'percentage' ? parseFloat(monthlyIncome) || 0 : null,
      percentage_rate: parseFloat(percentageRate) || 20,
      calendar_type: calendarType,
      reminder_type: reminderType,
      reminder_day: reminderType === 'custom' ? reminderDay : null,
      is_active: isActive,
    };

    await onSubmit(data);
  };

  const calculatedAmount = calculationType === 'percentage'
    ? ((parseFloat(monthlyIncome) || 0) * (parseFloat(percentageRate) || 20)) / 100
    : parseFloat(fixedAmount) || 0;

  const isEditing = !!khumus;
  const title = isEditing ? 'Edit Khumus' : 'Add Khumus';
  const description = isEditing
    ? 'Update Khumus details'
    : 'Add a new Khumus obligation for an individual';

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="personName">Person Name</Label>
        <Input
          id="personName"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          placeholder="Enter name"
          disabled={isLoading}
          required
        />
        <p className="text-xs text-muted-foreground">
          The individual this Khumus is for
        </p>
      </div>

      <div className="space-y-3">
        <Label>Calculation Type</Label>
        <RadioGroup
          value={calculationType}
          onValueChange={(v) => setCalculationType(v as CalculationType)}
          disabled={isLoading}
          className="space-y-2"
        >
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="fixed" id="calc_fixed" />
            <Label htmlFor="calc_fixed" className="text-sm font-normal cursor-pointer">
              Fixed amount
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="percentage" id="calc_percentage" />
            <Label htmlFor="calc_percentage" className="text-sm font-normal cursor-pointer">
              Percentage of income
            </Label>
          </div>
        </RadioGroup>
      </div>

      {calculationType === 'fixed' ? (
        <div className="space-y-2">
          <Label htmlFor="fixedAmount">Monthly Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              ₹
            </span>
            <Input
              id="fixedAmount"
              type="number"
              value={fixedAmount}
              onChange={(e) => setFixedAmount(e.target.value)}
              placeholder="0"
              className="pl-7"
              disabled={isLoading}
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="monthlyIncome">Monthly Income</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="monthlyIncome"
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="0"
                className="pl-7"
                disabled={isLoading}
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="percentageRate">Khumus Rate (%)</Label>
            <div className="relative">
              <Input
                id="percentageRate"
                type="number"
                value={percentageRate}
                onChange={(e) => setPercentageRate(e.target.value)}
                placeholder="20"
                disabled={isLoading}
                min="0"
                max="100"
                step="0.1"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                %
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Standard Khumus rate is 20%
            </p>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Calculated amount:</span>
              <span className="font-semibold">₹{calculatedAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </>
      )}

      <CalendarTypeSelector
        value={calendarType}
        onChange={setCalendarType}
        disabled={isLoading}
      />

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

  const isFormValid = personName.trim() && (
    calculationType === 'fixed' ? fixedAmount : monthlyIncome
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
        disabled={isLoading || !isFormValid}
        className="flex-1"
      >
        {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Add Khumus'}
      </Button>
    </div>
  );

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

export default KhumusForm;
