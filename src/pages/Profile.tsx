import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import LocationSelector from '@/components/profile/LocationSelector';
import { CITIES, type City } from '@/data/cities';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import adatLogo from '@/assets/adat-logo.svg';
import { fetchMaghribTime } from '@/lib/prayerTimes';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | undefined>();
  const [customCoords, setCustomCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [maghribTime, setMaghribTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, latitude, longitude, city, timezone')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        setFullName(data.full_name || '');
        
        if (data.latitude && data.longitude) {
          // Try to find matching city
          const matchingCity = CITIES.find(
            city => city.latitude === data.latitude && city.longitude === data.longitude
          );
          
          if (matchingCity) {
            setSelectedCity(matchingCity);
          } else {
            setCustomCoords({ latitude: data.latitude, longitude: data.longitude });
          }
        }
      }

      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  // Fetch Maghrib time when location changes
  useEffect(() => {
    const getMaghrib = async () => {
      const lat = selectedCity?.latitude || customCoords?.latitude;
      const lon = selectedCity?.longitude || customCoords?.longitude;
      
      if (lat && lon) {
        const time = await fetchMaghribTime(new Date(), { latitude: lat, longitude: lon });
        setMaghribTime(time);
      } else {
        setMaghribTime(null);
      }
    };

    getMaghrib();
  }, [selectedCity, customCoords]);

  const handleLocationChange = (city: City | null, coords?: { latitude: number; longitude: number }) => {
    if (city) {
      setSelectedCity(city);
      setCustomCoords(null);
    } else if (coords) {
      setCustomCoords(coords);
      setSelectedCity(undefined);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

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
        : {};

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: fullName,
        ...locationData,
        updated_at: new Date().toISOString(),
      });

    setSaving(false);

    if (error) {
      toast({
        title: 'Error saving profile',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Profile updated',
      description: 'Your changes have been saved successfully.',
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={adatLogo} alt="Adat" className="h-8 w-auto" />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8">
        <div className="max-w-xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-display">Profile Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account and location preferences.</p>
          </div>

          {/* Personal Info Section */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Personal Information</h2>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>
          </section>

          {/* Location Section */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Location Settings</h2>
            <p className="text-sm text-muted-foreground">
              Your location is used to calculate accurate prayer times.
            </p>
            
            <LocationSelector
              value={selectedCity}
              onChange={handleLocationChange}
            />

            {customCoords && (
              <p className="text-sm text-muted-foreground">
                📍 Using GPS coordinates: {customCoords.latitude.toFixed(4)}, {customCoords.longitude.toFixed(4)}
              </p>
            )}
          </section>

          {/* Prayer Times Preview */}
          {(selectedCity || customCoords) && (
            <section className="p-4 border border-border rounded-lg bg-muted/30">
              <h3 className="font-medium mb-2">Prayer Times Preview</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Today's Maghrib:</span>
                <span className="font-medium">
                  {maghribTime || 'Loading...'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                The Hijri date changes at Maghrib time.
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
