import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { SabeelWithRelations, DueType } from '@/types/dues';

interface PaymentHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sabeel: SabeelWithRelations;
}

interface PaymentRecord {
  id: string;
  due_type: string;
  reference_id: string;
  amount_paid: number | null;
  amount_due: number;
  paid_at: string | null;
  created_at: string;
}

const PAGE_SIZE = 10;

const dueTypeLabels: Record<string, string> = {
  sabeel: 'Sabeel',
  fmb: 'FMB Hub',
  khumus: 'Khumus',
  zakat: 'Zakat',
};

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ open, onOpenChange, sabeel }) => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  // Collect all reference IDs belonging to this sabeel
  const getReferenceIds = useCallback(() => {
    const ids: string[] = [sabeel.id];
    if (sabeel.fmb_hub) ids.push(sabeel.fmb_hub.id);
    sabeel.khumus_list.forEach((k) => ids.push(k.id));
    sabeel.zakats.forEach((z) => ids.push(z.id));
    return ids;
  }, [sabeel]);

  // Resolve a reference_id + due_type to a display name
  const getPersonName = useCallback((record: PaymentRecord): string | null => {
    if (record.due_type === 'khumus') {
      const k = sabeel.khumus_list.find((x) => x.id === record.reference_id);
      return k?.person_name || null;
    }
    if (record.due_type === 'zakat') {
      const z = sabeel.zakats.find((x) => x.id === record.reference_id);
      return z?.person_name || null;
    }
    return null;
  }, [sabeel]);

  const fetchPayments = useCallback(async (currentOffset: number, append: boolean) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const ids = getReferenceIds();
      const { data, error } = await supabase
        .from('due_payments')
        .select('id, due_type, reference_id, amount_paid, amount_due, paid_at, created_at')
        .in('reference_id', ids)
        .order('paid_at', { ascending: false, nullsFirst: false })
        .range(currentOffset, currentOffset + PAGE_SIZE - 1);

      if (error) throw error;

      const records = (data || []) as PaymentRecord[];
      setPayments((prev) => append ? [...prev, ...records] : records);
      setHasMore(records.length === PAGE_SIZE);
    } catch (err) {
      console.error('Failed to fetch payment history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, getReferenceIds]);

  // Reset and fetch when opened
  useEffect(() => {
    if (open) {
      setOffset(0);
      setPayments([]);
      fetchPayments(0, false);
    }
  }, [open, fetchPayments]);

  const handleShowMore = () => {
    const newOffset = offset + PAGE_SIZE;
    setOffset(newOffset);
    fetchPayments(newOffset, true);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Payment History — {sabeel.sabeel_name}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto mt-4 space-y-2">
          {payments.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No payments recorded yet.
            </p>
          )}

          {payments.map((payment) => {
            const personName = getPersonName(payment);
            const label = dueTypeLabels[payment.due_type] || payment.due_type;
            const dateStr = payment.paid_at
              ? format(new Date(payment.paid_at), 'dd MMM yyyy')
              : format(new Date(payment.created_at), 'dd MMM yyyy');

            return (
              <div
                key={payment.id}
                className="flex items-center justify-between border border-border rounded-lg p-3 bg-card"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {label}
                    </Badge>
                    {personName && (
                      <span className="text-sm font-medium truncate">{personName}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{dateStr}</p>
                </div>
                <p className="text-sm font-semibold tabular-nums ml-3">
                  {formatAmount(payment.amount_paid ?? payment.amount_due)}
                </p>
              </div>
            );
          })}

          {isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          )}

          {hasMore && !isLoading && (
            <div className="pt-2 pb-4 text-center">
              <Button variant="outline" size="sm" onClick={handleShowMore}>
                Show More
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PaymentHistory;
