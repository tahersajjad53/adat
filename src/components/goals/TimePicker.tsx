import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

/** Generate 15-minute time slots from 00:00 to 23:45 */
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

/** Convert HH:mm to 12h display e.g. "9:45 AM" */
function formatTime24To12(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr || '0', 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

/** Parse user input (e.g. "9:45", "9:45 am", "945") to HH:mm or null */
function parseTimeInput(input: string): string | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!match) return null;

  let h = parseInt(match[1], 10);
  const m = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3];

  if (h < 0 || h > 23 || m < 0 || m > 59) return null;

  if (period === 'pm') {
    if (h !== 12) h += 12;
  } else if (period === 'am') {
    if (h === 12) h = 0;
  } else {
    // No period: 1-12 = AM (12 = noon), 13-23 = 24h
    if (h > 12 && h <= 23) {
      // Already 24h
    } else if (h === 0 || h > 23) {
      return null;
    }
    // 1-12 stays as-is for AM
  }

  const hour24 = h % 24;
  const minute = Math.round(m / 15) * 15;
  if (minute === 60) {
    return `${((hour24 + 1) % 24).toString().padStart(2, '0')}:00`;
  }
  return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

interface TimePickerProps {
  value: string | null; // HH:mm
  onChange: (value: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'Add time',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value ? formatTime24To12(value) : '');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value ? formatTime24To12(value) : '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        if (value) {
          setInputValue(formatTime24To12(value));
        } else {
          setInputValue('');
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const handleSelect = (slot: string) => {
    onChange(slot);
    setInputValue(formatTime24To12(slot));
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInputValue(v);
    const parsed = parseTimeInput(v);
    if (parsed) {
      onChange(parsed);
    } else if (!v.trim()) {
      onChange(null);
    }
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      const parsed = parseTimeInput(inputValue);
      if (parsed) {
        onChange(parsed);
        setInputValue(formatTime24To12(parsed));
      } else {
        if (value) setInputValue(formatTime24To12(value));
        else setInputValue('');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        autoComplete="off"
      />
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-md border bg-popover py-1 shadow-md">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => handleSelect(slot)}
              className={cn(
                'w-full px-3 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground',
                value === slot && 'bg-accent text-accent-foreground',
              )}
            >
              {formatTime24To12(slot)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimePicker;
