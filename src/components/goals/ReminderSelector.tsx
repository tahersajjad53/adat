import React, { useState } from 'react';
import { Bell, Check } from 'iconoir-react';
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
import type { ReminderOffset } from '@/types/goals';

export const REMINDER_OPTIONS: { value: ReminderOffset; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'at_time', label: 'At time of event' },
  { value: '5m', label: '5 minutes before' },
  { value: '10m', label: '10 minutes before' },
  { value: '15m', label: '15 minutes before' },
  { value: '30m', label: '30 minutes before' },
  { value: '1h', label: '1 hour before' },
  { value: '2h', label: '2 hours before' },
  { value: '1d', label: '1 day before' },
  { value: '2d', label: '2 days before' },
];

function formatReminderLabel(value: ReminderOffset | null | undefined): string {
  if (!value || value === 'none') return 'None';
  const opt = REMINDER_OPTIONS.find((o) => o.value === value);
  return opt?.label ?? 'None';
}

export interface ReminderSelectorProps {
  value: ReminderOffset | null | undefined;
  onChange: (value: ReminderOffset | null) => void;
  disabled?: boolean;
}

const ReminderSelector: React.FC<ReminderSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const effectiveValue = value ?? 'none';
  const displayLabel = formatReminderLabel(value);

  const handleSelect = (val: ReminderOffset) => {
    onChange(val === 'none' ? null : val);
    setOpen(false);
  };

  const triggerButton = (
    <button
      type="button"
      disabled={disabled}
      className="flex items-center min-h-9 w-full text-left text-sm hover:bg-accent/50 rounded-md px-2 py-1.5 -mx-2 transition-colors"
    >
      <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
        {displayLabel}
      </span>
    </button>
  );

  const modalContent = (
    <div className="min-w-[280px] py-2">
      {REMINDER_OPTIONS.map((opt) => {
        const isSelected = effectiveValue === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleSelect(opt.value)}
            className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left rounded-md transition-colors ${
              isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
            }`}
          >
            {isSelected ? (
              <Check className="size-4 shrink-0 text-primary" strokeWidth={2.5} />
            ) : (
              <span className="size-4 shrink-0" aria-hidden />
            )}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{triggerButton}</SheetTrigger>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle>Reminder</SheetTitle>
          </SheetHeader>
          <div className="py-4">{modalContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-sm max-h-[85vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle>Reminder</DialogTitle>
        </DialogHeader>
        {modalContent}
      </DialogContent>
    </Dialog>
  );
};

export default ReminderSelector;
