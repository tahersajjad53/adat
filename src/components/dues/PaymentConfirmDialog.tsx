import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

interface PaymentConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dueName: string;
  amount: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function PaymentConfirmDialog({
  open,
  onOpenChange,
  dueName,
  amount,
  onConfirm,
  isLoading,
}: PaymentConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="overflow-hidden rounded-2xl p-0 max-w-[360px]">
        <div className="pattern-celebration h-20 w-full" />
        <div className="px-6 pb-6 pt-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display tracking-tight font-normal text-lg">
              Confirm Payment
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground mt-1">
              {dueName} · {amount} will be marked as paid for this month. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-full" disabled={isLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full"
              onClick={onConfirm}
              disabled={isLoading}
            >
              Yes, Paid
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
