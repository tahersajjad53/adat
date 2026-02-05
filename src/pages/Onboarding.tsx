import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AuthLayout from '@/components/auth/AuthLayout';
import LocationSelector from '@/components/profile/LocationSelector';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { type City, findCityById } from '@/data/cities';
import { Loader2 } from 'lucide-react';

const Onboarding: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCity, setSelectedCity] = useState<City | undefined>();
  const [customCoords, setCustomCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [fullName, setFullName] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (data?.full_name) {
          setFullName(data.full_name);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleLocationChange = (city: City | null, coords?: { latitude: number; longitude: number }) => {
    if (city) {
      setSelectedCity(city);
      setCustomCoords(null);
    } else if (coords) {
      setCustomCoords(coords);
      setSelectedCity(undefined);
    }
  };

  const handleContinue = async () => {
    if (!user) return;

    const locationData = selectedCity 
      ? {
          latitude: selectedCity.latitude,
          longitude: selectedCity.longitude,
          city: selectedCity.name,
          timezone: selectedCity.timezone,
        }
      : customCoords 
        ? {
            latitude: customCoords.latitude,
            longitude: customCoords.longitude,
            city: 'Custom Location',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }
        : null;

    if (!locationData) {
      toast({
        title: 'Please select a location',
        description: 'We need your location to show accurate prayer times.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id,
        ...locationData,
        updated_at: new Date().toISOString()
      });

    setSaving(false);

    if (error) {
      toast({
        title: 'Error saving location',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Location saved!',
      description: 'Your prayer times will now be accurate for your location.',
    });

    navigate('/dashboard');
  };

  const handleSkip = async () => {
    if (!user) return;

    // Default to Mecca
    const mecca = findCityById('mecca');
    if (!mecca) return;

    setSaving(true);

    await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        latitude: mecca.latitude,
        longitude: mecca.longitude,
        city: mecca.name,
        timezone: mecca.timezone,
        updated_at: new Date().toISOString()
      });

    setSaving(false);
    navigate('/dashboard');
  };

  const displayName = fullName || user?.email?.split('@')[0] || 'there';

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight font-display">
            Welcome, {displayName}! 👋
          </h1>
          <p className="text-muted-foreground">
            Select your location to get accurate prayer times. This helps us calculate Maghrib for the Hijri calendar transition.
          </p>
        </div>

        <div className="space-y-4">
          <LocationSelector
            value={selectedCity}
            onChange={handleLocationChange}
          />

          {customCoords && (
            <p className="text-sm text-muted-foreground">
              📍 Using GPS coordinates: {customCoords.latitude.toFixed(4)}, {customCoords.longitude.toFixed(4)}
            </p>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <Button 
            onClick={handleContinue} 
            className="w-full"
            disabled={saving || (!selectedCity && !customCoords)}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue to Dashboard'
            )}
          </Button>

          <Button 
            variant="ghost" 
            onClick={handleSkip}
            disabled={saving}
            className="w-full text-muted-foreground"
          >
            Skip for now (defaults to Mecca)
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Onboarding;
