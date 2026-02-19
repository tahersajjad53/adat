import React, { useState, useEffect } from 'react';
import { Circle, CircleDot, FileText, Calendar, CalendarCheck, CalendarRange } from 'lucide-react';
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
import RecurrenceSelector from './RecurrenceSelector';
import CondensedAttributeRow from './CondensedAttributeRow';
import type { Goal, GoalInput, RecurrenceType, RecurrencePattern } from '@/types/goals';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
  const [endDate, setEndDate] = useState('');
  const [hasEndDate, setHasEndDate] = useState(false);
  const [isActive, setIsActive] = useState(true);

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
        setEndDate(goal.end_date || '');
        setHasEndDate(!!goal.end_date);
        setIsActive(goal.is_active);
      } else {
        setTitle('');
        setDescription('');
        setRecurrenceType('daily');
        setRecurrenceDays([]);
        setRecurrencePattern(null);
        setDueDate('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate('');
        setHasEndDate(false);
        setIsActive(true);
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
      recurrence_pattern: recurrenceType === 'custom' ? recurrencePattern : null,
      due_date: recurrenceType === 'one-time' ? dueDate || null : null,
      start_date: finalStartDate,
      end_date: recurrenceType !== 'one-time' && hasEndDate && endDate ? endDate : null,
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
      <CondensedAttributeRow icon={<FileText className="size-4" />}>
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

      <RecurrenceSelector
        recurrenceType={recurrenceType}
        recurrenceDays={recurrenceDays}
        recurrencePattern={recurrencePattern}
        dueDate={dueDate}
        onRecurrenceTypeChange={setRecurrenceType}
        onRecurrenceDaysChange={setRecurrenceDays}
        onRecurrencePatternChange={setRecurrencePattern}
        onDueDateChange={setDueDate}
        disabled={isLoading}
      />

      {recurrenceType !== 'one-time' && (
        <>
          <CondensedAttributeRow icon={<CalendarCheck className="size-4" />} label="Start date">
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isLoading}
              className="h-9 overflow-hidden"
            />
          </CondensedAttributeRow>

          <CondensedAttributeRow icon={<CalendarRange className="size-4" />}>
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-muted-foreground">Set end date</span>
              <Switch
                id="hasEndDate"
                checked={hasEndDate}
                onCheckedChange={setHasEndDate}
                disabled={isLoading}
              />
            </div>
          </CondensedAttributeRow>

          {hasEndDate && (
            <CondensedAttributeRow icon={<CalendarRange className="size-4" />} label="End date">
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isLoading}
                className="h-9 overflow-hidden"
              />
            </CondensedAttributeRow>
          )}
        </>
      )}

      {isEditing && (
        <CondensedAttributeRow icon={<CircleDot className="size-4" />}>
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
