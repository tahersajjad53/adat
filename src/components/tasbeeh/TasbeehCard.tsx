import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

import type { TasbeehCounter } from '@/hooks/useTasbeehCounters';

const GRADIENTS = [
  ['hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'],
  ['hsl(263, 70%, 50%)', 'hsl(239, 84%, 67%)'],
  ['hsl(160, 84%, 39%)', 'hsl(188, 95%, 43%)'],
  ['hsl(330, 81%, 60%)', 'hsl(347, 77%, 50%)'],
];

interface TasbeehCardProps {
  counter: TasbeehCounter;
  index?: number;
  onDelete: (id: string) => void;
}

export function TasbeehCard({ counter, index = 0, onDelete }: TasbeehCardProps) {
  const navigate = useNavigate();
  const [start, end] = GRADIENTS[index % GRADIENTS.length];
  const gradientId = `tg-${counter.id.slice(0, 8)}`;

  const size = 72;
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = counter.target_count
    ? Math.min(1, counter.current_count / counter.target_count)
    : null;

  const dashOffset = progress !== null
    ? circumference * (1 - progress)
    : 0;

  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0 w-[76px]">
      <div className="relative">
        {/* Delete button */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(counter.id); }}
          className="absolute -top-1 -right-1 z-10 h-5 w-5 rounded-full bg-muted/90 backdrop-blur flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <X className="h-3 w-3" />
        </button>

        {/* Circle */}
        <div
          onClick={() => navigate(`/tasbeeh/${counter.id}`)}
          className="cursor-pointer relative"
          style={{ width: size, height: size }}
        >
          <svg width={size} height={size} className="absolute inset-0 -rotate-90">
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={start} />
                <stop offset="100%" stopColor={end} />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth={strokeWidth}
            />
            {/* Progress / full ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progress !== null ? dashOffset : 0}
              className="transition-all duration-300"
            />
          </svg>

          {/* Inner content */}
          <div className="absolute inset-[5px] rounded-full bg-card flex items-center justify-center">
            <span className="text-xl font-bold text-card-foreground tabular-nums leading-none" style={{ transform: 'translateY(0.05em)' }}>
              {counter.current_count}
            </span>
          </div>
        </div>
      </div>

      <span className="text-[11px] text-muted-foreground truncate w-full text-center leading-tight">
        {counter.title || 'Tasbeeh'}
      </span>
    </div>
  );
}
