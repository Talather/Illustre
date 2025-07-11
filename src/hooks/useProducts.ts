
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from './useAuth';

type Product = Database['public']['Tables']['products']['Row'];
type Revision = Database['public']['Tables']['revisions']['Row'];

export const useProducts = (orderId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['products', orderId, user?.id],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          revisions(*)
        `)
        .order('created_at', { ascending: false });

      if (orderId) {
        query = query.eq('order_id', orderId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateRevision = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (revisionData: {
      product_id: string;
      description: string;
      requested_by: string;
    }) => {
      const { data, error } = await supabase
        .from('revisions')
        .insert(revisionData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
