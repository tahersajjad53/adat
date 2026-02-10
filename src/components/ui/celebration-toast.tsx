import React from 'react';
import { toast } from 'sonner';

interface CelebrationToastProps {
  dueName: string;
  amount: string;
}

const CelebrationToast: React.FC<CelebrationToastProps> = ({ dueName, amount }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border shadow-lg w-[360px]">
      {/* Decorative pattern banner */}
      <div className="pattern-celebration h-20 w-full" />

      {/* Content */}
      <div className="px-5 py-4">
        <h3 className="font-display tracking-tight text-lg text-foreground">
          Jazakallah! Payment Recorded
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {dueName} · {amount} marked as paid. Keep it up!
        </p>
      </div>
    </div>
  );
};

export function showCelebrationToast(dueName: string, amount: string) {
  toast.custom(() => (
    <CelebrationToast
      dueName={dueName}
      amount={amount}
    />
  ), {
    duration: 5000,
  });
}
