import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NavArrowLeft } from 'iconoir-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useUserPreferences } from '@/hooks/useUserPreferences';

const DynamicGoalsSettings: React.FC = () => {
  const navigate = useNavigate();
  const { dynamicGoalsEnabled, setDynamicGoalsEnabled, isToggling } = useUserPreferences();

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate('/goals')}>
            <NavArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-display font-normal tracking-tight">Dynamic Goals</h1>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Dynamic Goals are community goals for all Mumineen that appear alongside your personal goals. These include goals like "Pray Moti Us Sawalat" on days requiring rozu, and other important community-wide ibadaat.
          </p>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium">Receive Dynamic Goals</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {dynamicGoalsEnabled ? 'Dynamic goals will appear on your goals page' : 'Enable to see community goals'}
              </p>
            </div>
            <Switch
              checked={dynamicGoalsEnabled}
              onCheckedChange={(checked) => setDynamicGoalsEnabled(checked)}
              disabled={isToggling}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicGoalsSettings;
