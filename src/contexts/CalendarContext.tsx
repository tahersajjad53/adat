/**
 * Calendar Context
 * 
 * Provides global access to current Hijri/Gregorian dates
 * with automatic Maghrib-based day transition handling
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { DualDate, getAdjustedHijriDate } from '@/lib/hijri';
import { fetchMaghribTime, Location, DEFAULT_LOCATION, getCurrentLocation } from '@/lib/prayerTimes';
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
        .single();

      if (fetchError) throw fetchError;

      if (data?.latitude && data?.longitude) {
        setLocationState({
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city || undefined,
          timezone: data.timezone || undefined,
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

  // Fetch Maghrib time and update current date
  const refreshDate = useCallback(async () => {
    if (!location) return;

    try {
      setIsLoading(true);
      setError(null);

      const now = new Date();
      const maghrib = await fetchMaghribTime(now, location);
      setMaghribTime(maghrib);

      const dualDate = getAdjustedHijriDate(now, maghrib);
      setCurrentDate(dualDate);
    } catch (err) {
      console.error('Failed to refresh date:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prayer times');
      
      // Fallback: show date without Maghrib adjustment
      const dualDate = getAdjustedHijriDate(new Date(), null);
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
