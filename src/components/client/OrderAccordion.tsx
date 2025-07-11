
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProductCard } from "./ProductCard";
import { Calendar } from "lucide-react";

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

interface Order {
  id: string;
  clientName: string;
  status: string;
}

interface OrderAccordionProps {
  /** Orders grouped with their products */
  ordersByClient: Record<string, { order: Order; products: Product[] }>;
  /** Callback when user accesses a file link */
  onFileAccess: (link: string, type: string) => void;
  /** Callback when user submits a revision request */
  onRevisionRequest: (productId: string, description: string) => void;
}

/**
 * OrderAccordion - Displays orders as expandable accordions with products inside
 * 
 * Features:
 * - Collapsible order sections with summary information
 * - Order status badges and product count
 * - Nested ProductCard components for each product
 * - Handles revision requests and file access
 */
export const OrderAccordion = ({
  ordersByClient,
  onFileAccess,
  onRevisionRequest
}: OrderAccordionProps) => {
  const getOrderStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'completed': 'bg-green-100 text-green-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'onboarding': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getOrderStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'completed': 'Terminé',
      'in_progress': 'En cours',
      'onboarding': 'Onboarding'
    };
    return labels[status] || status;
  };

  return (
    <Accordion type="multiple" className="space-y-4">
      {Object.entries(ordersByClient).map(([orderId, { order, products }]) => (
        <AccordionItem key={orderId} value={orderId}>
          <Card>
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">{order.clientName}</h3>
                    <p className="text-sm text-gray-600">
                      Commande #{order.id} • {products.length} produit(s)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getOrderStatusColor(order.status)}>
                    {getOrderStatusLabel(order.status)}
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
                    onFileAccess={onFileAccess}
                    onRevisionRequest={onRevisionRequest}
                  />
                ))}
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
