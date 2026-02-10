import React from 'react';
import { toast } from 'sonner';
import { X } from 'iconoir-react';

interface CelebrationToastProps {
  dueName: string;
  amount: string;
  onDismiss: () => void;
}

const CelebrationToast: React.FC<CelebrationToastProps> = ({ dueName, amount, onDismiss }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border shadow-lg w-[360px]">
      {/* Close button */}
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 z-10 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

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
  toast.custom((id) => (
    <CelebrationToast
      dueName={dueName}
      amount={amount}
      onDismiss={() => toast.dismiss(id)}
    />
  ), {
    duration: 5000,
  });
}
