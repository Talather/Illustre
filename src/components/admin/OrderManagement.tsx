
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Order, OrderProduct } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";
import { Calendar, Edit, Save, X, Package } from "lucide-react";

interface OrderManagementProps {
  orders: Order[];
  products: OrderProduct[];
  onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
  onUpdateProduct: (productId: string, updates: Partial<OrderProduct>) => void;
}

/**
 * OrderManagement - Component for managing orders and products in admin interface
 * 
 * Features:
 * - Accordion layout grouping orders with their products
 * - Inline editing for order details (client name, status)
 * - Product status management with dropdown selection
 * - Product details editing (title, responsible, instructions)
 * - Visual status indicators with color coding
 * - Subcontracting and branding indicators
 * - Responsive design with proper spacing
 * - Form validation and success feedback
 */
export const OrderManagement = ({ 
  orders, 
  products, 
  onUpdateOrder, 
  onUpdateProduct 
}: OrderManagementProps) => {
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [orderForm, setOrderForm] = useState({ clientName: '', status: '' });
  const [productForm, setProductForm] = useState({ title: '', responsible: '', instructions: '' });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'completed': 'bg-green-100 text-green-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'onboarding': 'bg-orange-100 text-orange-800',
      'pending': 'bg-gray-100 text-gray-800',
      'files_requested': 'bg-orange-100 text-orange-800',
      'in_production': 'bg-blue-100 text-blue-800',
      'delivered': 'bg-green-100 text-green-800',
      'revision_requested': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'completed': 'Terminé',
      'in_progress': 'En cours',
      'onboarding': 'Onboarding',
      'pending': 'En attente',
      'files_requested': 'Fichiers demandés',
      'in_production': 'En production',
      'delivered': 'Livré',
      'revision_requested': 'Révision demandée'
    };
    return labels[status] || status;
  };

  // Group products by order
  const ordersByClient = orders.reduce((acc, order) => {
    const orderProducts = products.filter(p => p.orderId === order.id);
    acc[order.id] = { order, products: orderProducts };
    return acc;
  }, {} as Record<string, { order: Order; products: OrderProduct[] }>);

  const handleOrderEditStart = (order: Order) => {
    setEditingOrder(order.id);
    setOrderForm({ clientName: order.clientName, status: order.status });
  };

  const handleOrderEditSave = (orderId: string) => {
    if (!orderForm.clientName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du client est requis",
        variant: "destructive"
      });
      return;
    }

    onUpdateOrder(orderId, orderForm);
    setEditingOrder(null);
    toast({
      title: "Commande mise à jour",
      description: "Les informations ont été modifiées avec succès"
    });
  };

  const handleProductEditStart = (product: OrderProduct) => {
    setEditingProduct(product.id);
    setProductForm({ 
      title: product.title, 
      responsible: product.responsible, 
      instructions: product.instructions 
    });
  };

  const handleProductEditSave = (productId: string) => {
    if (!productForm.title.trim()) {
      toast({
        title: "Erreur",
        description: "Le titre du produit est requis",
        variant: "destructive"
      });
      return;
    }

    onUpdateProduct(productId, productForm);
    setEditingProduct(null);
    toast({
      title: "Produit mis à jour",
      description: "Les informations ont été modifiées avec succès"
    });
  };

  const handleEditCancel = () => {
    setEditingOrder(null);
    setEditingProduct(null);
    setOrderForm({ clientName: '', status: '' });
    setProductForm({ title: '', responsible: '', instructions: '' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des commandes et produits</CardTitle>
        <CardDescription>
          Modifiez les commandes et leurs produits associés organisés en accordéons
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-4">
          {Object.entries(ordersByClient).map(([orderId, { order, products: orderProducts }]) => (
            <AccordionItem key={orderId} value={orderId}>
              <Card>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div className="text-left">
                        {editingOrder === order.id ? (
                          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                            <Input
                              value={orderForm.clientName}
                              onChange={(e) => setOrderForm(prev => ({ ...prev, clientName: e.target.value }))}
                              placeholder="Nom du client"
                              className="text-lg font-semibold"
                            />
                            <Select
                              value={orderForm.status}
                              onValueChange={(value) => setOrderForm(prev => ({ ...prev, status: value }))}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="onboarding">Onboarding</SelectItem>
                                <SelectItem value="in_progress">En cours</SelectItem>
                                <SelectItem value="completed">Terminé</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <>
                            <h3 className="font-semibold text-lg">{order.clientName}</h3>
                            <p className="text-sm text-gray-600">
                              Commande #{order.id} • {orderProducts.length} produit(s)
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                      {order.isSubcontracted && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          Sous-traitance
                        </Badge>
                      )}
                      {editingOrder === order.id ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleOrderEditSave(order.id)}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleEditCancel}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleOrderEditStart(order)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent>
                  <div className="px-6 pb-6 space-y-4">
                    {orderProducts.map((product) => (
                      <Card key={product.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Package className="w-5 h-5 text-purple-600" />
                              <div>
                                {editingProduct === product.id ? (
                                  <div className="space-y-2">
                                    <Input
                                      value={productForm.title}
                                      onChange={(e) => setProductForm(prev => ({ ...prev, title: e.target.value }))}
                                      placeholder="Titre du produit"
                                      className="font-semibold"
                                    />
                                    <Input
                                      value={productForm.responsible}
                                      onChange={(e) => setProductForm(prev => ({ ...prev, responsible: e.target.value }))}
                                      placeholder="Responsable"
                                    />
                                    <Input
                                      value={productForm.instructions}
                                      onChange={(e) => setProductForm(prev => ({ ...prev, instructions: e.target.value }))}
                                      placeholder="Instructions"
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <h3 className="font-semibold">{product.title}</h3>
                                    <p className="text-sm text-gray-600">
                                      Responsable: {product.responsible} • Format: {product.format}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">{product.instructions}</p>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(product.status)}>
                                {getStatusLabel(product.status)}
                              </Badge>
                              <Select
                                value={product.status}
                                onValueChange={(value) => onUpdateProduct(product.id, { status: value as any })}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">En attente</SelectItem>
                                  <SelectItem value="files_requested">Fichiers demandés</SelectItem>
                                  <SelectItem value="in_production">En production</SelectItem>
                                  <SelectItem value="delivered">Livré</SelectItem>
                                  <SelectItem value="revision_requested">Révision</SelectItem>
                                </SelectContent>
                              </Select>
                              {editingProduct === product.id ? (
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => handleProductEditSave(product.id)}>
                                    <Save className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={handleEditCancel}>
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => handleProductEditStart(product)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
