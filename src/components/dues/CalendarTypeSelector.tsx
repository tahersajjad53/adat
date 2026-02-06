import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CalendarType } from '@/types/dues';

interface CalendarTypeSelectorProps {
  value: CalendarType;
  onChange: (type: CalendarType) => void;
  disabled?: boolean;
}

const CalendarTypeSelector: React.FC<CalendarTypeSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        Calendar Type
      </label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange('hijri')}
          className={cn(
            'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            value === 'hijri'
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:border-muted-foreground/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Moon
            className={cn(
              'h-6 w-6',
              value === 'hijri' ? 'text-primary' : 'text-muted-foreground'
            )}
          />
          <div className="text-center">
            <p
              className={cn(
                'font-medium text-sm',
                value === 'hijri' ? 'text-primary' : 'text-foreground'
              )}
            >
              Hijri
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Islamic calendar
            </p>
          </div>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange('gregorian')}
          className={cn(
            'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            value === 'gregorian'
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:border-muted-foreground/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Sun
            className={cn(
              'h-6 w-6',
              value === 'gregorian' ? 'text-primary' : 'text-muted-foreground'
            )}
          />
          <div className="text-center">
            <p
              className={cn(
                'font-medium text-sm',
                value === 'gregorian' ? 'text-primary' : 'text-foreground'
              )}
            >
              Gregorian
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Salary-aligned
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default CalendarTypeSelector;
