import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useQazaMonitoring() {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('qaza_monitoring_enabled')
        .eq('id', user.id)
        .maybeSingle();
      if (data) {
        setEnabled(data.qaza_monitoring_enabled !== false);
      }
      setIsLoading(false);
    };
    fetch();
  }, [user]);

  const toggle = useCallback(async (value: boolean) => {
    if (!user) return;
    setEnabled(value);
    await supabase
      .from('profiles')
      .update({ qaza_monitoring_enabled: value })
      .eq('id', user.id);
  }, [user]);

  return { qazaMonitoringEnabled: enabled, isLoading, setQazaMonitoring: toggle };
}
