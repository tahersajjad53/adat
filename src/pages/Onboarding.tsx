import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AuthLayout from '@/components/auth/AuthLayout';
import LocationSelector from '@/components/profile/LocationSelector';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { type City, findCityById } from '@/data/cities';
import { Refresh, Plus, Xmark } from 'iconoir-react';
import { cn } from '@/lib/utils';

const ASPIRATION_OPTIONS = [
  { id: 'sabeel', label: 'Budget for Sabeel', goalTitle: 'Budget for Sabeel', recurrence: 'custom' as const },
  { id: 'khums', label: 'Track Khums', goalTitle: 'Track Khums', recurrence: 'custom' as const },
  { id: 'quran', label: 'Pray Quran Daily', goalTitle: 'Pray Quran', recurrence: 'daily' as const },
  { id: 'fmb', label: 'Budget for FMB Hub', goalTitle: 'Budget for FMB Hub', recurrence: 'custom' as const },
];

const Onboarding: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedCity, setSelectedCity] = useState<City | undefined>();
  const [customCoords, setCustomCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [fullName, setFullName] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [selectedAspirations, setSelectedAspirations] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        if (data?.full_name) setFullName(data.full_name);
      }
    };
    fetchProfile();
  }, [user]);

  // Step 3: create goals and navigate
  useEffect(() => {
    if (step !== 3 || !user) return;

    const run = async () => {
      await insertSelectedGoals();
      await new Promise(r => setTimeout(r, 2000));
      navigate(selectedAspirations.size > 0 ? '/goals' : '/today');
    };

    run();
  }, [step, user, selectedAspirations, navigate]);

  const handleLocationChange = (city: City | null, coords?: { latitude: number; longitude: number }) => {
    if (city) { setSelectedCity(city); setCustomCoords(null); }
    else if (coords) { setCustomCoords(coords); setSelectedCity(undefined); }
  };

  const saveLocation = async (locationData: { latitude: number; longitude: number; city: string; timezone: string }) => {
    if (!user) return false;
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      ...locationData,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Error saving location', description: error.message, variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleContinueLocation = async () => {
    const locationData = selectedCity
      ? { latitude: selectedCity.latitude, longitude: selectedCity.longitude, city: selectedCity.name, timezone: selectedCity.timezone }
      : customCoords
        ? { latitude: customCoords.latitude, longitude: customCoords.longitude, city: 'Custom Location', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }
        : null;

    if (!locationData) {
      toast({ title: 'Please select a location', description: 'We need your location to show accurate prayer times.', variant: 'destructive' });
      return;
    }

    const ok = await saveLocation(locationData);
    if (ok) setStep(2);
  };

  const handleSkipLocation = async () => {
    const mecca = findCityById('mecca');
    if (!mecca || !user) return;
    await saveLocation({ latitude: mecca.latitude, longitude: mecca.longitude, city: mecca.name, timezone: mecca.timezone });
    setStep(2);
  };

  const toggleAspiration = (id: string) => {
    setSelectedAspirations(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const insertSelectedGoals = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const selected = Array.from(selectedAspirations);
    if (selected.length > 0) {
      const goals = selected.map((id, i) => {
        const opt = ASPIRATION_OPTIONS.find(o => o.id === id)!;
        return {
          user_id: user.id,
          title: opt.goalTitle,
          recurrence_type: opt.recurrence,
          recurrence_pattern: opt.recurrence === 'custom'
            ? { type: 'monthly', monthlyDay: 1, calendarType: 'hijri' }
            : null,
          start_date: today,
          sort_order: i,
          is_active: true,
        };
      });
      await supabase.from('goals').insert(goals as any);
    }
  };

  const handleCreateOwn = async () => {
    await insertSelectedGoals();
    navigate('/goals?new=1');
  };

  const displayName = fullName || user?.email?.split('@')[0] || 'there';

  // Step 3 – Loading screen
  if (step === 3) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6">
          <Refresh className="h-6 w-6 animate-spin text-muted-foreground" />
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground italic">
              "The bane of ibadat is listlessness"
            </p>
            <p className="text-xs text-muted-foreground">— Al-Hadith</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Step 2 – Aspirations
  if (step === 2) {
    return (
      <AuthLayout>
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight font-display">اُمّید</h1>
            <p className="text-muted-foreground">What would you like to focus on?</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {ASPIRATION_OPTIONS.map((opt) => {
              const selected = selectedAspirations.has(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleAspiration(opt.id)}
                  className={cn(
                    'rounded-full px-5 py-2.5 border text-sm font-medium transition-all flex items-center gap-2',
                    selected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:border-primary/50'
                  )}
                >
                  {opt.label}
                  {selected ? <Xmark className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>

          <div className="space-y-3 pt-2">
            <Button onClick={() => setStep(3)} className="w-full">
              Continue
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setSelectedAspirations(new Set()); setStep(3); }}
              className="w-full text-muted-foreground"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Step 1 – Location (original)
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
          <LocationSelector value={selectedCity} onChange={handleLocationChange} />
          {customCoords && (
            <p className="text-sm text-muted-foreground">
              📍 Using GPS coordinates: {customCoords.latitude.toFixed(4)}, {customCoords.longitude.toFixed(4)}
            </p>
              )}
            </div>

            <button
              onClick={handleCreateOwn}
              className="rounded-full px-5 py-2.5 border border-dashed text-sm font-medium transition-all flex items-center gap-2 border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              Create your own
            </button>

        <div className="space-y-3 pt-2">
          <Button onClick={handleContinueLocation} className="w-full" disabled={saving || (!selectedCity && !customCoords)}>
            {saving ? (
              <><Refresh className="mr-2 h-4 w-4 animate-spin" />Saving...</>
            ) : (
              'Continue'
            )}
          </Button>
          <Button variant="ghost" onClick={handleSkipLocation} disabled={saving} className="w-full text-muted-foreground">
            Skip for now (defaults to Mecca)
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Onboarding;
