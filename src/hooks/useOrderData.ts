
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  orderService, 
  orderProductService, 
  onboardingStepService,
  revisionService,
  type Order,
  type OrderProduct,
  type OnboardingStep,
  type Revision
} from '@/services/supabaseService';

// Interface pour les données enrichies
export interface EnrichedOrder extends Order {
  products: EnrichedOrderProduct[];
  onboardingSteps: OnboardingStep[];
}

export interface EnrichedOrderProduct extends OrderProduct {
  revisions: Revision[];
}

export const useOrderData = (clientId?: string) => {
  const [orders, setOrders] = useState<EnrichedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Récupérer les commandes
  const { data: rawOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', clientId],
    queryFn: () => clientId ? orderService.getOrdersByClientId(clientId) : orderService.getAllOrders(),
    enabled: !!clientId || clientId === undefined // Permettre la récupération de toutes les commandes si clientId est undefined
  });

  // Enrichir les données des commandes
  useEffect(() => {
    const enrichOrders = async () => {
      if (!rawOrders) return;

      setLoading(true);
      
      const enrichedOrders = await Promise.all(
        rawOrders.map(async (order) => {
          // Récupérer les produits
          const products = await orderProductService.getProductsByOrderId(order.id);
          
          // Enrichir chaque produit avec ses révisions
          const enrichedProducts = await Promise.all(
            products.map(async (product) => {
              const revisions = await revisionService.getRevisionsByProductId(product.id);
              return {
                ...product,
                revisions
              };
            })
          );

          // Récupérer les étapes d'onboarding
          const onboardingSteps = await onboardingStepService.getOnboardingStepsByOrderId(order.id);

          return {
            ...order,
            products: enrichedProducts,
            onboardingSteps
          };
        })
      );

      setOrders(enrichedOrders);
      setLoading(false);
    };

    enrichOrders();
  }, [rawOrders]);

  return {
    orders,
    loading: loading || ordersLoading,
    refetch: () => {
      // Logique de rafraîchissement si nécessaire
    }
  };
};

// Hook spécialisé pour un client
export const useClientOrderData = (clientId: string) => {
  return useOrderData(clientId);
};

// Hook pour toutes les commandes (admin/collaborateur)
export const useAllOrderData = () => {
  return useOrderData();
};
