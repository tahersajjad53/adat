import React, { useState, useEffect } from 'react';
import { Circle, Page, Calendar, Globe, Label as TagIcon } from 'iconoir-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTags } from '@/hooks/useTags';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import DateRecurrenceTimePopover from '@/components/goals/DateRecurrenceTimePopover';
import CondensedAttributeRow from '@/components/goals/CondensedAttributeRow';
import type { AdminGoal, AdminGoalInput } from '@/types/adminGoals';
import type { RecurrenceType, RecurrencePattern } from '@/types/goals';

interface AdminGoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: AdminGoal | null;
  onSubmit: (data: AdminGoalInput) => Promise<void>;
  isLoading?: boolean;
}

const AdminGoalForm: React.FC<AdminGoalFormProps> = ({
  open, onOpenChange, goal, onSubmit, isLoading = false,
}) => {
  const isMobile = useIsMobile();
  const { tags: dbTags } = useTags();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('one-time');
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hasEndDate, setHasEndDate] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [preferredTime, setPreferredTime] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description || '');
      setRecurrenceType(goal.recurrence_type as RecurrenceType);
      setRecurrenceDays(goal.recurrence_days || []);
      setRecurrencePattern(goal.recurrence_pattern || null);
      setDueDate(goal.due_date || '');
      setStartDate(goal.start_date);
      setEndDate(goal.end_date || '');
      setHasEndDate(!!goal.end_date);
      setIsPublished(goal.is_published);
      setPreferredTime(goal.preferred_time ?? null);
    } else {
      setTitle('');
      setDescription('');
      setRecurrenceType('one-time');
      setRecurrenceDays([]);
      setRecurrencePattern(null);
      setDueDate(new Date().toISOString().split('T')[0]);
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setHasEndDate(false);
      setIsPublished(false);
      setPreferredTime(null);
    }
  }, [open, goal]);

  useEffect(() => {
    if (recurrenceType === 'custom' && !recurrencePattern) {
      setRecurrencePattern({ type: 'interval', interval: 2, intervalUnit: 'days' });
    }
  }, [recurrenceType, recurrencePattern]);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    await onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      recurrence_type: recurrenceType,
      recurrence_days: recurrenceType === 'weekly' ? recurrenceDays : null,
      recurrence_pattern:
        recurrenceType === 'custom' || recurrenceType === 'annual' ? recurrencePattern : null,
      due_date: recurrenceType === 'one-time' ? dueDate || null : null,
      start_date: recurrenceType === 'one-time' && dueDate ? dueDate : startDate,
      end_date: hasEndDate && endDate ? endDate : null,
      preferred_time: preferredTime,
      is_published: isPublished,
    });
    onOpenChange(false);
  };

  const isEditing = !!goal;
  const formTitle = isEditing ? 'Edit Goal' : 'Add Goal';

  const formContent = (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-2">
      <div className="flex items-center gap-3 min-h-9">
        <Circle className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Moti Salwat before Iftar"
          disabled={isLoading}
          required
          className="flex-1 min-w-0 h-9"
          onFocus={(e) => {
            const target = e.target;
            setTimeout(() => {
              target.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }, 300);
          }}
        />
      </div>

      <CondensedAttributeRow icon={<Page className="size-4" />}>
        <Textarea
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

      <CondensedAttributeRow icon={<Calendar className="size-4" />}>
        <div className="flex items-center justify-between w-full">
          <span className="text-sm text-muted-foreground">Set end date</span>
          <Switch checked={hasEndDate} onCheckedChange={setHasEndDate} disabled={isLoading} />
        </div>
      </CondensedAttributeRow>
      {hasEndDate && (
        <CondensedAttributeRow icon={<Calendar className="size-4" />} label="End date">
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={isLoading} className="h-9 overflow-hidden" />
        </CondensedAttributeRow>
      )}

      <CondensedAttributeRow icon={<Globe className="size-4" />}>
        <div className="flex items-center justify-between w-full">
          <span className="text-sm">Published</span>
          <Switch checked={isPublished} onCheckedChange={setIsPublished} disabled={isLoading} />
        </div>
      </CondensedAttributeRow>
    </form>
  );

  const footer = (
    <div className="flex gap-3">
      <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="flex-1">Cancel</Button>
      <Button onClick={handleSubmit} disabled={isLoading || !title.trim()} className="flex-1">
        {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Add Goal'}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="max-h-[85dvh] flex flex-col">
          <SheetHeader className="text-left">
            <SheetTitle>{formTitle}</SheetTitle>
            <SheetDescription>Manage community goal</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-4">{formContent}</div>
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
          <DialogDescription>Manage community goal</DialogDescription>
        </DialogHeader>
        <div className="py-2">{formContent}</div>
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminGoalForm;
