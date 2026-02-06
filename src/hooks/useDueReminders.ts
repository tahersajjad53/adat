/**
 * Due Reminders Hook
 * 
 * Calculates which dues need reminders based on calendar type,
 * reminder settings, and payment status
 */

import { useMemo } from 'react';
import { useCalendar } from '@/contexts/CalendarContext';
import { useSabeels } from '@/hooks/useSabeels';
import { useDuePayments } from '@/hooks/useDuePayments';
import {
  shouldShowReminder,
  calculateUrgency,
  getDaysRemaining,
  formatDueDateWithContext,
  getCurrentPeriod,
  isDueInActiveRange,
  getDaysInHijriMonth,
  getDaysInGregorianMonth,
} from '@/lib/calendarUtils';
import type {
  DueReminder,
  DueType,
  CalendarType,
  ReminderType,
  SabeelWithRelations,
  Khumus,
  Zakat,
  FMBHub,
  DuePaymentInput,
} from '@/types/dues';
import { calculateKhumusAmount, calculateZakatAmount } from '@/types/dues';

interface UseDueRemindersReturn {
  reminders: DueReminder[];
  activeCount: number;
  paidCount: number;
  totalCount: number;
  isLoading: boolean;
  markAsPaid: (reminder: DueReminder) => Promise<void>;
}

// Helper to get due day based on reminder settings
function getDueDay(
  reminderType: ReminderType,
  reminderDay: number | null | undefined,
  calendarType: CalendarType,
  hijriMonth: number,
  gregorianMonth: number,
  gregorianYear: number
): number {
  if (reminderType === 'custom' && reminderDay) {
    return reminderDay;
  }
  // Default to last day of month
  if (calendarType === 'hijri') {
    return getDaysInHijriMonth(hijriMonth);
  }
  return getDaysInGregorianMonth(gregorianMonth, gregorianYear);
}

export function useDueReminders(): UseDueRemindersReturn {
  const { currentDate } = useCalendar();
  const { sabeels, isLoading: sabeelsLoading } = useSabeels();
  const { isPaymentMadeThisMonth, markAsPaid: recordPayment, isLoading: paymentsLoading } = useDuePayments();

  const reminders = useMemo(() => {
    if (!currentDate || sabeelsLoading) return [];

    const { hijri, gregorian } = currentDate;
    const result: DueReminder[] = [];

    sabeels.forEach((sabeel: SabeelWithRelations) => {
      // Check Sabeel itself
      if (
        sabeel.is_active &&
        isDueInActiveRange(
          sabeel.calendar_type,
          sabeel.start_month,
          sabeel.start_year,
          sabeel.end_month,
          sabeel.end_year,
          hijri,
          gregorian
        )
      ) {
        const shouldShow = shouldShowReminder(
          sabeel.reminder_type,
          sabeel.reminder_day,
          sabeel.calendar_type,
          hijri,
          gregorian
        );

        const isPaid = isPaymentMadeThisMonth('sabeel', sabeel.id, sabeel.calendar_type);

        if (shouldShow || isPaid) {
          const { month: currentMonth, year: currentYear } = getCurrentPeriod(
            sabeel.calendar_type,
            hijri,
            gregorian
          );
          const dueDay = getDueDay(
            sabeel.reminder_type,
            sabeel.reminder_day,
            sabeel.calendar_type,
            hijri.month,
            gregorian.getMonth() + 1,
            gregorian.getFullYear()
          );

          result.push({
            id: `sabeel-${sabeel.id}`,
            type: 'sabeel',
            title: sabeel.sabeel_name,
            subtitle: 'Sabeel',
            amount: sabeel.monthly_amount,
            calendarType: sabeel.calendar_type,
            dueDate: formatDueDateWithContext(sabeel.calendar_type, dueDay, hijri, gregorian),
            daysRemaining: getDaysRemaining(sabeel.calendar_type, hijri, gregorian),
            urgency: isPaid ? 'upcoming' : calculateUrgency(sabeel.calendar_type, hijri, gregorian),
            sabeelId: sabeel.id,
            sabeelName: sabeel.sabeel_name,
          });
        }
      }

      // Check FMB Hub
      const fmb = sabeel.fmb_hub;
      if (
        fmb &&
        fmb.is_active &&
        isDueInActiveRange(
          fmb.calendar_type,
          fmb.start_month,
          fmb.start_year,
          fmb.end_month,
          fmb.end_year,
          hijri,
          gregorian
        )
      ) {
        const shouldShow = shouldShowReminder(
          fmb.reminder_type,
          fmb.reminder_day,
          fmb.calendar_type,
          hijri,
          gregorian
        );

        const isPaid = isPaymentMadeThisMonth('fmb', fmb.id, fmb.calendar_type);

        if (shouldShow || isPaid) {
          const dueDay = getDueDay(
            fmb.reminder_type,
            fmb.reminder_day,
            fmb.calendar_type,
            hijri.month,
            gregorian.getMonth() + 1,
            gregorian.getFullYear()
          );

          result.push({
            id: `fmb-${fmb.id}`,
            type: 'fmb',
            title: 'FMB Hub',
            subtitle: sabeel.sabeel_name,
            amount: fmb.monthly_amount,
            calendarType: fmb.calendar_type,
            dueDate: formatDueDateWithContext(fmb.calendar_type, dueDay, hijri, gregorian),
            daysRemaining: getDaysRemaining(fmb.calendar_type, hijri, gregorian),
            urgency: isPaid ? 'upcoming' : calculateUrgency(fmb.calendar_type, hijri, gregorian),
            sabeelId: sabeel.id,
            sabeelName: sabeel.sabeel_name,
          });
        }
      }

      // Check Khumus entries
      sabeel.khumus_list.forEach((khumus: Khumus) => {
        if (khumus.is_active) {
          const shouldShow = shouldShowReminder(
            khumus.reminder_type,
            khumus.reminder_day,
            khumus.calendar_type,
            hijri,
            gregorian
          );

          const isPaid = isPaymentMadeThisMonth('khumus', khumus.id, khumus.calendar_type);

          if (shouldShow || isPaid) {
            const dueDay = getDueDay(
              khumus.reminder_type,
              khumus.reminder_day,
              khumus.calendar_type,
              hijri.month,
              gregorian.getMonth() + 1,
              gregorian.getFullYear()
            );

            result.push({
              id: `khumus-${khumus.id}`,
              type: 'khumus',
              title: `Khumus (${khumus.person_name})`,
              subtitle: sabeel.sabeel_name,
              amount: calculateKhumusAmount(khumus),
              calendarType: khumus.calendar_type,
              dueDate: formatDueDateWithContext(khumus.calendar_type, dueDay, hijri, gregorian),
              daysRemaining: getDaysRemaining(khumus.calendar_type, hijri, gregorian),
              urgency: isPaid ? 'upcoming' : calculateUrgency(khumus.calendar_type, hijri, gregorian),
              sabeelId: sabeel.id,
              sabeelName: sabeel.sabeel_name,
            });
          }
        }
      });

      // Check Zakat entries
      sabeel.zakats.forEach((zakat: Zakat) => {
        if (zakat.is_active) {
          const shouldShow = shouldShowReminder(
            zakat.reminder_type,
            zakat.reminder_day,
            zakat.calendar_type,
            hijri,
            gregorian
          );

          const isPaid = isPaymentMadeThisMonth('zakat', zakat.id, zakat.calendar_type);

          if (shouldShow || isPaid) {
            const dueDay = getDueDay(
              zakat.reminder_type,
              zakat.reminder_day,
              zakat.calendar_type,
              hijri.month,
              gregorian.getMonth() + 1,
              gregorian.getFullYear()
            );

            result.push({
              id: `zakat-${zakat.id}`,
              type: 'zakat',
              title: `Zakat (${zakat.person_name})`,
              subtitle: sabeel.sabeel_name,
              amount: calculateZakatAmount(zakat),
              calendarType: zakat.calendar_type,
              dueDate: formatDueDateWithContext(zakat.calendar_type, dueDay, hijri, gregorian),
              daysRemaining: getDaysRemaining(zakat.calendar_type, hijri, gregorian),
              urgency: isPaid ? 'upcoming' : calculateUrgency(zakat.calendar_type, hijri, gregorian),
              sabeelId: sabeel.id,
              sabeelName: sabeel.sabeel_name,
            });
          }
        }
      });
    });

    // Sort by urgency: overdue first, then due_today, then upcoming
    const urgencyOrder = { overdue: 0, due_today: 1, upcoming: 2 };
    result.sort((a, b) => {
      // First by urgency
      const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;
      // Then by days remaining
      return a.daysRemaining - b.daysRemaining;
    });

    return result;
  }, [currentDate, sabeels, sabeelsLoading, isPaymentMadeThisMonth]);

  // Calculate paid/unpaid counts
  const paidCount = useMemo(() => {
    if (!currentDate) return 0;
    return reminders.filter((r) => 
      isPaymentMadeThisMonth(r.type, r.id.split('-').slice(1).join('-'), r.calendarType)
    ).length;
  }, [reminders, currentDate, isPaymentMadeThisMonth]);

  const markAsPaid = async (reminder: DueReminder) => {
    if (!currentDate) return;

    const referenceId = reminder.id.split('-').slice(1).join('-');
    const { month, year } = getCurrentPeriod(
      reminder.calendarType,
      currentDate.hijri,
      currentDate.gregorian
    );

    const input: DuePaymentInput = {
      due_type: reminder.type,
      reference_id: referenceId,
      calendar_type: reminder.calendarType,
      due_month: month,
      due_year: year,
      amount_due: reminder.amount,
      amount_paid: reminder.amount,
      paid_at: new Date().toISOString(),
    };

    await recordPayment(input);
  };

  return {
    reminders,
    activeCount: reminders.length,
    paidCount,
    totalCount: reminders.length,
    isLoading: sabeelsLoading || paymentsLoading,
    markAsPaid,
  };
}
