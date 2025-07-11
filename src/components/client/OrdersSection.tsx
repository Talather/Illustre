
import { OrderAccordion } from "./OrderAccordion";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { useCreateRevision } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Order = Database['public']['Tables']['orders']['Row'];
type Product = Database['public']['Tables']['products']['Row'] & {
  revisions?: Database['public']['Tables']['revisions']['Row'][];
};

interface OrdersSectionProps {
  onFileAccess: (link: string, type: string) => void;
}

export const OrdersSection = ({ onFileAccess }: OrdersSectionProps) => {
  const { user } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: products, isLoading: productsLoading } = useProducts();
  const createRevisionMutation = useCreateRevision();

  const handleRevisionRequest = async (productId: string, description: string) => {
    if (!user) return;

    try {
      await createRevisionMutation.mutateAsync({
        product_id: productId,
        description,
        requested_by: user.id,
      });
      
      toast({
        title: "Demande de révision envoyée",
        description: "Votre demande de révision a été envoyée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande de révision.",
        variant: "destructive",
      });
    }
  };

  if (ordersLoading || productsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const clientOrders = orders?.filter(order => order.client_id === user?.id) || [];
  
  // Group orders with their products
  const ordersByClient = clientOrders.reduce((acc, order) => {
    const orderProducts = products?.filter(product => product.order_id === order.id) || [];
    
    acc[order.id] = {
      order: {
        id: order.id,
        clientName: order.client_name,
        status: order.status || 'onboarding',
      },
      products: orderProducts.map(product => ({
        id: product.id,
        title: product.title,
        format: product.format || '',
        status: product.status || 'pending',
        deliverableLink: product.deliverable_link || '',
        preparationLink: product.preparation_link || '',
        nextActionDate: product.next_action_date || '',
        responsible: product.responsible || '',
        instructions: product.instructions || '',
        revisions: product.revisions?.map(revision => ({
          id: revision.id,
          requestedAt: revision.requested_at,
          description: revision.description,
          status: revision.status as 'pending' | 'in_progress' | 'completed',
        })) || [],
      })),
    };
    
    return acc;
  }, {} as Record<string, { order: any; products: any[] }>);

  const ordersCount = Object.keys(ordersByClient).length;

  if (ordersCount === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mes Commandes</h2>
        <div className="text-sm text-gray-600">
          {ordersCount} commande(s)
        </div>
      </div>
      
      <OrderAccordion
        ordersByClient={ordersByClient}
        onFileAccess={onFileAccess}
        onRevisionRequest={handleRevisionRequest}
      />
    </div>
  );
};
