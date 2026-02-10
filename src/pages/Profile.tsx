import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import LocationSelector from '@/components/profile/LocationSelector';
import DuesSection from '@/components/dues/DuesSection';
import { CITIES, type City } from '@/data/cities';
import { Refresh, FloppyDisk, LogOut, NavArrowRight, NavArrowLeft, User, Community } from 'iconoir-react';
import { fetchMaghribTime } from '@/lib/prayerTimes';

type ProfileSection = 'menu' | 'sabeel' | 'account';

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<ProfileSection>('menu');
  
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
      <div className="flex min-h-[50vh] items-center justify-center">
        <Refresh className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Sub-section: Account Information
  if (activeSection === 'account') {
    return (
      <div className="container py-8">
        <div className="max-w-xl mx-auto space-y-8">
          <button
            onClick={() => setActiveSection('menu')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <NavArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-display">Account</h1>
            <p className="text-base text-muted-foreground mt-1 font-normal">Manage your personal details and location.</p>
          </div>

          <section className="space-y-5">
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

          <section className="space-y-4">
            <h2 className="text-xl font-display font-semibold">Location</h2>
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

          {(selectedCity || customCoords) && (
            <section className="py-4 separator-dotted">
              <h3 className="font-display font-semibold mb-3">Prayer Times Preview</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Today's Maghrib</span>
                <span className="font-medium">{maghribTime || 'Loading...'}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                The Hijri date changes at Maghrib time.
              </p>
            </section>
          )}

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Refresh className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FloppyDisk className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Sub-section: Sabeel
  if (activeSection === 'sabeel') {
    return (
      <div className="container py-8">
        <div className="max-w-xl mx-auto space-y-6">
          <button
            onClick={() => setActiveSection('menu')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <NavArrowLeft className="h-4 w-4" />
            Back
          </button>

          <DuesSection />
        </div>
      </div>
    );
  }

  // Main menu
  return (
    <div className="container py-8">
      <div className="max-w-xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-display">Profile</h1>
          <p className="text-base text-muted-foreground mt-1 font-normal">Manage your account settings.</p>
        </div>

        <div>
          {/* Sabeel */}
          <button
            onClick={() => setActiveSection('sabeel')}
            className="w-full flex items-center justify-between py-5 separator-dotted transition-colors hover:bg-muted/30 -mx-2 px-2 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Community className="h-5 w-5 text-primary" />
              <div className="text-left">
                <span className="text-lg font-display font-semibold">Sabeel</span>
                <p className="text-sm text-muted-foreground">Manage dues and obligations</p>
              </div>
            </div>
            <NavArrowRight className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Account Information */}
          <button
            onClick={() => setActiveSection('account')}
            className="w-full flex items-center justify-between py-5 separator-dotted transition-colors hover:bg-muted/30 -mx-2 px-2 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <div className="text-left">
                <span className="text-lg font-display font-semibold">Account</span>
                <p className="text-sm text-muted-foreground">Name, email, and location settings</p>
              </div>
            </div>
            <NavArrowRight className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Sign Out */}
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 py-5 transition-colors hover:bg-destructive/5 -mx-2 px-2 rounded-lg text-destructive"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-lg font-display font-semibold">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
