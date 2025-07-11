
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type OnboardingStep = Database['public']['Tables']['onboarding_steps']['Row'];

export const useOnboardingSteps = (orderId: string) => {
  return useQuery({
    queryKey: ['onboarding-steps', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_steps')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });
};

export const useUpdateOnboardingStep = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      orderId,
      step,
      completed,
      data: stepData
    }: {
      orderId: string;
      step: string;
      completed: boolean;
      data?: any;
    }) => {
      const { data, error } = await supabase
        .from('onboarding_steps')
        .upsert({
          order_id: orderId,
          step: step as any,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
          data: stepData || {},
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-steps', data.order_id] });
    },
  });
};
