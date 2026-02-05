import React from 'react';
import { cn } from '@/lib/utils';
import { AllPrayerName } from '@/hooks/usePrayerTimes';

interface TimeOfDayCardProps {
  currentPrayer: AllPrayerName | null;
  children: React.ReactNode;
  className?: string;
}

const GRADIENT_CLASSES: Record<AllPrayerName | 'default', string> = {
  fajr: 'gradient-fajr',
  dhuhr: 'gradient-zuhr',
  asr: 'gradient-asr',
  maghrib: 'gradient-maghrib',
  isha: 'gradient-isha',
  nisfulLayl: 'gradient-nisful-layl',
  default: 'gradient-fajr',
};

// Geometric SVG shapes for each prayer time
const GeometricShape: React.FC<{ variant: AllPrayerName | null }> = ({ variant }) => {
  const baseClasses = "absolute pointer-events-none opacity-15";
  
  switch (variant) {
    case 'fajr':
      // Diamond/star shapes for dawn
      return (
        <svg className={cn(baseClasses, "bottom-0 right-0 w-32 h-32")} viewBox="0 0 100 100">
          <polygon 
            points="50,5 61,40 95,40 68,60 79,95 50,75 21,95 32,60 5,40 39,40" 
            fill="currentColor" 
            className="text-white"
          />
          <polygon 
            points="50,25 56,42 75,42 60,52 66,70 50,58 34,70 40,52 25,42 44,42" 
            fill="currentColor" 
            className="text-white opacity-50"
          />
        </svg>
      );
    
    case 'dhuhr':
      // Angular sun rays for midday
      return (
        <svg className={cn(baseClasses, "bottom-0 right-0 w-36 h-36")} viewBox="0 0 100 100">
          <g fill="currentColor" className="text-white">
            <rect x="45" y="5" width="10" height="25" transform="rotate(0 50 50)" />
            <rect x="45" y="5" width="10" height="25" transform="rotate(45 50 50)" />
            <rect x="45" y="5" width="10" height="25" transform="rotate(90 50 50)" />
            <rect x="45" y="5" width="10" height="25" transform="rotate(135 50 50)" />
            <rect x="45" y="5" width="10" height="25" transform="rotate(180 50 50)" />
            <rect x="45" y="5" width="10" height="25" transform="rotate(225 50 50)" />
            <rect x="45" y="5" width="10" height="25" transform="rotate(270 50 50)" />
            <rect x="45" y="5" width="10" height="25" transform="rotate(315 50 50)" />
            <circle cx="50" cy="50" r="15" />
          </g>
        </svg>
      );
    
    case 'asr':
      // Chevron angles for afternoon
      return (
        <svg className={cn(baseClasses, "bottom-0 right-0 w-40 h-32")} viewBox="0 0 120 100">
          <g fill="none" stroke="currentColor" strokeWidth="4" className="text-white">
            <polyline points="20,80 60,40 100,80" />
            <polyline points="30,90 60,60 90,90" />
            <polyline points="10,70 60,20 110,70" />
          </g>
        </svg>
      );
    
    case 'maghrib':
      // Overlapping circles for sunset
      return (
        <svg className={cn(baseClasses, "bottom-0 right-0 w-36 h-36")} viewBox="0 0 100 100">
          <g fill="currentColor" className="text-white">
            <circle cx="30" cy="70" r="25" opacity="0.6" />
            <circle cx="55" cy="55" r="20" opacity="0.8" />
            <circle cx="75" cy="75" r="22" opacity="0.5" />
            <circle cx="50" cy="80" r="15" opacity="0.7" />
          </g>
        </svg>
      );
    
    case 'isha':
      // Crescent form for night
      return (
        <svg className={cn(baseClasses, "bottom-0 right-0 w-32 h-32")} viewBox="0 0 100 100">
          <g fill="currentColor" className="text-white">
            <path d="M50,10 A40,40 0 1,1 50,90 A30,30 0 1,0 50,10" />
            <circle cx="75" cy="25" r="3" />
            <circle cx="85" cy="45" r="2" />
            <circle cx="80" cy="65" r="2.5" />
          </g>
        </svg>
      );
    
    case 'nisfulLayl':
      // Geometric stars for midnight
      return (
        <svg className={cn(baseClasses, "bottom-0 right-0 w-40 h-40")} viewBox="0 0 100 100">
          <g fill="currentColor" className="text-white">
            <polygon points="50,5 53,15 63,15 55,22 58,32 50,26 42,32 45,22 37,15 47,15" />
            <polygon points="25,35 27,42 34,42 29,47 31,54 25,50 19,54 21,47 16,42 23,42" />
            <polygon points="75,45 77,52 84,52 79,57 81,64 75,60 69,64 71,57 66,52 73,52" />
            <polygon points="40,65 42,72 49,72 44,77 46,84 40,80 34,84 36,77 31,72 38,72" />
            <polygon points="70,75 71,79 75,79 72,82 73,86 70,84 67,86 68,82 65,79 69,79" />
          </g>
        </svg>
      );
    
    default:
      return null;
  }
};

export const TimeOfDayCard: React.FC<TimeOfDayCardProps> = ({
  currentPrayer,
  children,
  className,
}) => {
  const gradientClass = currentPrayer 
    ? GRADIENT_CLASSES[currentPrayer] 
    : GRADIENT_CLASSES.default;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl p-5',
        gradientClass,
        className
      )}
    >
      {/* Decorative geometric shape */}
      <GeometricShape variant={currentPrayer} />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
