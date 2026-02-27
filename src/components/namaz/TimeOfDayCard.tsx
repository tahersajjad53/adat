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

// Illustrated SVG scenes for each prayer time
const PrayerScene: React.FC<{ variant: AllPrayerName | null }> = ({ variant }) => {
  const baseClasses = "absolute pointer-events-none bottom-0 right-0";
  
  switch (variant) {
    case 'fajr':
      // Mosque silhouette on horizon with rising sun and birds
      return (
        <svg className={cn(baseClasses, "w-full h-full opacity-20")} viewBox="0 0 200 100" preserveAspectRatio="xMaxYMax meet">
          <g fill="currentColor" className="text-white">
            {/* Sun half-circle on horizon */}
            <circle cx="160" cy="72" r="18" opacity="0.6" />
            {/* Light rays */}
            <line x1="160" y1="45" x2="160" y2="35" stroke="currentColor" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
            <line x1="145" y1="50" x2="138" y2="42" stroke="currentColor" strokeWidth="1.5" opacity="0.35" strokeLinecap="round" />
            <line x1="175" y1="50" x2="182" y2="42" stroke="currentColor" strokeWidth="1.5" opacity="0.35" strokeLinecap="round" />
            <line x1="135" y1="60" x2="126" y2="56" stroke="currentColor" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
            <line x1="185" y1="60" x2="194" y2="56" stroke="currentColor" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
            {/* Mosque silhouette */}
            <rect x="55" y="55" width="30" height="17" rx="0" />
            <path d="M60,55 L70,42 L80,55" /> {/* dome */}
            <rect x="67" y="32" width="6" height="12" /> {/* minaret */}
            <circle cx="70" cy="30" r="3" /> {/* minaret top */}
            <rect x="50" y="55" width="5" height="17" /> {/* left wall */}
            <rect x="85" y="58" width="5" height="14" /> {/* right annex */}
            {/* Horizon line */}
            <rect x="0" y="71" width="200" height="1.5" opacity="0.3" />
            {/* Ground */}
            <rect x="0" y="72" width="200" height="28" opacity="0.15" />
            {/* Birds */}
            <path d="M110,25 Q113,22 116,25" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
            <path d="M125,18 Q127,16 129,18" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            <path d="M100,32 Q102,30 104,32" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
          </g>
        </svg>
      );
    
    case 'dhuhr':
      // Islamic geometric star mandala
      return (
        <svg className={cn(baseClasses, "w-36 h-36 opacity-15")} viewBox="0 0 100 100">
          <g fill="none" stroke="currentColor" strokeWidth="1" className="text-white">
            {/* Outer ring */}
            <circle cx="50" cy="50" r="45" opacity="0.3" />
            <circle cx="50" cy="50" r="40" opacity="0.2" />
            {/* 8-pointed star */}
            <polygon points="50,8 56,38 88,30 62,50 88,70 56,62 50,92 44,62 12,70 38,50 12,30 44,38" opacity="0.5" fill="currentColor" />
            {/* Inner star */}
            <polygon points="50,22 54,42 74,38 58,50 74,62 54,58 50,78 46,58 26,62 42,50 26,38 46,42" opacity="0.4" fill="currentColor" />
            {/* Center */}
            <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.6" />
            {/* Decorative dots on outer ring */}
            <circle cx="50" cy="5" r="2" fill="currentColor" opacity="0.4" />
            <circle cx="82" cy="18" r="2" fill="currentColor" opacity="0.4" />
            <circle cx="95" cy="50" r="2" fill="currentColor" opacity="0.4" />
            <circle cx="82" cy="82" r="2" fill="currentColor" opacity="0.4" />
            <circle cx="50" cy="95" r="2" fill="currentColor" opacity="0.4" />
            <circle cx="18" cy="82" r="2" fill="currentColor" opacity="0.4" />
            <circle cx="5" cy="50" r="2" fill="currentColor" opacity="0.4" />
            <circle cx="18" cy="18" r="2" fill="currentColor" opacity="0.4" />
          </g>
        </svg>
      );
    
    case 'asr':
      // Minaret with long shadow, low sun
      return (
        <svg className={cn(baseClasses, "w-full h-full opacity-18")} viewBox="0 0 200 100" preserveAspectRatio="xMaxYMax meet">
          <g fill="currentColor" className="text-white">
            {/* Low sun */}
            <circle cx="175" cy="45" r="14" opacity="0.35" />
            {/* Minaret */}
            <rect x="140" y="30" width="8" height="42" opacity="0.7" />
            <path d="M139,30 L144,18 L149,30" opacity="0.7" /> {/* pointed top */}
            <circle cx="144" cy="16" r="2.5" opacity="0.6" /> {/* finial */}
            <rect x="137" y="50" width="14" height="3" rx="1" opacity="0.5" /> {/* balcony */}
            {/* Long diagonal shadow */}
            <polygon points="140,72 148,72 90,85 82,85" opacity="0.15" />
            {/* Ground */}
            <rect x="0" y="71" width="200" height="1" opacity="0.25" />
            <rect x="0" y="72" width="200" height="28" opacity="0.1" />
            {/* Small building silhouettes */}
            <rect x="155" y="60" width="18" height="12" opacity="0.3" />
            <rect x="160" y="55" width="8" height="5" opacity="0.25" />
            <rect x="120" y="63" width="12" height="9" opacity="0.25" />
          </g>
        </svg>
      );
    
    case 'maghrib':
      // Layered cityscape with half-sunk sun
      return (
        <svg className={cn(baseClasses, "w-full h-full opacity-20")} viewBox="0 0 200 100" preserveAspectRatio="xMaxYMax meet">
          <g fill="currentColor" className="text-white">
            {/* Large setting sun */}
            <circle cx="140" cy="68" r="22" opacity="0.4" />
            {/* Sky bands */}
            <rect x="0" y="58" width="200" height="2" opacity="0.1" />
            <rect x="0" y="63" width="200" height="1.5" opacity="0.08" />
            {/* Mountain/cityscape layers */}
            <path d="M0,75 Q25,60 50,68 Q70,58 95,65 Q120,55 140,62 Q160,58 180,63 Q190,60 200,65 L200,100 L0,100 Z" opacity="0.3" />
            <path d="M0,80 Q30,72 60,76 Q80,70 110,74 Q130,68 160,73 Q180,70 200,75 L200,100 L0,100 Z" opacity="0.2" />
            {/* Minaret in cityscape */}
            <rect x="90" y="55" width="5" height="20" opacity="0.4" />
            <path d="M89,55 L92.5,47 L96,55" opacity="0.4" />
            {/* Dome */}
            <path d="M60,68 Q65,60 70,68" opacity="0.35" />
          </g>
        </svg>
      );
    
    case 'isha':
      // Ornate crescent with arabesque pattern and stars
      return (
        <svg className={cn(baseClasses, "w-40 h-40 opacity-18")} viewBox="0 0 100 100">
          <g fill="currentColor" className="text-white">
            {/* Large crescent */}
            <path d="M55,10 A38,38 0 1,1 55,90 A28,28 0 1,0 55,10" opacity="0.4" />
            {/* Geometric fill inside crescent area */}
            <path d="M30,50 L35,40 L40,50 L35,60 Z" opacity="0.2" />
            <path d="M22,40 L27,30 L32,40 L27,50 Z" opacity="0.15" />
            <path d="M22,60 L27,50 L32,60 L27,70 Z" opacity="0.15" />
            {/* 8-pointed stars */}
            <polygon points="80,20 82,25 87,25 83,28 85,33 80,30 75,33 77,28 73,25 78,25" opacity="0.5" />
            <polygon points="90,50 91,53 94,53 92,55 93,58 90,56 87,58 88,55 86,53 89,53" opacity="0.4" />
            <polygon points="75,75 76,77 78,77 77,79 78,81 75,80 72,81 73,79 72,77 74,77" opacity="0.35" />
            {/* Small dots */}
            <circle cx="85" cy="35" r="1.2" opacity="0.3" />
            <circle cx="70" cy="15" r="1" opacity="0.25" />
            <circle cx="92" cy="68" r="1" opacity="0.25" />
            <circle cx="65" cy="85" r="1.2" opacity="0.2" />
          </g>
        </svg>
      );
    
    case 'nisfulLayl':
      // Constellation pattern with nebula glow
      return (
        <svg className={cn(baseClasses, "w-44 h-44 opacity-20")} viewBox="0 0 100 100">
          <defs>
            <radialGradient id="nebula" cx="60%" cy="40%" r="40%">
              <stop offset="0%" stopColor="white" stopOpacity="0.15" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g className="text-white">
            {/* Nebula glow */}
            <circle cx="60" cy="40" r="35" fill="url(#nebula)" />
            {/* Constellation dots */}
            <circle cx="30" cy="25" r="2.5" fill="currentColor" opacity="0.6" />
            <circle cx="50" cy="15" r="2" fill="currentColor" opacity="0.5" />
            <circle cx="70" cy="30" r="3" fill="currentColor" opacity="0.7" />
            <circle cx="55" cy="50" r="2" fill="currentColor" opacity="0.5" />
            <circle cx="80" cy="55" r="2.5" fill="currentColor" opacity="0.55" />
            <circle cx="40" cy="70" r="2" fill="currentColor" opacity="0.45" />
            <circle cx="65" cy="75" r="2.5" fill="currentColor" opacity="0.5" />
            <circle cx="85" cy="80" r="1.5" fill="currentColor" opacity="0.35" />
            {/* Constellation lines */}
            <line x1="30" y1="25" x2="50" y2="15" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
            <line x1="50" y1="15" x2="70" y2="30" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
            <line x1="70" y1="30" x2="55" y2="50" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
            <line x1="55" y1="50" x2="80" y2="55" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
            <line x1="55" y1="50" x2="40" y2="70" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
            <line x1="40" y1="70" x2="65" y2="75" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
            <line x1="80" y1="55" x2="85" y2="80" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
            {/* Tiny scattered stars */}
            <circle cx="15" cy="45" r="1" fill="currentColor" opacity="0.3" />
            <circle cx="90" cy="20" r="1" fill="currentColor" opacity="0.25" />
            <circle cx="20" cy="85" r="1" fill="currentColor" opacity="0.2" />
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
      <PrayerScene variant={currentPrayer} />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
