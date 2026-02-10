import React, { useRef } from 'react';
import { Bell, Check, Calendar, HalfMoon } from 'iconoir-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useConfetti } from '@/components/ui/confetti';
import { useDueReminders } from '@/hooks/useDueReminders';
import { showCelebrationToast } from '@/components/ui/celebration-toast';
import { PaymentConfirmDialog } from '@/components/dues/PaymentConfirmDialog';
import { cn } from '@/lib/utils';
import type { DueReminder } from '@/types/dues';
export function DueRemindersCard() {
  const {
    reminders,
    paidCount,
    totalCount,
    isLoading,
    markAsPaid,
    isPaymentMadeThisMonth
  } = useDueReminders();
  const {
    triggerConfetti,
    ConfettiPortal
  } = useConfetti();
  const checkboxRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [markingId, setMarkingId] = React.useState<string | null>(null);
  const [pendingReminder, setPendingReminder] = React.useState<DueReminder | null>(null);

  const handleCheckboxTap = (reminder: DueReminder, isPaid: boolean) => {
    if (isPaid) return;
    setPendingReminder(reminder);
  };

  const handleConfirm = async () => {
    if (!pendingReminder) return;
    const reminder = pendingReminder;
    setPendingReminder(null);
    setMarkingId(reminder.id);
    triggerConfetti(checkboxRefs.current.get(reminder.id));
    try {
      await markAsPaid(reminder);
      showCelebrationToast(reminder.title, String(reminder.amount));
    } finally {
      setMarkingId(null);
    }
  };
  if (isLoading || reminders.length === 0) {
    return null;
  }
  return <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="font-display tracking-tight font-normal text-xl">Dues Reminders</h2>
        </div>
        <span className="label-caps">
          {paidCount}/{totalCount}
        </span>
      </div>

      <div className="space-y-3">
        {reminders.map(reminder => {
        const referenceId = reminder.id.split('-').slice(1).join('-');
        const isPaid = isPaymentMadeThisMonth(reminder.type, referenceId, reminder.calendarType);
        return <div key={reminder.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50">
              <Checkbox ref={el => {
            if (el) checkboxRefs.current.set(reminder.id, el);else checkboxRefs.current.delete(reminder.id);
          }} checked={isPaid} onCheckedChange={() => handleCheckboxTap(reminder, isPaid)} disabled={isPaid || markingId === reminder.id} className="h-5 w-5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={cn('text-base font-medium', isPaid && 'line-through text-muted-foreground')}>
                    {reminder.title}
                  </span>
                  {reminder.calendarType === 'hijri' ? <HalfMoon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" /> : <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
                </div>
                <p className={cn('text-sm text-muted-foreground font-normal mt-0.5', isPaid && 'line-through')}>
                  {reminder.amount} · Due {reminder.dueDate}
                </p>
              </div>
              {isPaid && <Check className="h-4 w-4 text-primary shrink-0" />}
            </div>;
      })}
      </div>
      <ConfettiPortal />
      <PaymentConfirmDialog
        open={!!pendingReminder}
        onOpenChange={(open) => { if (!open) setPendingReminder(null); }}
        dueName={pendingReminder?.title ?? ''}
        amount={String(pendingReminder?.amount ?? '')}
        onConfirm={handleConfirm}
        isLoading={!!markingId}
      />
    </div>;
}