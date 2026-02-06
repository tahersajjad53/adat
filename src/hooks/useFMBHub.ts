import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { FMBHubInput } from '@/types/dues';

interface UseFMBHubReturn {
  createFMBHub: (data: FMBHubInput) => Promise<void>;
  updateFMBHub: (id: string, data: Partial<FMBHubInput>) => Promise<void>;
  deleteFMBHub: (id: string) => Promise<void>;
}

export function useFMBHub(onSuccess?: () => void): UseFMBHubReturn {
  const { user } = useAuth();
  const { toast } = useToast();

  const createFMBHub = useCallback(
    async (data: FMBHubInput) => {
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in',
          variant: 'destructive',
        });
        return;
      }

      try {
        const { error: insertError } = await supabase.from('fmb_hubs').insert({
          sabeel_id: data.sabeel_id,
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
          title: 'FMB Hub added',
          description: 'FMB Hub has been configured successfully.',
        });

        onSuccess?.();
      } catch (err) {
        console.error('Error creating FMB Hub:', err);
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to create FMB Hub',
          variant: 'destructive',
        });
      }
    },
    [user, toast, onSuccess]
  );

  const updateFMBHub = useCallback(
    async (id: string, data: Partial<FMBHubInput>) => {
      try {
        const { error: updateError } = await supabase
          .from('fmb_hubs')
          .update({
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
          title: 'FMB Hub updated',
          description: 'Your changes have been saved.',
        });

        onSuccess?.();
      } catch (err) {
        console.error('Error updating FMB Hub:', err);
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to update FMB Hub',
          variant: 'destructive',
        });
      }
    },
    [toast, onSuccess]
  );

  const deleteFMBHub = useCallback(
    async (id: string) => {
      try {
        const { error: deleteError } = await supabase
          .from('fmb_hubs')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;

        toast({
          title: 'FMB Hub removed',
          description: 'FMB Hub has been deleted.',
        });

        onSuccess?.();
      } catch (err) {
        console.error('Error deleting FMB Hub:', err);
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to delete FMB Hub',
          variant: 'destructive',
        });
      }
    },
    [toast, onSuccess]
  );

  return {
    createFMBHub,
    updateFMBHub,
    deleteFMBHub,
  };
}
