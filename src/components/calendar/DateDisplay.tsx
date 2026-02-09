/**
 * DateDisplay Component
 * 
 * Shows both Gregorian and Hijri dates
 * with Hijri date prominently displayed
 */

import React from 'react';
import { useCalendar } from '@/contexts/CalendarContext';
import { formatHijriDate, formatGregorianDate } from '@/lib/hijri';
import { HalfMoon, SunLight, MapPin, Refresh } from 'iconoir-react';
import { cn } from '@/lib/utils';

interface DateDisplayProps {
  className?: string;
  showLocation?: boolean;
  compact?: boolean;
  variant?: 'default' | 'light';
}

export function DateDisplay({ className, showLocation = false, compact = false, variant = 'default' }: DateDisplayProps) {
  const { currentDate, location, maghribTime, isLoading } = useCalendar();

  // DEV-only debug logging to verify timezone and date calculation
  if (import.meta.env.DEV && currentDate) {
    console.log('[DateDisplay] Debug:', {
      timezone: location?.timezone,
      maghribTime,
      isAfterMaghrib: currentDate.isAfterMaghrib,
      gregorianISO: currentDate.gregorian.toISOString(),
      hijriDate: `${currentDate.hijri.day} ${currentDate.hijri.monthName} ${currentDate.hijri.year}`,
    });
  }

  const isLight = variant === 'light';

  if (isLoading || !currentDate) {
    return (
      <div className={cn('flex items-center gap-2', isLight ? 'text-white/70' : 'text-muted-foreground', className)}>
        <Refresh className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading calendar...</span>
      </div>
    );
  }

  const hijriFormatted = formatHijriDate(currentDate.hijri, 'long');
  const gregorianFormatted = formatGregorianDate(currentDate.gregorian, compact ? 'short' : 'long');

  if (compact) {
    return (
      <div className={cn('flex flex-col items-start', className)}>
        <div className="flex items-center gap-2">
          {currentDate.isAfterMaghrib ? (
            <HalfMoon className={cn("h-4 w-4", isLight ? "text-white" : "text-primary")} />
          ) : (
            <SunLight className={cn("h-4 w-4", isLight ? "text-white" : "text-accent-foreground")} />
          )}
          <span className={cn("font-display font-semibold text-sm sm:text-base whitespace-nowrap", isLight && "text-white")}>{hijriFormatted}</span>
        </div>
        <span className={cn("text-xs font-semibold uppercase tracking-widest whitespace-nowrap", isLight ? "text-white/80" : "text-muted-foreground")}>
          {gregorianFormatted}{location?.city ? ` · ${location.city}` : ''}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center space-y-1', className)}>
      {/* Hijri Date - Prominent */}
      <div className="flex items-center gap-2">
        {currentDate.isAfterMaghrib ? (
          <HalfMoon className="h-5 w-5 text-primary" />
        ) : (
          <SunLight className="h-5 w-5 text-accent-foreground" />
        )}
        <p className="text-3xl font-display font-bold tracking-tight">
          {hijriFormatted}
        </p>
      </div>

      {/* Gregorian Date */}
      <p className="text-sm text-muted-foreground">
        {gregorianFormatted}
      </p>

      {/* Location */}
      {showLocation && location?.city && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{location.city}</span>
        </div>
      )}
    </div>
  );
}
