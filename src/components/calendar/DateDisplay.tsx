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
}

export function DateDisplay({ className, showLocation = false, compact = false }: DateDisplayProps) {
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

  if (isLoading || !currentDate) {
    return (
      <div className={cn('flex items-center gap-2 text-muted-foreground', className)}>
        <Refresh className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading calendar...</span>
      </div>
    );
  }

  const hijriFormatted = formatHijriDate(currentDate.hijri, 'long');
  const gregorianFormatted = formatGregorianDate(currentDate.gregorian, compact ? 'short' : 'long');

  if (compact) {
    return (
      <div className={cn('flex flex-col', className)}>
        <div className="flex items-center gap-2">
          {currentDate.isAfterMaghrib ? (
            <HalfMoon className="h-4 w-4 text-primary" />
          ) : (
            <SunLight className="h-4 w-4 text-accent-foreground" />
          )}
          <span className="font-display font-semibold">{hijriFormatted}</span>
        </div>
        <span className="text-sm text-muted-foreground">{gregorianFormatted}</span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Hijri Date - Prominent */}
      <div className="flex items-center gap-3">
        {currentDate.isAfterMaghrib ? (
          <HalfMoon className="h-5 w-5 text-primary" />
        ) : (
          <SunLight className="h-5 w-5 text-accent-foreground" />
        )}
        <div>
          <p className="text-2xl font-display font-bold tracking-tight">
            {hijriFormatted}
          </p>
          <p className="text-sm text-muted-foreground font-medium" dir="rtl">
            {currentDate.hijri.day} {currentDate.hijri.monthNameArabic} {currentDate.hijri.year}
          </p>
        </div>
      </div>

      {/* Gregorian Date - Secondary */}
      <p className="text-sm text-muted-foreground">
        {gregorianFormatted}
      </p>

      {/* Maghrib Status */}
      {maghribTime && (
        <p className="text-xs text-muted-foreground">
          {currentDate.isAfterMaghrib ? (
            <>Maghrib was at {maghribTime} · New Islamic day began</>
          ) : (
            <>Maghrib at {maghribTime}</>
          )}
        </p>
      )}

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
