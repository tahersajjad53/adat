import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { KhumusInput } from '@/types/dues';

interface UseKhumusReturn {
  createKhumus: (data: KhumusInput) => Promise<void>;
  updateKhumus: (id: string, data: Partial<KhumusInput>) => Promise<void>;
  deleteKhumus: (id: string) => Promise<void>;
}

export function useKhumus(onSuccess?: () => void): UseKhumusReturn {
  const { user } = useAuth();
  const { toast } = useToast();

  const createKhumus = useCallback(
    async (data: KhumusInput) => {
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in',
          variant: 'destructive',
        });
        return;
      }

      try {
        const { error: insertError } = await supabase.from('khumus').insert({
          sabeel_id: data.sabeel_id,
          person_name: data.person_name,
          calculation_type: data.calculation_type,
          fixed_amount: data.calculation_type === 'fixed' ? data.fixed_amount : null,
          monthly_income: data.calculation_type === 'percentage' ? data.monthly_income : null,
          percentage_rate: data.percentage_rate ?? 20,
          calendar_type: data.calendar_type,
          reminder_type: data.reminder_type,
          reminder_day: data.reminder_day,
          is_active: data.is_active ?? true,
        });

        if (insertError) throw insertError;

        toast({
          title: 'Khumus added',
          description: `Khumus for ${data.person_name} has been added.`,
        });

        onSuccess?.();
      } catch (err) {
        console.error('Error creating Khumus:', err);
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to create Khumus',
          variant: 'destructive',
        });
      }
    },
    [user, toast, onSuccess]
  );

  const updateKhumus = useCallback(
    async (id: string, data: Partial<KhumusInput>) => {
      try {
        const { error: updateError } = await supabase
          .from('khumus')
          .update({
            person_name: data.person_name,
            calculation_type: data.calculation_type,
            fixed_amount: data.calculation_type === 'fixed' ? data.fixed_amount : null,
            monthly_income: data.calculation_type === 'percentage' ? data.monthly_income : null,
            percentage_rate: data.percentage_rate,
            calendar_type: data.calendar_type,
            reminder_type: data.reminder_type,
            reminder_day: data.reminder_day,
            is_active: data.is_active,
          })
          .eq('id', id);

        if (updateError) throw updateError;

        toast({
          title: 'Khumus updated',
          description: 'Your changes have been saved.',
        });

        onSuccess?.();
      } catch (err) {
        console.error('Error updating Khumus:', err);
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to update Khumus',
          variant: 'destructive',
        });
      }
    },
    [toast, onSuccess]
  );

  const deleteKhumus = useCallback(
    async (id: string) => {
      try {
        const { error: deleteError } = await supabase
          .from('khumus')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;

        toast({
          title: 'Khumus removed',
          description: 'Khumus entry has been deleted.',
        });

        onSuccess?.();
      } catch (err) {
        console.error('Error deleting Khumus:', err);
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to delete Khumus',
          variant: 'destructive',
        });
      }
    },
    [toast, onSuccess]
  );

  return {
    createKhumus,
    updateKhumus,
    deleteKhumus,
  };
}
