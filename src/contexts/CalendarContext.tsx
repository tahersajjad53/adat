/**
 * Calendar Context
 * 
 * Provides global access to current Hijri/Gregorian dates
 * with automatic Maghrib-based day transition handling
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { DualDate, HijriDate, isAfterMaghrib, advanceHijriDay } from '@/lib/hijri';
import { fetchPrayerTimesWithHijri, Location, DEFAULT_LOCATION, getCurrentLocation, AladhanHijriDate } from '@/lib/prayerTimes';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CalendarContextType {
  currentDate: DualDate | null;
  location: Location | null;
  maghribTime: string | null;
  isLoading: boolean;
  error: string | null;
  refreshDate: () => Promise<void>;
  setLocation: (location: Location) => Promise<void>;
  requestLocationPermission: () => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState<DualDate | null>(null);
  const [location, setLocationState] = useState<Location | null>(null);
  const [maghribTime, setMaghribTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's saved location from profile
  const loadUserLocation = useCallback(async () => {
    if (!user) {
      // Use default location for non-authenticated users
      setLocationState(DEFAULT_LOCATION);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('latitude, longitude, city, timezone')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching profile location:', fetchError);
        setLocationState(DEFAULT_LOCATION);
        return;
      }

      if (data?.latitude && data?.longitude) {
        // Backfill timezone if missing - use browser's timezone as fallback
        let timezone = data.timezone;
        if (!timezone) {
          timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          // Persist the backfilled timezone to the profile
          supabase
            .from('profiles')
            .update({ timezone })
            .eq('id', user.id)
            .then(({ error }) => {
              if (error) console.error('Failed to backfill timezone:', error);
            });
        }
        
        setLocationState({
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city || undefined,
          timezone,
        });
      } else {
        // No saved location, use default
        setLocationState(DEFAULT_LOCATION);
      }
    } catch (err) {
      console.error('Failed to load user location:', err);
      setLocationState(DEFAULT_LOCATION);
    }
  }, [user]);

  // Save location to user profile
  const setLocation = useCallback(async (newLocation: Location) => {
    setLocationState(newLocation);

    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
            city: newLocation.city || null,
            timezone: newLocation.timezone || null,
          })
          .eq('id', user.id);
      } catch (err) {
        console.error('Failed to save location:', err);
      }
    }
  }, [user]);

  // Request browser location permission
  const requestLocationPermission = useCallback(async () => {
    try {
      setIsLoading(true);
      const browserLocation = await getCurrentLocation();
      await setLocation(browserLocation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
    } finally {
      setIsLoading(false);
    }
  }, [setLocation]);

  // Fetch prayer times with Hijri date and update current date
  const refreshDate = useCallback(async () => {
    if (!location) return;

    try {
      setIsLoading(true);
      setError(null);

      const now = new Date();
      const { timings, hijri: aladhanHijri } = await fetchPrayerTimesWithHijri(now, location);
      const maghrib = timings.Maghrib.split(' ')[0]; // Remove timezone info
      setMaghribTime(maghrib);

      // Check if after Maghrib
      const afterMaghrib = isAfterMaghrib(now, maghrib, location.timezone);
      
      // Convert Aladhan Hijri to our HijriDate format
      let hijri: HijriDate = {
        day: aladhanHijri.day,
        month: aladhanHijri.month,
        year: aladhanHijri.year,
        monthName: aladhanHijri.monthNameEn,
        monthNameArabic: aladhanHijri.monthNameAr,
      };
      
      // Bohra sunset rule: If after Maghrib, advance the Hijri day by 1
      if (afterMaghrib) {
        hijri = advanceHijriDay(hijri);
      }
      
      const dualDate: DualDate = {
        gregorian: now,
        hijri,
        isAfterMaghrib: afterMaghrib,
      };
      
      setCurrentDate(dualDate);
    } catch (err) {
      console.error('Failed to refresh date:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prayer times');
      
      // Fallback: show date without Maghrib adjustment (use Intl as fallback)
      const { getAdjustedHijriDate } = await import('@/lib/hijri');
      const dualDate = getAdjustedHijriDate(new Date(), null, location?.timezone);
      setCurrentDate(dualDate);
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  // Load location on mount and when user changes
  useEffect(() => {
    loadUserLocation();
  }, [loadUserLocation]);

  // Refresh date when location changes
  useEffect(() => {
    if (location) {
      refreshDate();
    }
  }, [location, refreshDate]);

  // Auto-refresh every minute to catch Maghrib transition
  useEffect(() => {
    const interval = setInterval(() => {
      if (location) {
        refreshDate();
      }
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [location, refreshDate]);

  return (
    <CalendarContext.Provider
      value={{
        currentDate,
        location,
        maghribTime,
        isLoading,
        error,
        refreshDate,
        setLocation,
        requestLocationPermission,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
}
