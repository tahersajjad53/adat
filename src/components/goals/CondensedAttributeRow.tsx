import React from 'react';
import { cn } from '@/lib/utils';

interface CondensedAttributeRowProps {
  icon: React.ReactNode;
  label?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const CondensedAttributeRow: React.FC<CondensedAttributeRowProps> = ({
  icon,
  label,
  children,
  className,
}) => (
  <div
    className={cn(
      'flex items-center gap-3 min-h-9',
      className,
    )}
  >
    <span className="shrink-0 text-muted-foreground" aria-hidden>
      {icon}
    </span>
    {label != null && (
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
    )}
    <div className="flex-1 min-w-0">{children}</div>
  </div>
);

export default CondensedAttributeRow;
