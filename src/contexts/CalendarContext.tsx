/**
 * Calendar Context
 * 
 * Provides global access to current Hijri/Gregorian dates
 * with automatic Maghrib-based day transition handling.
 * Uses Bohra tabular calendar engine for Hijri dates
 * and Aladhan API only for prayer times.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { DualDate, gregorianToBohra, advanceHijriDay, isAfterMaghrib } from '@/lib/hijri';
import { fetchPrayerTimesWithHijri, Location, DEFAULT_LOCATION, getCurrentLocation } from '@/lib/prayerTimes';
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
        let timezone = data.timezone;
        if (!timezone) {
          timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
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

  // Fetch prayer times and compute Hijri dates locally
  const refreshDate = useCallback(async () => {
    if (!location) return;

    try {
      setIsLoading(true);
      setError(null);

      const now = new Date();
      const { timings } = await fetchPrayerTimesWithHijri(now, location);
      const maghrib = timings.Maghrib.split(' ')[0];
      setMaghribTime(maghrib);

      // Compute Hijri dates using deterministic Bohra engine (no Aladhan Hijri needed)
      const afterMaghrib = isAfterMaghrib(now, maghrib, location.timezone);
      const preMaghribHijri = gregorianToBohra(now, location.timezone);
      const postMaghribHijri = advanceHijriDay(preMaghribHijri);

      const dualDate: DualDate = {
        gregorian: now,
        hijri: afterMaghrib ? postMaghribHijri : preMaghribHijri,
        preMaghribHijri,
        postMaghribHijri,
        isAfterMaghrib: afterMaghrib,
      };

      setCurrentDate(dualDate);
    } catch (err) {
      console.error('Failed to refresh date:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prayer times');

      // Fallback: compute Hijri without Maghrib check
      const now = new Date();
      const preMaghribHijri = gregorianToBohra(now, location?.timezone);
      const postMaghribHijri = advanceHijriDay(preMaghribHijri);
      setCurrentDate({
        gregorian: now,
        hijri: preMaghribHijri,
        preMaghribHijri,
        postMaghribHijri,
        isAfterMaghrib: false,
      });
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
    }, 60000);

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
