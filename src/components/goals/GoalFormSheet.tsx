import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import type { Goal, GoalInput, RecurrenceType, RecurrencePattern } from '@/types/goals';

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

    const data: GoalInput = {
      title: title.trim(),
      description: description.trim() || null,
      recurrence_type: recurrenceType,
      recurrence_days: recurrenceType === 'weekly' ? recurrenceDays : null,
      recurrence_pattern: recurrenceType === 'custom' ? recurrencePattern : null,
      due_date: recurrenceType === 'one-time' ? dueDate || null : null,
      start_date: startDate,
      end_date: hasEndDate && endDate ? endDate : null,
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

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="goalTitle">Title</Label>
        <Input
          id="goalTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Quran tilawat"
          disabled={isLoading}
          required
          
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="goalDescription">Description (optional)</Label>
        <Textarea
          id="goalDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Notes, links, or details..."
          disabled={isLoading}
          rows={2}
        />
      </div>

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

      <div className="space-y-2">
        <Label htmlFor="startDate">Start date</Label>
        <Input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          disabled={isLoading}
        />
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
          <Label htmlFor="endDate">End date</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={isLoading}
          />
        </div>
      )}

      {isEditing && (
        <div className="flex items-center justify-between">
          <Label htmlFor="goalActive" className="cursor-pointer">
            Active
          </Label>
          <Switch
            id="goalActive"
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
