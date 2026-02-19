import React, { useState, useEffect } from 'react';
import { Circle, CheckCircle, Page, Calendar } from 'iconoir-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import DateRecurrenceTimePopover from './DateRecurrenceTimePopover';
import CondensedAttributeRow from './CondensedAttributeRow';
import type { Goal, GoalInput, RecurrenceType, RecurrencePattern } from '@/types/goals';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const HIJRI_MONTH_NAMES = [
  'Muharram', 'Safar', 'Rabi I', 'Rabi II', 'Jumada I', 'Jumada II',
  'Rajab', 'Shabaan', 'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah',
];

function formatRecurrenceSummary(
  recurrenceType: RecurrenceType,
  recurrenceDays: number[],
  recurrencePattern: RecurrencePattern | null,
): string {
  if (recurrenceType === 'daily') return 'Daily';
  if (recurrenceType === 'weekly') {
    if (recurrenceDays.length === 0) return 'Weekly';
    return 'Weekly ' + recurrenceDays.map((d) => DAY_NAMES[d]).join(', ');
  }
  if (recurrenceType === 'one-time') return 'One-time';
  if (recurrenceType === 'annual' && recurrencePattern?.type === 'annual') {
    const monthNames = recurrencePattern.calendarType === 'gregorian' ? MONTH_NAMES : HIJRI_MONTH_NAMES;
    const month = monthNames[(recurrencePattern.annualMonth ?? 1) - 1] ?? '';
    const day = recurrencePattern.monthlyDay ?? 1;
    return `Annual: ${day} ${month}`;
  }
  if (recurrenceType === 'annual') return 'Annual';
  if (recurrenceType === 'custom' && recurrencePattern?.type === 'interval') {
    const n = recurrencePattern.interval ?? 2;
    const u = recurrencePattern.intervalUnit ?? 'days';
    return `Every ${n} ${u}`;
  }
  if (recurrenceType === 'custom' && recurrencePattern?.type === 'monthly') {
    return `Day ${recurrencePattern.monthlyDay ?? 1} of month`;
  }
  return 'Custom';
}

interface GoalFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal | null;
  onSubmit: (data: GoalInput) => Promise<void>;
  isLoading?: boolean;
}

const GoalFormSheet: React.FC<GoalFormSheetProps> = ({
  open,
  onOpenChange,
  goal,
  onSubmit,
  isLoading = false,
}) => {
  const isMobile = useIsMobile();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('daily');
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [preferredTime, setPreferredTime] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (goal) {
        setTitle(goal.title);
        setDescription(goal.description || '');
        setRecurrenceType(goal.recurrence_type);
        setRecurrenceDays(goal.recurrence_days || []);
        setRecurrencePattern(goal.recurrence_pattern || null);
        setDueDate(goal.due_date || '');
        setStartDate(goal.start_date);
        setIsActive(goal.is_active);
        setPreferredTime(goal.preferred_time ?? null);
      } else {
        setTitle('');
        setDescription('');
        setRecurrenceType('daily');
        setRecurrenceDays([]);
        setRecurrencePattern(null);
        setDueDate('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setIsActive(true);
        setPreferredTime(null);
      }
    }
  }, [open, goal]);

  // When switching to custom, set default pattern
  useEffect(() => {
    if (recurrenceType === 'custom' && !recurrencePattern) {
      setRecurrencePattern({ type: 'interval', interval: 2, intervalUnit: 'days' });
    }
  }, [recurrenceType, recurrencePattern]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) return;

    // For one-time goals, we use the due_date as the start_date if it exists,
    // otherwise fallback to the current startDate
    const finalStartDate = recurrenceType === 'one-time' && dueDate ? dueDate : startDate;

    const data: GoalInput = {
      title: title.trim(),
      description: description.trim() || null,
      recurrence_type: recurrenceType,
      recurrence_days: recurrenceType === 'weekly' ? recurrenceDays : null,
      recurrence_pattern:
        recurrenceType === 'custom' || recurrenceType === 'annual' ? recurrencePattern : null,
      due_date: recurrenceType === 'one-time' ? dueDate || null : null,
      start_date: finalStartDate,
      end_date: null,
      preferred_time: preferredTime,
      is_active: isActive,
    };

    await onSubmit(data);
    onOpenChange(false);
  };

  const isEditing = !!goal;
  const formTitle = isEditing ? 'Edit Goal' : 'Add Goal';
  const formDescription = isEditing
    ? 'Update your habit details'
    : 'Create a new habit to track';

  const recurrenceSummary = formatRecurrenceSummary(
    recurrenceType,
    recurrenceDays,
    recurrencePattern,
  );

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Title block: circle + title inline, recurrence summary below */}
      <div className="space-y-1">
        <div className="flex items-center gap-3 min-h-9">
          <Circle className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          <Input
            id="goalTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Quran tilawat"
            disabled={isLoading}
            required
            className="flex-1 min-w-0 h-9"
          />
        </div>
        <p className="text-sm text-muted-foreground pl-8">{recurrenceSummary}</p>
      </div>

      {/* Description: Add placeholder when empty */}
      <CondensedAttributeRow icon={<Page className="size-4" />}>
        <Textarea
          id="goalDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add description"
          disabled={isLoading}
          rows={2}
          className="min-h-[52px] resize-none"
        />
      </CondensedAttributeRow>

      <CondensedAttributeRow icon={<Calendar className="size-4" />}>
        <DateRecurrenceTimePopover
          date={recurrenceType === 'one-time' ? (dueDate || startDate) : startDate}
          onDateChange={(d) => {
            if (recurrenceType === 'one-time') {
              setDueDate(d);
              if (d) setStartDate(d);
            } else {
              setStartDate(d || new Date().toISOString().split('T')[0]);
            }
          }}
          recurrenceType={recurrenceType}
          recurrenceDays={recurrenceDays}
          recurrencePattern={recurrencePattern}
          onRecurrenceTypeChange={(t) => {
            setRecurrenceType(t);
            if (t === 'one-time') {
              setDueDate(startDate);
            } else if (!startDate) {
              setStartDate(new Date().toISOString().split('T')[0]);
            }
          }}
          onRecurrenceDaysChange={setRecurrenceDays}
          onRecurrencePatternChange={setRecurrencePattern}
          preferredTime={preferredTime}
          onPreferredTimeChange={setPreferredTime}
          disabled={isLoading}
          isOneTime={recurrenceType === 'one-time'}
        />
      </CondensedAttributeRow>

      {isEditing && (
        <CondensedAttributeRow icon={<CheckCircle className="size-4" />}>
          <div className="flex items-center justify-between w-full">
            <span className="text-sm">Active</span>
            <Switch
              id="goalActive"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={isLoading}
            />
          </div>
        </CondensedAttributeRow>
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
        onClick={() => handleSubmit()}
        disabled={isLoading || !title.trim()}
        className="flex-1"
      >
        {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Add Goal'}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
          <SheetHeader className="text-left">
            <SheetTitle>{formTitle}</SheetTitle>
            <SheetDescription>{formDescription}</SheetDescription>
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
          <DialogTitle>{formTitle}</DialogTitle>
          <DialogDescription>{formDescription}</DialogDescription>
        </DialogHeader>
        <div className="py-2">{formContent}</div>
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GoalFormSheet;
