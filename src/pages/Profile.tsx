import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import LocationSelector from '@/components/profile/LocationSelector';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

import { CITIES, type City } from '@/data/cities';
import { Refresh, FloppyDisk, LogOut, NavArrowRight, NavArrowLeft, User, DesignPencil, Bell } from 'iconoir-react';
import ThemeSelector from '@/components/profile/ThemeSelector';
import { initPushNotifications } from '@/utils/pushNotifications';

type ProfileSection = 'menu' | 'account' | 'theme' | 'notifications';

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<ProfileSection>('menu');
  
  const [fullName, setFullName] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | undefined>();
  const [customCoords, setCustomCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  
  const [pushEnabled, setPushEnabled] = useState(false);
  const [goalRemindersEnabled, setGoalRemindersEnabled] = useState(true);
  const [namazRemindersEnabled, setNamazRemindersEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, latitude, longitude, city, timezone, push_enabled, goal_reminders_enabled, namaz_reminders_enabled')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        setFullName(data.full_name || '');
        setGoalRemindersEnabled(data.goal_reminders_enabled !== false);
        setNamazRemindersEnabled(data.namaz_reminders_enabled === true);

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

      // Push enabled only if profile has push_enabled and permission granted
      if (Capacitor.getPlatform() !== 'web' && data) {
        const status = await PushNotifications.checkPermissions();
        const pushOn = data.push_enabled !== false;
        setPushEnabled(pushOn && status.receive === 'granted');
      }

      setLoading(false);
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

  const handleTogglePushEnabled = async (enabled: boolean) => {
    if (Capacitor.getPlatform() === 'web') {
      toast({
        title: 'Not available',
        description: 'Push notifications are only available on mobile devices.',
      });
      return;
    }

    if (enabled) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ push_enabled: true })
        .eq('id', user!.id);
      if (updateError) {
        toast({ title: 'Error', description: updateError.message, variant: 'destructive' });
        return;
      }
      await initPushNotifications();
      const status = await PushNotifications.checkPermissions();
      setPushEnabled(status.receive === 'granted');

      if (status.receive === 'granted') {
        toast({
          title: 'Push notifications enabled',
          description: 'You can now receive goal and namaz reminders.',
        });
      }
    } else {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ push_enabled: false, push_token: null })
        .eq('id', user!.id);
      if (updateError) {
        toast({ title: 'Error', description: updateError.message, variant: 'destructive' });
        return;
      }
      setPushEnabled(false);
      toast({
        title: 'Push notifications disabled',
        description: 'To completely stop notifications, please check your system settings.',
      });
    }
  };

  const handleToggleGoalReminders = async (enabled: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ goal_reminders_enabled: enabled })
      .eq('id', user!.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    setGoalRemindersEnabled(enabled);
    toast({
      title: enabled ? 'Goal reminders on' : 'Goal reminders off',
      description: enabled ? 'You will receive reminders for your goals at the times you set.' : 'You will not receive goal reminders.',
    });
  };

  const handleToggleNamazReminders = async (enabled: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ namaz_reminders_enabled: enabled })
      .eq('id', user!.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    setNamazRemindersEnabled(enabled);
    toast({
      title: enabled ? 'Namaz reminders on' : 'Namaz reminders off',
      description: enabled ? "You will receive alerts at each prayer time (e.g. It's time to pray Maghrib)." : 'You will not receive prayer time alerts.',
    });
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
        <div className="max-w-xl mx-auto space-y-6">
          <button
            onClick={() => setActiveSection('menu')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <NavArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div>
            <h1 className="text-4xl font-normal tracking-tight font-display">Account Information</h1>
            <p className="text-base text-muted-foreground mt-1 font-normal">Manage your personal details and location.</p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
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
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div>
                <h2 className="font-display tracking-tight font-normal text-lg">Location</h2>
                <p className="text-sm text-muted-foreground">
                  Your location is used to calculate accurate prayer times.
                </p>
              </div>
              
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
          </div>

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

  // Sub-section: Notifications
  if (activeSection === 'notifications') {
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

          <div>
            <h1 className="text-4xl font-normal tracking-tight font-display">Notifications</h1>
            <p className="text-base text-muted-foreground mt-1 font-normal">Manage how you receive updates.</p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Enable Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Required to receive any reminders on this device</p>
              </div>
              <Switch
                checked={pushEnabled}
                onCheckedChange={handleTogglePushEnabled}
              />
            </div>

            <div className={`rounded-xl border border-border bg-card p-4 flex items-center justify-between ${!pushEnabled ? 'opacity-50' : ''}`}>
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Goal Reminders</Label>
                <p className="text-sm text-muted-foreground">Receive reminders for your goals at the times you set</p>
              </div>
              <Switch
                checked={goalRemindersEnabled}
                onCheckedChange={handleToggleGoalReminders}
                disabled={!pushEnabled}
              />
            </div>

            <div className={`rounded-xl border border-border bg-card p-4 flex items-center justify-between ${!pushEnabled ? 'opacity-50' : ''}`}>
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Namaz Reminders</Label>
                <p className="text-sm text-muted-foreground">Receive alerts at each prayer time (e.g. It&apos;s time to pray Maghrib)</p>
              </div>
              <Switch
                checked={namazRemindersEnabled}
                onCheckedChange={handleToggleNamazReminders}
                disabled={!pushEnabled}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sub-section: Theme
  if (activeSection === 'theme') {
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

          <div>
            <h1 className="text-4xl font-normal tracking-tight font-display">Theme</h1>
            <p className="text-base text-muted-foreground mt-1 font-normal">Choose your visual style.</p>
          </div>

          <ThemeSelector />
        </div>
      </div>
    );
  }


  // Main menu
  return (
    <div className="container py-8">
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-normal tracking-tight font-display">Profile</h1>
          <p className="text-base text-muted-foreground mt-1 font-normal">Manage your account settings.</p>
        </div>

        <div className="space-y-3">
          {/* Account Information */}
          <button
            onClick={() => setActiveSection('account')}
            className="w-full flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <div className="text-left">
                <span className="text-base font-medium">Account Information</span>
                <p className="text-sm text-muted-foreground">Name, email, and location settings</p>
              </div>
            </div>
            <NavArrowRight className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Notifications */}
          <button
            onClick={() => setActiveSection('notifications')}
            className="w-full flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <div className="text-left">
                <span className="text-base font-medium">Notifications</span>
                <p className="text-sm text-muted-foreground">Manage your alerts and reminders</p>
              </div>
            </div>
            <NavArrowRight className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Theme */}
          <button
            onClick={() => setActiveSection('theme')}
            className="w-full flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <DesignPencil className="h-5 w-5 text-primary" />
              <div className="text-left">
                <span className="text-base font-medium">Theme</span>
                <p className="text-sm text-muted-foreground">Choose your visual style</p>
              </div>
            </div>
            <NavArrowRight className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Sign Out */}
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-destructive/5 text-destructive"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-base font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
