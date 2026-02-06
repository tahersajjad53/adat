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
import type { CalendarType, ReminderType, ZakatCalculationType, Zakat, ZakatInput } from '@/types/dues';

interface ZakatFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sabeelId: string;
  zakat?: Zakat | null;
  onSubmit: (data: ZakatInput) => Promise<void>;
  isLoading?: boolean;
}

const ZakatForm: React.FC<ZakatFormProps> = ({
  open,
  onOpenChange,
  sabeelId,
  zakat,
  onSubmit,
  isLoading = false,
}) => {
  const isMobile = useIsMobile();
  const { currentDate } = useCalendar();

  // Form state
  const [personName, setPersonName] = useState('');
  const [calculationType, setCalculationType] = useState<ZakatCalculationType>('fixed');
  const [fixedAmount, setFixedAmount] = useState('');
  const [assetsValue, setAssetsValue] = useState('');
  const [nisabThreshold, setNisabThreshold] = useState('');
  const [zakatRate, setZakatRate] = useState('2.5');
  const [calendarType, setCalendarType] = useState<CalendarType>('hijri');
  const [reminderType, setReminderType] = useState<ReminderType>('before_7_days');
  const [reminderDay, setReminderDay] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);

  // Reset form when opening or zakat changes
  useEffect(() => {
    if (open) {
      if (zakat) {
        setPersonName(zakat.person_name);
        setCalculationType(zakat.calculation_type);
        setFixedAmount(zakat.fixed_amount?.toString() || '');
        setAssetsValue(zakat.assets_value?.toString() || '');
        setNisabThreshold(zakat.nisab_threshold?.toString() || '');
        setZakatRate(zakat.zakat_rate.toString());
        setCalendarType(zakat.calendar_type);
        setReminderType(zakat.reminder_type);
        setReminderDay(zakat.reminder_day || null);
        setIsActive(zakat.is_active);
      } else {
        setPersonName('');
        setCalculationType('fixed');
        setFixedAmount('');
        setAssetsValue('');
        setNisabThreshold('');
        setZakatRate('2.5');
        setCalendarType('hijri');
        setReminderType('before_7_days');
        setReminderDay(null);
        setIsActive(true);
      }
    }
  }, [open, zakat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: ZakatInput = {
      sabeel_id: sabeelId,
      person_name: personName.trim(),
      calculation_type: calculationType,
      fixed_amount: calculationType === 'fixed' ? parseFloat(fixedAmount) || 0 : null,
      assets_value: calculationType === 'nisab_based' ? parseFloat(assetsValue) || 0 : null,
      nisab_threshold: calculationType === 'nisab_based' ? parseFloat(nisabThreshold) || 0 : null,
      zakat_rate: parseFloat(zakatRate) || 2.5,
      calendar_type: calendarType,
      reminder_type: reminderType,
      reminder_day: reminderType === 'custom' ? reminderDay : null,
      is_active: isActive,
    };

    await onSubmit(data);
  };

  const assets = parseFloat(assetsValue) || 0;
  const nisab = parseFloat(nisabThreshold) || 0;
  const rate = parseFloat(zakatRate) || 2.5;
  const isAboveNisab = assets >= nisab && nisab > 0;
  const calculatedAmount = calculationType === 'nisab_based' && isAboveNisab
    ? (assets * rate) / 100
    : calculationType === 'fixed'
    ? parseFloat(fixedAmount) || 0
    : 0;

  const isEditing = !!zakat;
  const title = isEditing ? 'Edit Zakat' : 'Add Zakat';
  const description = isEditing
    ? 'Update Zakat details'
    : 'Add a new Zakat obligation for an individual';

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
          The individual this Zakat is for
        </p>
      </div>

      <div className="space-y-3">
        <Label>Calculation Type</Label>
        <RadioGroup
          value={calculationType}
          onValueChange={(v) => setCalculationType(v as ZakatCalculationType)}
          disabled={isLoading}
          className="space-y-2"
        >
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="fixed" id="zakat_fixed" />
            <Label htmlFor="zakat_fixed" className="text-sm font-normal cursor-pointer">
              Fixed amount
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="nisab_based" id="zakat_nisab" />
            <Label htmlFor="zakat_nisab" className="text-sm font-normal cursor-pointer">
              Nisab-based calculation
            </Label>
          </div>
        </RadioGroup>
      </div>

      {calculationType === 'fixed' ? (
        <div className="space-y-2">
          <Label htmlFor="fixedAmount">Annual Zakat Amount</Label>
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
            <Label htmlFor="assetsValue">Total Assets Value</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="assetsValue"
                type="number"
                value={assetsValue}
                onChange={(e) => setAssetsValue(e.target.value)}
                placeholder="0"
                className="pl-7"
                disabled={isLoading}
                required
                min="0"
                step="0.01"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Total value of zakatable assets
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nisabThreshold">Nisab Threshold</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="nisabThreshold"
                type="number"
                value={nisabThreshold}
                onChange={(e) => setNisabThreshold(e.target.value)}
                placeholder="0"
                className="pl-7"
                disabled={isLoading}
                required
                min="0"
                step="0.01"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum wealth threshold for Zakat obligation
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zakatRate">Zakat Rate (%)</Label>
            <div className="relative">
              <Input
                id="zakatRate"
                type="number"
                value={zakatRate}
                onChange={(e) => setZakatRate(e.target.value)}
                placeholder="2.5"
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
              Standard Zakat rate is 2.5%
            </p>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg space-y-1">
            {nisab > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className={isAboveNisab ? 'text-primary font-medium' : 'text-muted-foreground'}>
                  {isAboveNisab ? 'Above Nisab ✓' : 'Below Nisab'}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Calculated Zakat:</span>
              <span className="font-semibold">
                {isAboveNisab ? `₹${calculatedAmount.toLocaleString('en-IN')}` : '₹0'}
              </span>
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
    calculationType === 'fixed' ? fixedAmount : (assetsValue && nisabThreshold)
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
        {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Add Zakat'}
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

export default ZakatForm;
