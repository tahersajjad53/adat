/**
 * Due Reminders Card
 * 
 * Dashboard component showing active dues reminders with urgency indicators
 * and the ability to mark payments as complete
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bell, Check, Calendar, HalfMoon } from 'iconoir-react';
import { useDueReminders } from '@/hooks/useDueReminders';
import { useDuePayments } from '@/hooks/useDuePayments';
import { cn } from '@/lib/utils';
import type { DueReminder } from '@/types/dues';

// Type icons for different due types
const TYPE_LABELS: Record<string, string> = {
  sabeel: 'Sabeel',
  fmb: 'FMB Hub',
  khumus: 'Khumus',
  zakat: 'Zakat',
};

interface ReminderItemProps {
  reminder: DueReminder;
  isPaid: boolean;
  onMarkPaid: () => void;
  isMarking: boolean;
}

function ReminderItem({ reminder, isPaid, onMarkPaid, isMarking }: ReminderItemProps) {
  const urgencyClasses = {
    overdue: 'border-destructive/50 bg-destructive/5',
    due_today: 'border-amber-500/50 bg-amber-500/5',
    upcoming: 'border-border',
  };

  const urgencyBadge = {
    overdue: { label: 'Overdue', variant: 'destructive' as const },
    due_today: { label: 'Today', variant: 'default' as const },
    upcoming: { label: `${reminder.daysRemaining}d`, variant: 'secondary' as const },
  };

  const badge = isPaid 
    ? { label: 'Paid', variant: 'secondary' as const }
    : urgencyBadge[reminder.urgency];

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg border transition-colors',
        isPaid ? 'border-primary/30 bg-primary/5' : urgencyClasses[reminder.urgency]
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{reminder.title}</span>
          {reminder.calendarType === 'hijri' ? (
            <HalfMoon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          ) : (
            <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          )}
          <Badge variant={badge.variant} className="text-xs">
            {badge.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          ₹{reminder.amount.toLocaleString('en-IN')} · Due {reminder.dueDate}
        </p>
      </div>
      <Button
        size="sm"
        variant={isPaid ? 'ghost' : 'outline'}
        onClick={onMarkPaid}
        disabled={isPaid || isMarking}
        className={cn(
          'ml-3 flex-shrink-0',
          isPaid && 'text-primary pointer-events-none'
        )}
      >
        <Check className="h-4 w-4 mr-1" />
        {isPaid ? 'Paid' : 'Mark Paid'}
      </Button>
    </div>
  );
}

export function DueRemindersCard() {
  const { reminders, activeCount, paidCount, totalCount, isLoading, markAsPaid } = useDueReminders();
  const { isPaymentMadeThisMonth } = useDuePayments();
  const [markingId, setMarkingId] = React.useState<string | null>(null);

  const handleMarkPaid = async (reminder: DueReminder) => {
    setMarkingId(reminder.id);
    try {
      await markAsPaid(reminder);
    } finally {
      setMarkingId(null);
    }
  };

  const progressPercentage = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            Dues Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            Dues Reminders
          </CardTitle>
          {activeCount > 0 && (
            <Badge variant="secondary">{activeCount}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {reminders.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No dues reminders right now</p>
            <p className="text-xs mt-1">
              Add Sabeels in your profile to track dues
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {reminders.map((reminder) => {
                const referenceId = reminder.id.split('-').slice(1).join('-');
                const isPaid = isPaymentMadeThisMonth(
                  reminder.type,
                  referenceId,
                  reminder.calendarType
                );
                return (
                  <ReminderItem
                    key={reminder.id}
                    reminder={reminder}
                    isPaid={isPaid}
                    onMarkPaid={() => handleMarkPaid(reminder)}
                    isMarking={markingId === reminder.id}
                  />
                );
              })}
            </div>

            {/* Monthly Progress */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Monthly Progress</span>
                <span className="font-medium">
                  {paidCount}/{totalCount} paid
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
