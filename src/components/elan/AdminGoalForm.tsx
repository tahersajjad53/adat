import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { AdminGoal, AdminGoalInput } from '@/types/adminGoals';

const HIJRI_MONTHS = [
  'Muharram ul-Haram', 'Safar ul-Muzaffar', 'Rabi ul-Awwal', 'Rabi ul-Aakhar',
  'Jumada al-Ula', 'Jumada al-Ukhra', 'Rajab ul-Asab', 'Shabaan ul-Karim',
  'Ramadan ul-Moazzam', 'Shawwal ul-Mukarram', 'Dhul Qadah', 'Dhul Hijjah',
];

const GREGORIAN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LABELS = [
  { value: '0', label: 'S' }, { value: '1', label: 'M' },
  { value: '2', label: 'T' }, { value: '3', label: 'W' },
  { value: '4', label: 'T' }, { value: '5', label: 'F' },
  { value: '6', label: 'S' },
];

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

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recurrenceType, setRecurrenceType] = useState('daily');
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [customPatternType, setCustomPatternType] = useState<'interval' | 'monthly'>('interval');
  const [interval, setIntervalVal] = useState(2);
  const [intervalUnit, setIntervalUnit] = useState<'days' | 'weeks'>('days');
  const [monthlyDay, setMonthlyDay] = useState(1);
  const [calendarType, setCalendarType] = useState<'hijri' | 'gregorian'>('hijri');
  const [annualMonth, setAnnualMonth] = useState(1);
  const [annualDay, setAnnualDay] = useState(1);
  const [annualCalendar, setAnnualCalendar] = useState<'hijri' | 'gregorian'>('hijri');
  const [dueDate, setDueDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hasEndDate, setHasEndDate] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description || '');
      setRecurrenceType(goal.recurrence_type);
      setRecurrenceDays(goal.recurrence_days || []);
      setDueDate(goal.due_date || '');
      setStartDate(goal.start_date);
      setEndDate(goal.end_date || '');
      setHasEndDate(!!goal.end_date);
      setIsPublished(goal.is_published);
      const p = goal.recurrence_pattern;
      if (p) {
        if (p.type === 'interval') {
          setCustomPatternType('interval');
          setIntervalVal(p.interval || 2);
          setIntervalUnit(p.intervalUnit || 'days');
        } else if (p.type === 'monthly') {
          setCustomPatternType('monthly');
          setMonthlyDay(p.monthlyDay || 1);
          setCalendarType(p.calendarType || 'hijri');
        } else if (p.type === 'annual') {
          setAnnualMonth(p.annualMonth || 1);
          setAnnualDay(p.monthlyDay || 1);
          setAnnualCalendar(p.calendarType || 'hijri');
        }
      }
    } else {
      setTitle(''); setDescription(''); setRecurrenceType('daily');
      setRecurrenceDays([]); setDueDate('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate(''); setHasEndDate(false); setIsPublished(false);
      setCustomPatternType('interval'); setIntervalVal(2); setIntervalUnit('days');
      setMonthlyDay(1); setCalendarType('hijri');
      setAnnualMonth(1); setAnnualDay(1); setAnnualCalendar('hijri');
    }
  }, [open, goal]);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    let recurrence_pattern: any = null;
    if (recurrenceType === 'custom') {
      recurrence_pattern = customPatternType === 'interval'
        ? { type: 'interval', interval, intervalUnit }
        : { type: 'monthly', monthlyDay, calendarType };
    } else if (recurrenceType === 'annual') {
      recurrence_pattern = {
        type: 'annual',
        annualMonth,
        monthlyDay: annualDay,
        calendarType: annualCalendar,
      };
    }

    await onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      recurrence_type: recurrenceType,
      recurrence_days: recurrenceType === 'weekly' ? recurrenceDays : null,
      recurrence_pattern,
      due_date: recurrenceType === 'one-time' ? dueDate || null : null,
      start_date: startDate,
      end_date: hasEndDate && endDate ? endDate : null,
      is_published: isPublished,
    });
    onOpenChange(false);
  };

  const isEditing = !!goal;
  const formTitle = isEditing ? 'Edit Goal' : 'Add Goal';

  const formContent = (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-5">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Moti Salwat before Iftar" disabled={isLoading} required autoFocus />
      </div>

      <div className="space-y-2">
        <Label>Description (optional)</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details..." disabled={isLoading} rows={2} />
      </div>

      <div className="space-y-2">
        <Label>Repeats</Label>
        <Select value={recurrenceType} onValueChange={setRecurrenceType} disabled={isLoading}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
            <SelectItem value="one-time">One-time</SelectItem>
            <SelectItem value="annual">Annual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {recurrenceType === 'weekly' && (
        <div className="space-y-2">
          <Label>On days</Label>
          <ToggleGroup type="multiple" value={recurrenceDays.map(String)} onValueChange={(vals) => setRecurrenceDays(vals.map(Number))} className="justify-start gap-1" disabled={isLoading}>
            {DAY_LABELS.map((d) => (
              <ToggleGroupItem key={d.value} value={d.value} className="h-9 w-9 rounded-full text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">{d.label}</ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}

      {recurrenceType === 'custom' && (
        <div className="space-y-4">
          <Select value={customPatternType} onValueChange={(v) => setCustomPatternType(v as any)} disabled={isLoading}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="interval">Every N days/weeks</SelectItem>
              <SelectItem value="monthly">Day of month</SelectItem>
            </SelectContent>
          </Select>
          {customPatternType === 'interval' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Every</span>
              <Input type="number" min="1" value={interval} onChange={(e) => setIntervalVal(parseInt(e.target.value) || 2)} className="w-20" disabled={isLoading} />
              <Select value={intervalUnit} onValueChange={(v) => setIntervalUnit(v as any)} disabled={isLoading}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">days</SelectItem>
                  <SelectItem value="weeks">weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {customPatternType === 'monthly' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Day</span>
                <Input type="number" min="1" max="30" value={monthlyDay} onChange={(e) => setMonthlyDay(parseInt(e.target.value) || 1)} className="w-20" disabled={isLoading} />
                <span className="text-sm text-muted-foreground">of each month</span>
              </div>
              <Select value={calendarType} onValueChange={(v) => setCalendarType(v as any)} disabled={isLoading}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hijri">Hijri</SelectItem>
                  <SelectItem value="gregorian">Gregorian</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {recurrenceType === 'annual' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Calendar</Label>
            <Select value={annualCalendar} onValueChange={(v) => setAnnualCalendar(v as any)} disabled={isLoading}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="hijri">Hijri</SelectItem>
                <SelectItem value="gregorian">Gregorian</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Month</Label>
            <Select value={String(annualMonth)} onValueChange={(v) => setAnnualMonth(parseInt(v))} disabled={isLoading}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(annualCalendar === 'hijri' ? HIJRI_MONTHS : GREGORIAN_MONTHS).map((m, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label>Day</Label>
            <Input type="number" min="1" max="30" value={annualDay} onChange={(e) => setAnnualDay(parseInt(e.target.value) || 1)} className="w-20" disabled={isLoading} />
          </div>
        </div>
      )}

      {recurrenceType === 'one-time' && (
        <div className="space-y-2">
          <Label>Due date</Label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={isLoading} />
        </div>
      )}

      <div className="space-y-2">
        <Label>Start date</Label>
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={isLoading} />
      </div>

      <div className="flex items-center justify-between">
        <Label className="cursor-pointer">Set end date</Label>
        <Switch checked={hasEndDate} onCheckedChange={setHasEndDate} disabled={isLoading} />
      </div>
      {hasEndDate && (
        <div className="space-y-2">
          <Label>End date</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={isLoading} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <Label className="cursor-pointer">Published</Label>
        <Switch checked={isPublished} onCheckedChange={setIsPublished} disabled={isLoading} />
      </div>
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
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle>{formTitle}</SheetTitle>
            <SheetDescription>Manage community goal</SheetDescription>
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
          <DialogDescription>Manage community goal</DialogDescription>
        </DialogHeader>
        <div className="py-2">{formContent}</div>
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminGoalForm;
