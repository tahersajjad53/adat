import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ZakatInput } from '@/types/dues';

interface UseZakatReturn {
  createZakat: (data: ZakatInput) => Promise<void>;
  updateZakat: (id: string, data: Partial<ZakatInput>) => Promise<void>;
  deleteZakat: (id: string) => Promise<void>;
}

export function useZakat(onSuccess?: () => void): UseZakatReturn {
  const { user } = useAuth();
  const { toast } = useToast();

  const createZakat = useCallback(
    async (data: ZakatInput) => {
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in',
          variant: 'destructive',
        });
        return;
      }

      try {
        const { error: insertError } = await supabase.from('zakats').insert({
          sabeel_id: data.sabeel_id,
          person_name: data.person_name,
          calculation_type: data.calculation_type,
          fixed_amount: data.calculation_type === 'fixed' ? data.fixed_amount : null,
          assets_value: data.calculation_type === 'nisab_based' ? data.assets_value : null,
          nisab_threshold: data.calculation_type === 'nisab_based' ? data.nisab_threshold : null,
          zakat_rate: data.zakat_rate ?? 2.5,
          calendar_type: data.calendar_type,
          reminder_type: data.reminder_type,
          reminder_day: data.reminder_day,
          is_active: data.is_active ?? true,
        });

        if (insertError) throw insertError;

        toast({
          title: 'Zakat added',
          description: `Zakat for ${data.person_name} has been added.`,
        });

        onSuccess?.();
      } catch (err) {
        console.error('Error creating Zakat:', err);
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to create Zakat',
          variant: 'destructive',
        });
      }
    },
    [user, toast, onSuccess]
  );

  const updateZakat = useCallback(
    async (id: string, data: Partial<ZakatInput>) => {
      try {
        const { error: updateError } = await supabase
          .from('zakats')
          .update({
            person_name: data.person_name,
            calculation_type: data.calculation_type,
            fixed_amount: data.calculation_type === 'fixed' ? data.fixed_amount : null,
            assets_value: data.calculation_type === 'nisab_based' ? data.assets_value : null,
            nisab_threshold: data.calculation_type === 'nisab_based' ? data.nisab_threshold : null,
            zakat_rate: data.zakat_rate,
            calendar_type: data.calendar_type,
            reminder_type: data.reminder_type,
            reminder_day: data.reminder_day,
            is_active: data.is_active,
          })
          .eq('id', id);

        if (updateError) throw updateError;

        toast({
          title: 'Zakat updated',
          description: 'Your changes have been saved.',
        });

        onSuccess?.();
      } catch (err) {
        console.error('Error updating Zakat:', err);
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to update Zakat',
          variant: 'destructive',
        });
      }
    },
    [toast, onSuccess]
  );

  const deleteZakat = useCallback(
    async (id: string) => {
      try {
        const { error: deleteError } = await supabase
          .from('zakats')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;

        toast({
          title: 'Zakat removed',
          description: 'Zakat entry has been deleted.',
        });

        onSuccess?.();
      } catch (err) {
        console.error('Error deleting Zakat:', err);
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to delete Zakat',
          variant: 'destructive',
        });
      }
    },
    [toast, onSuccess]
  );

  return {
    createZakat,
    updateZakat,
    deleteZakat,
  };
}
