
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar } from "lucide-react";
import { ProductCard } from "./ProductCard";

interface Order {
  id: string;
  clientName: string;
  status: string;
}

interface Product {
  id: string;
  title: string;
  format: string;
  price: number;
  status: string;
  nextActionDate: string;
  onboardingFormLink: string;
  deliverableLink: string;
  revisions?: Array<{
    id: string;
    description: string;
    requestedAt: string;
    status: 'pending' | 'in_progress' | 'completed';
  }>;
}

interface OrderAccordionProps {
  /** Grouped orders with their associated products */
  productsByOrder: Record<string, { order: Order; products: Product[] }>;
  /** Current Frame.io links being edited per product */
  editingFrameLink: { [key: string]: string };
  /** Callback when Frame.io link input changes */
  onFrameLinkChange: (productId: string, value: string) => void;
  /** Callback to handle file request action */
  onRequestFiles: (productId: string) => void;
  /** Callback to handle deliverable deposit action */
  onDepositDeliverable: (productId: string) => void;
  /** Callback to update Frame.io link */
  onUpdateFrameLink: (productId: string) => void;
  /** Callback to view onboarding form */
  onViewOnboardingForm: (formLink: string) => void;
}

/**
 * Accordion component for displaying orders and their associated products
 * 
 * Features:
 * - Collapsible order sections with summary information
 * - Order status badges and client information
 * - Product count per order
 * - Nested ProductCard components for each product
 * - Multiple accordion items can be open simultaneously
 * 
 * This component organizes products by their parent orders, providing
 * a hierarchical view of the collaborator's workload.
 */
export const OrderAccordion = ({
  productsByOrder,
  editingFrameLink,
  onFrameLinkChange,
  onRequestFiles,
  onDepositDeliverable,
  onUpdateFrameLink,
  onViewOnboardingForm
}: OrderAccordionProps) => {
  /**
   * Get localized order status label with appropriate styling
   */
  const getOrderStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Terminé', className: 'bg-green-100 text-green-800' };
      case 'in_progress':
        return { label: 'En cours', className: 'bg-blue-100 text-blue-800' };
      default:
        return { label: 'Onboarding', className: 'bg-orange-100 text-orange-800' };
    }
  };

  // Sort orders by earliest next action date across all products
  const sortedProductsByOrder = Object.entries(productsByOrder)
    .sort(([, a], [, b]) => {
      const aEarliest = Math.min(...a.products.map(p => new Date(p.nextActionDate).getTime()));
      const bEarliest = Math.min(...b.products.map(p => new Date(p.nextActionDate).getTime()));
      return aEarliest - bEarliest;
    });

  return (
    <Accordion type="multiple" className="space-y-4">
      {sortedProductsByOrder.map(([orderId, { order, products }]) => {
        const statusInfo = getOrderStatusInfo(order.status);
        
        return (
          <AccordionItem key={orderId} value={orderId}>
            <Card>
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <h3 className="font-semibold text-lg">Commande #{order.id}</h3>
                      <p className="text-sm text-gray-600">
                        Client: {order.clientName} • {products.length} produit(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={statusInfo.className}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent>
                <div className="px-6 pb-6 space-y-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      editingFrameLink={editingFrameLink[product.id] || ""}
                      onFrameLinkChange={(value) => onFrameLinkChange(product.id, value)}
                      onRequestFiles={onRequestFiles}
                      onDepositDeliverable={onDepositDeliverable}
                      onUpdateFrameLink={onUpdateFrameLink}
                      onViewOnboardingForm={onViewOnboardingForm}
                    />
                  ))}
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
