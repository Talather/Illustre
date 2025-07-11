
import { OrderAccordion } from "./OrderAccordion";

interface Order {
  id: string;
  clientName: string;
  status: string;
}

interface Product {
  id: string;
  title: string;
  format: string;
  status: string;
  deliverableLink: string;
  preparationLink: string;
  nextActionDate: string;
  responsible: string;
  instructions: string;
  revisions?: Array<{
    id: string;
    requestedAt: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
  }>;
}

interface OrdersSectionProps {
  /** Orders grouped with their products */
  ordersByClient: Record<string, { order: Order; products: Product[] }>;
  /** Callback when user accesses a file link */
  onFileAccess: (link: string, type: string) => void;
  /** Callback when user submits a revision request */
  onRevisionRequest: (productId: string, description: string) => void;
}

/**
 * OrdersSection - Section displaying user's orders
 * 
 * Features:
 * - Orders count display
 * - OrderAccordion integration
 * - Conditional rendering based on orders availability
 */
export const OrdersSection = ({
  ordersByClient,
  onFileAccess,
  onRevisionRequest
}: OrdersSectionProps) => {
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
        onRevisionRequest={onRevisionRequest}
      />
    </div>
  );
};
