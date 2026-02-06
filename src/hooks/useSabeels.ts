import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Sabeel, SabeelInput, SabeelWithRelations, FMBHub, Khumus, Zakat } from '@/types/dues';

interface UseSabeelsReturn {
  sabeels: SabeelWithRelations[];
  isLoading: boolean;
  error: string | null;
  createSabeel: (data: SabeelInput) => Promise<void>;
  updateSabeel: (id: string, data: Partial<SabeelInput>) => Promise<void>;
  deleteSabeel: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useSabeels(): UseSabeelsReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sabeels, setSabeels] = useState<SabeelWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSabeels = useCallback(async () => {
    if (!user) {
      setSabeels([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch sabeels
      const { data: sabeelsData, error: sabeelsError } = await supabase
        .from('sabeels')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (sabeelsError) throw sabeelsError;

      if (!sabeelsData || sabeelsData.length === 0) {
        setSabeels([]);
        return;
      }

      const sabeelIds = sabeelsData.map((s) => s.id);

      // Fetch related entities in parallel
      const [fmbHubsResult, khumusResult, zakatsResult] = await Promise.all([
        supabase.from('fmb_hubs').select('*').in('sabeel_id', sabeelIds),
        supabase.from('khumus').select('*').in('sabeel_id', sabeelIds),
        supabase.from('zakats').select('*').in('sabeel_id', sabeelIds),
      ]);

      const fmbHubs = fmbHubsResult.data || [];
      const khumusList = khumusResult.data || [];
      const zakatsList = zakatsResult.data || [];

      // Map relations to sabeels
      const sabeelsWithRelations: SabeelWithRelations[] = sabeelsData.map((sabeel) => ({
        ...sabeel,
        calendar_type: sabeel.calendar_type as 'hijri' | 'gregorian',
        reminder_type: sabeel.reminder_type as 'before_7_days' | 'last_day' | 'custom',
        fmb_hub: fmbHubs.find((fmb) => fmb.sabeel_id === sabeel.id) as FMBHub | null || null,
        khumus_list: khumusList
          .filter((k) => k.sabeel_id === sabeel.id)
          .map((k) => ({
            ...k,
            calendar_type: k.calendar_type as 'hijri' | 'gregorian',
            reminder_type: k.reminder_type as 'before_7_days' | 'last_day' | 'custom',
            calculation_type: k.calculation_type as 'fixed' | 'percentage',
          })) as Khumus[],
        zakats: zakatsList
          .filter((z) => z.sabeel_id === sabeel.id)
          .map((z) => ({
            ...z,
            calendar_type: z.calendar_type as 'hijri' | 'gregorian',
            reminder_type: z.reminder_type as 'before_7_days' | 'last_day' | 'custom',
            calculation_type: z.calculation_type as 'fixed' | 'nisab_based',
          })) as Zakat[],
      }));

      setSabeels(sabeelsWithRelations);
    } catch (err) {
      console.error('Error fetching sabeels:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sabeels');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createSabeel = useCallback(
    async (data: SabeelInput) => {
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to create a Sabeel',
          variant: 'destructive',
        });
        return;
      }

      try {
        const { error: insertError } = await supabase.from('sabeels').insert({
          user_id: user.id,
          sabeel_name: data.sabeel_name,
          monthly_amount: data.monthly_amount,
          calendar_type: data.calendar_type,
          start_month: data.start_month,
          start_year: data.start_year,
          end_month: data.end_month,
          end_year: data.end_year,
          reminder_type: data.reminder_type,
          reminder_day: data.reminder_day,
          is_active: data.is_active ?? true,
        });

        if (insertError) throw insertError;

        toast({
          title: 'Sabeel created',
          description: `${data.sabeel_name} has been added successfully.`,
        });

        await fetchSabeels();
      } catch (err) {
        console.error('Error creating sabeel:', err);
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to create Sabeel',
          variant: 'destructive',
        });
      }
    },
    [user, toast, fetchSabeels]
  );

  const updateSabeel = useCallback(
    async (id: string, data: Partial<SabeelInput>) => {
      try {
        const { error: updateError } = await supabase
          .from('sabeels')
          .update({
            sabeel_name: data.sabeel_name,
            monthly_amount: data.monthly_amount,
            calendar_type: data.calendar_type,
            start_month: data.start_month,
            start_year: data.start_year,
            end_month: data.end_month,
            end_year: data.end_year,
            reminder_type: data.reminder_type,
            reminder_day: data.reminder_day,
            is_active: data.is_active,
          })
          .eq('id', id);

        if (updateError) throw updateError;

        toast({
          title: 'Sabeel updated',
          description: 'Your changes have been saved.',
        });

        await fetchSabeels();
      } catch (err) {
        console.error('Error updating sabeel:', err);
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to update Sabeel',
          variant: 'destructive',
        });
      }
    },
    [toast, fetchSabeels]
  );

  const deleteSabeel = useCallback(
    async (id: string) => {
      try {
        const { error: deleteError } = await supabase
          .from('sabeels')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;

        toast({
          title: 'Sabeel deleted',
          description: 'The Sabeel and all related entries have been removed.',
        });

        await fetchSabeels();
      } catch (err) {
        console.error('Error deleting sabeel:', err);
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to delete Sabeel',
          variant: 'destructive',
        });
      }
    },
    [toast, fetchSabeels]
  );

  // Fetch on mount and when user changes
  useEffect(() => {
    fetchSabeels();
  }, [fetchSabeels]);

  return {
    sabeels,
    isLoading,
    error,
    createSabeel,
    updateSabeel,
    deleteSabeel,
    refetch: fetchSabeels,
  };
}
