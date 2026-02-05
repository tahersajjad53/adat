import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut, MapPin } from 'lucide-react';
import adatLogo from '@/assets/adat-logo.svg';
import { DateDisplay } from '@/components/calendar/DateDisplay';
import { useCalendar } from '@/contexts/CalendarContext';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { location, requestLocationPermission } = useCalendar();
  const [fullName, setFullName] = useState<string>('');

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

  const displayName = fullName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <img src={adatLogo} alt="Adat" className="h-8 w-auto" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, <span className="font-medium text-foreground">{displayName}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          {/* Date Display */}
          <div className="flex flex-col items-center space-y-4">
            <DateDisplay showLocation className="text-center" />
            {!location?.city && (
              <Button
                variant="outline"
                size="sm"
                onClick={requestLocationPermission}
                className="gap-2"
              >
                <MapPin className="h-4 w-4" />
                Set your location
              </Button>
            )}
          </div>

          <h1 className="text-4xl font-bold tracking-tight font-display">
            Assalamu Alaikum, {displayName}
          </h1>
          <p className="text-lg text-muted-foreground">
            Your dashboard is ready. We'll be adding prayer tracking, dues management, and goal setting features here soon.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
            <div className="p-6 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">Namaz Tracker</h3>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
            <div className="p-6 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">Dues & Khumus</h3>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
            <div className="p-6 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">Goals & Habits</h3>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
