/**
 * Due Payments Hook
 * 
 * Handles CRUD operations for due_payments table to track monthly payment status
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCalendar } from '@/contexts/CalendarContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getCurrentPeriod } from '@/lib/calendarUtils';
import type { DuePayment, DuePaymentInput, DueType, CalendarType } from '@/types/dues';

interface UseDuePaymentsReturn {
  payments: DuePayment[];
  isLoading: boolean;
  error: string | null;
  markAsPaid: (input: DuePaymentInput) => Promise<void>;
  isPaymentMadeThisMonth: (
    dueType: DueType,
    referenceId: string,
    calendarType: CalendarType
  ) => boolean;
  getPaymentForMonth: (
    dueType: DueType,
    referenceId: string,
    month: number,
    year: number
  ) => DuePayment | null;
  refetch: () => Promise<void>;
}

export function useDuePayments(): UseDuePaymentsReturn {
  const { user } = useAuth();
  const { currentDate } = useCalendar();
  const { toast } = useToast();
  const [payments, setPayments] = useState<DuePayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    if (!user) {
      setPayments([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('due_payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const typedPayments: DuePayment[] = (data || []).map((p) => ({
        ...p,
        due_type: p.due_type as DueType,
        calendar_type: p.calendar_type as CalendarType,
      }));

      setPayments(typedPayments);
    } catch (err) {
      console.error('Error fetching due payments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const markAsPaid = useCallback(
    async (input: DuePaymentInput) => {
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to mark payments',
          variant: 'destructive',
        });
        return;
      }

      try {
        // Check if payment already exists for this month
        const existingPayment = payments.find(
          (p) =>
            p.due_type === input.due_type &&
            p.reference_id === input.reference_id &&
            p.due_month === input.due_month &&
            p.due_year === input.due_year
        );

        if (existingPayment) {
          // Update existing payment
          const { error: updateError } = await supabase
            .from('due_payments')
            .update({
              amount_paid: input.amount_paid ?? input.amount_due,
              paid_at: new Date().toISOString(),
            })
            .eq('id', existingPayment.id);

          if (updateError) throw updateError;
        } else {
          // Create new payment record
          const { error: insertError } = await supabase.from('due_payments').insert({
            user_id: user.id,
            due_type: input.due_type,
            reference_id: input.reference_id,
            calendar_type: input.calendar_type,
            due_month: input.due_month,
            due_year: input.due_year,
            amount_due: input.amount_due,
            amount_paid: input.amount_paid ?? input.amount_due,
            paid_at: new Date().toISOString(),
          });

          if (insertError) throw insertError;
        }

        await fetchPayments();
      } catch (err) {
        console.error('Error marking payment:', err);
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to record payment',
          variant: 'destructive',
        });
      }
    },
    [user, payments, toast, fetchPayments]
  );

  const isPaymentMadeThisMonth = useCallback(
    (dueType: DueType, referenceId: string, calendarType: CalendarType): boolean => {
      if (!currentDate) return false;

      const { month, year } = getCurrentPeriod(
        calendarType,
        currentDate.hijri,
        currentDate.gregorian
      );

      return payments.some(
        (p) =>
          p.due_type === dueType &&
          p.reference_id === referenceId &&
          p.due_month === month &&
          p.due_year === year &&
          p.paid_at !== null
      );
    },
    [payments, currentDate]
  );

  const getPaymentForMonth = useCallback(
    (
      dueType: DueType,
      referenceId: string,
      month: number,
      year: number
    ): DuePayment | null => {
      return (
        payments.find(
          (p) =>
            p.due_type === dueType &&
            p.reference_id === referenceId &&
            p.due_month === month &&
            p.due_year === year
        ) || null
      );
    },
    [payments]
  );

  // Fetch on mount and when user changes
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    isLoading,
    error,
    markAsPaid,
    isPaymentMadeThisMonth,
    getPaymentForMonth,
    refetch: fetchPayments,
  };
}
