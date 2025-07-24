import { useState, useEffect } from "react";
import { ClientHeader } from "@/components/client/ClientHeader";
import { WelcomeSection } from "@/components/client/WelcomeSection";
import { OnboardingSection } from "@/components/client/OnboardingSection";
import { OrdersSection } from "@/components/client/OrdersSection";
import { 
  Profile,
  getOrdersByClientId, 
  getProductsByOrderId, 
  getOnboardingStepsByOrderId,
  productTemplates,
  ProductTemplate
} from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, X, Minus, Check, DollarSign } from "lucide-react";

// Interface for orders from database
interface DatabaseOrder {
  id: string;
  client_id: string;
  closer_id?: string;
  order_name: string;
  status: string;
  products: any[];
  custom_options: any[];
  total_price: number;
  created_at: string;
  updated_at: string;
  client_name?: string;
  client_email?: string;
}

interface CustomOption {
  name: string;
  description: string;
  price: string;
}

interface SelectedProduct {
  template: ProductTemplate;
  quantity: number;
}

interface ClientInterfaceProps {
  user: Profile;
  onLogout: () => void;
}

/**
 * ClientInterface - Main interface for client users
 * 
 * Architecture:
 * - ClientHeader: Navigation, branding, and user controls
 * - WelcomeSection: Personalized welcome message
 * - OnboardingSection: Onboarding progress for active orders
 * - OrdersSection: Detailed order and product management
 * 
 * Key Features:
 * - Subcontracted client support with custom branding
 * - Multiple onboarding blocks (one per order in onboarding status)
 * - Order creation and management
 * - File access and revision request handling
 */
const ClientInterface = ({ user, onLogout }: ClientInterfaceProps) => {
  // State for orders data
  const [userOrders, setUserOrders] = useState<DatabaseOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [onboardingStepsByOrder, setOnboardingStepsByOrder] = useState<Record<string, any[]>>({});
  
  // State for order creation
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [newOrderData, setNewOrderData] = useState({
    name: "",
    selectedProducts: [] as SelectedProduct[],
    customOptions: [] as CustomOption[]
  });
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  // Fetch orders from database for current user
  const fetchOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const { data, error } = await (supabase as any)
        .from('orders')
        .select(`
          id,
          client_id,
          closer_id,
          order_name,
          status,
          products,
          custom_options,
          total_price,
          created_at,
          updated_at,
          users!client_id (id, full_name, email)
        `)
        .eq('client_id', user.id) // Filter by current user's ID
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les commandes",
          variant: "destructive"
        });
        return;
      }

      // Transform the data to include client info
      const transformedOrders = data?.map((order: any) => ({
        ...order,
        client_name: order.users?.full_name || 'Client inconnu',
        client_email: order.users?.email || '',
      })) || [];

      setUserOrders(transformedOrders);
      
      // Fetch onboarding steps for orders with status 'onboarding'
      await fetchOnboardingSteps(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes",
        variant: "destructive"
      });
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Fetch onboarding steps from database for orders with status 'onboarding'
  const fetchOnboardingSteps = async (orders: DatabaseOrder[]) => {
    try {
      // Get order IDs for orders with status 'onboarding'
      console.log(orders);
      const onboardingOrderIds = orders
        .filter(order => order.status === 'onboarding')
        .map(order => order.id);
        console.log(onboardingOrderIds);

      if (onboardingOrderIds.length === 0) {
        // setOnboardingStepsByOrder({});
        return;
      }

      // Fetch onboarding steps for these orders
      const { data, error } = await (supabase as any)
        .from('onboardings')
        .select('*')
        .in('order_id', onboardingOrderIds);

      if (error) {
        console.error('Error fetching onboarding steps:', error);
        return;
      }

      // Define the correct order of steps
      const stepOrder = ['call_scheduled', 'contract_signed', 'payment_made', 'form_completed'];
      
      // Group steps by order ID and sort them in the correct order
      const stepsByOrder = data?.reduce((acc: Record<string, any[]>, step: any) => {
        if (!acc[step.order_id]) {
          acc[step.order_id] = [];
        }
        acc[step.order_id].push({
          id: step.id,
          step: step.step,
          title: step.step === 'call_scheduled' ? 'Appel d\'Onboarding' :
                 step.step === 'contract_signed' ? 'Signature du contrat' :
                 step.step === 'payment_made' ? 'Paiement' :
                 step.step === 'form_completed' ? 'Formulaire d\'Onboarding' : step.step,
          completed: step.completed,
          link: step.link,
          icon: () => null
        });
        return acc;
      }, {}) || {};

      // Sort steps within each order according to the defined order
      Object.keys(stepsByOrder).forEach(orderId => {
        stepsByOrder[orderId].sort((a, b) => {
          const aIndex = stepOrder.indexOf(a.step);
          const bIndex = stepOrder.indexOf(b.step);
          return aIndex - bIndex;
        });
      });

      setOnboardingStepsByOrder(stepsByOrder);
    } catch (error) {
      console.error('Error fetching onboarding steps:', error);
    }
  };
 

  // Fetch orders on component mount and set up real-time subscription
  useEffect(() => {
    fetchOrders();
    
    // Track active subscriptions
    let activeOrdersSubscription: any = null;
    let activeOnboardingsSubscription: any = null;
    
    // Function to set up orders subscription
    const setupOrdersSubscription = () => {
      // Remove any existing subscription first
      if (activeOrdersSubscription) {
        supabase.removeChannel(activeOrdersSubscription);
      }
      
      // Set up real-time subscription for orders table
      const subscription = supabase
        .channel('client-orders-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'orders',
            filter: `client_id=eq.${user.id}` // Only listen to changes for this client
          },
          async (payload) => {
            console.log('Orders table changed for client:', payload);
            // Refresh orders when orders table changes
            await fetchOrders();
          }
        )
        .subscribe();
      
      activeOrdersSubscription = subscription;
      return subscription;
    };
    
    // Function to set up onboardings subscription
    const setupOnboardingsSubscription = () => {
      // Remove any existing subscription first
      if (activeOnboardingsSubscription) {
        supabase.removeChannel(activeOnboardingsSubscription);
      }
      
      // Set up real-time subscription for onboardings table
      const subscription = supabase
        .channel('client-onboardings-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'onboardings',
          },
          async (payload) => {
            
            console.log('Onboardings table changed:', payload);
            
            // console.log(payload.new.completed);
            // console.log(payload.id);
            // Refresh onboarding steps when onboardings table changes
            await fetchOnboardingSteps(userOrders);
          }
        )
        .subscribe();
      
      activeOnboardingsSubscription = subscription;
      return subscription;
    };
    
    // Function to setup all subscriptions
    const setupAllSubscriptions = () => {
      // console.log('Setting up all subscriptions');
      setupOrdersSubscription();
      setupOnboardingsSubscription();
    };
    
    // Set up initial subscriptions
    setupAllSubscriptions();
    
    // Set up window focus event listener to reactivate subscriptions
    const handleWindowFocus = async () => {
      console.log('Window focus gained - reactivating subscriptions');
      await fetchOrders();
      setupAllSubscriptions();
    };
    
    window.addEventListener('focus', handleWindowFocus);

    // Cleanup subscriptions and event listener on component unmount
    return () => {
      // console.log('Cleaning up client subscriptions');
      if (activeOrdersSubscription) {
        supabase.removeChannel(activeOrdersSubscription);
      }
      if (activeOnboardingsSubscription) {
        supabase.removeChannel(activeOnboardingsSubscription);
      }
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [user.id]);  // Added userOrders dependency to ensure subscription has latest data
  
  // Get current order (most recent)
  const currentOrder = userOrders[0];
  
  // For now, default to no subcontracting until we have this data in the database
  const isSubcontracted = false;
  const customBranding = undefined;
  
  // Onboarding  are now fetched from database and stored in state
  
  // Group orders with their products (excluding next action data)
  const ordersByClient = userOrders.reduce((acc, order) => {
    const products = getProductsByOrderId(order.id).map(product => ({
      ...product,
      // Remove nextActionDate from products to eliminate "next action" mentions
      nextActionDate: undefined
    }));
    acc[order.id] = { order, products };
    return acc;
  }, {} as Record<string, { order: any; products: any[] }>);

 
  const handleFileAccess = (link: string, type: string) => {
    toast({
      title: `Accès ${type}`,
      description: "Ouverture du lien dans un nouvel onglet...",
    });
    window.open(link, '_blank');
  };

  /**
   * Handle revision requests from clients
   * Logs request and provides user feedback
   */
  const handleRevisionRequest = (productId: string, description: string) => {
    toast({
      title: "Demande de révision envoyée",
      description: "Votre demande a été transmise à l'équipe de production.",
    });
    console.log(`Revision request for product ${productId}: ${description}`);
  };

  /**
   * Handle onboarding initiation
   * Creates new orders and provides feedback
   */
  const handleStartOnboarding = (orderTitle?: string) => {
    if (orderTitle) {
      toast({
        title: "Nouvelle commande créée",
        description: `La commande "${orderTitle}" a été créée avec succès.`,
      });
      console.log('Creating new order with title:', orderTitle);
    } else {
      toast({
        title: "Onboarding commencé",
        description: "Votre processus d'onboarding a été lancé avec succès.",
      });
      console.log('Starting first-time onboarding');
    }
  };

  // Handler to select a product template for order creation
  const handleSelectTemplate = (template: ProductTemplate) => {
    // Check if product already exists in the selection
    const existingProductIndex = newOrderData.selectedProducts.findIndex(
      (p) => p.template.id === template.id
    );

    if (existingProductIndex !== -1) {
      // If product exists, increment its quantity
      const updatedProducts = [...newOrderData.selectedProducts];
      updatedProducts[existingProductIndex] = {
        ...updatedProducts[existingProductIndex],
        quantity: updatedProducts[existingProductIndex].quantity + 1
      };

      setNewOrderData({
        ...newOrderData,
        selectedProducts: updatedProducts
      });
    } else {
      // If product doesn't exist, add it with quantity 1
      setNewOrderData({
        ...newOrderData,
        selectedProducts: [
          ...newOrderData.selectedProducts,
          { template, quantity: 1 }
        ]
      });
    }
  };

  // Handler to remove a product from selection
  const handleRemoveProduct = (templateId: string) => {
    setNewOrderData({
      ...newOrderData,
      selectedProducts: newOrderData.selectedProducts.filter(
        (p) => p.template.id !== templateId
      )
    });
  };

  // Handler to update product quantity
  const handleUpdateQuantity = (templateId: string, quantity: number) => {
    if (quantity < 1) return; // Prevent quantity less than 1
    
    const updatedProducts = newOrderData.selectedProducts.map(product =>
      product.template.id === templateId ? { ...product, quantity } : product
    );

    setNewOrderData({
      ...newOrderData,
      selectedProducts: updatedProducts
    });
  };

  // Handler to add a custom option
  const handleAddCustomOption = () => {
    setNewOrderData({
      ...newOrderData,
      customOptions: [
        ...newOrderData.customOptions,
        { name: "", description: "", price: "" }
      ]
    });
  };

  // Handler to update a custom option
  const handleUpdateCustomOption = (index: number, field: string, value: string) => {
    const updatedOptions = [...newOrderData.customOptions];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    
    setNewOrderData({
      ...newOrderData,
      customOptions: updatedOptions
    });
  };

  // Handler to remove a custom option
  const handleRemoveCustomOption = (index: number) => {
    setNewOrderData({
      ...newOrderData,
      customOptions: newOrderData.customOptions.filter((_, i) => i !== index)
    });
  };

  // Calculate total price of order
  const getTotalPrice = () => {
    // Sum of product prices (base price * quantity)
    const productsTotal = newOrderData.selectedProducts.reduce(
      (sum, product) => sum + (product.template.basePrice * product.quantity),
      0
    );
    
    // Sum of custom option prices
    const optionsTotal = newOrderData.customOptions.reduce(
      (sum, option) => sum + (parseFloat(option.price) || 0),
      0
    );
    
    return productsTotal + optionsTotal;
  };
  
  // Handle order creation
  const handleCreateOrder = async () => {
    if (!newOrderData.name || newOrderData.selectedProducts.length === 0) {
      toast({
        title: "Erreur",
        description: "Vous devez ajouter un nom de commande et au moins un produit",
        variant: "destructive"
      });
      return;
    }

    // Validate all custom options have complete data
    for (let i = 0; i < newOrderData.customOptions.length; i++) {
      const option = newOrderData.customOptions[i];
      if (!option.name.trim() || !option.description.trim() || !option.price.trim()) {
        toast({
          title: "Erreur",
          description: "Option personnalisée " + (i + 1) + ": Tous les champs doivent être remplis (nom, description, prix)",
          variant: "destructive"
        });
        return;
      }
      
      // Validate price is a valid number
      if (isNaN(parseFloat(option.price)) || parseFloat(option.price) < 0) {
        toast({
          title: "Erreur",
          description: "Option personnalisée " + (i + 1) + ": Le prix doit être un nombre valide",
          variant: "destructive"
        });
        return;
      }
    }

    setIsCreatingOrder(true);
    
    try {
      const totalPrice = getTotalPrice();
      
      // Prepare products JSON data
      const productsData = newOrderData.selectedProducts.map(p => ({
        product_type: p.template.format,
        product_name: p.template.name,
        quantity: p.quantity,
        unit_price: p.template.basePrice,
        total_price: p.template.basePrice * p.quantity
      }));
      
      // Prepare custom options JSON data
      const customOptionsData = newOrderData.customOptions.map(option => ({
        option_name: option.name,
        option_description: option.description,
        price: parseFloat(option.price)
      }));
      
      // Create the order with products and custom options as JSON
      const { data: orderData, error: orderError } = await (supabase as any)
        .from('orders')
        .insert({
          client_id: user.id, // Current user is the client
          // No closer_id needed for client-created orders
          order_name: newOrderData.name,
          status: 'onboarding',
          products: productsData,
          custom_options: customOptionsData,
          total_price: totalPrice
        })
        .select()
        .single();
      
      if (orderError) {
        throw new Error(orderError.message);
      }
      
      console.log('Order created:', orderData);
      
      // Get client information for onboarding links
      const clientEmail = user.email || '';
      const clientName = user.name || '';
      const orderId = orderData.id;
      const orderName = orderData.order_name;
      
      // Create onboarding steps for the new order
      const onboardingSteps = [
        {
          order_id: orderId,
          step: 'call_scheduled',
          completed: false,
          link: `https://illustre.fillout.com/rendez-vous?email=${encodeURIComponent(clientEmail)}&name=${encodeURIComponent(clientName)}&order=${encodeURIComponent(orderId)}`
        },
        {
          order_id: orderId,
          step: 'contract_signed',
          completed: false,
          link: null
        },
        {
          order_id: orderId,
          step: 'payment_made',
          completed: false,
          link: 'https://illustre.com'
        },
        {
          order_id: orderId,
          step: 'form_completed',
          completed: false,
          link: `https://illustre.fillout.com/formulaire-donboarding?email=${encodeURIComponent(clientEmail)}&name=${encodeURIComponent(clientName)}&order=${encodeURIComponent(orderId)}`
        }
      ];
      
      // Insert onboarding steps into the database
      const { error: onboardingError } = await (supabase as any)
        .from('onboardings')
        .insert(onboardingSteps);
      
      if (onboardingError) {
        console.error('Error creating onboarding steps:', onboardingError);
        toast({
          title: "Avertissement",
          description: "Commande créée mais erreur lors de la création des étapes d'onboarding",
          variant: "destructive"
        });
      } else {
        console.log('Onboarding steps created successfully');
        toast({
          title: "Commande créée avec succès",
          description: "Commande \"" + newOrderData.name + "\" créée avec " + newOrderData.selectedProducts.length + " produit(s) et " + newOrderData.customOptions.length + " option(s)",
        });
      }

      // Reset form and close dialog
      setNewOrderData({ 
        name: "",
        selectedProducts: [], 
        customOptions: [] 
      });
      setShowOrderDialog(false);
      
      // Refresh orders list
      fetchOrders();
      
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: "Erreur lors de la création",
        description: error.message || "Impossible de créer la commande",
        variant: "destructive"
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ClientHeader
        user={user}
        isSubcontracted={isSubcontracted}
        customBranding={customBranding}
        finalClientName={currentOrder?.client_name}
        onLogout={onLogout}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-600">Gérez vos commandes et suivez votre processus d'onboarding</p>
          </div>
          
          {/* Add Order Button */}
          <Button 
            onClick={() => setShowOrderDialog(true)}
            className="bg-gradient-turquoise hover:opacity-90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle commande
          </Button>
        </div>
        
        <WelcomeSection
          userName={user.name}
          isSubcontracted={isSubcontracted}
          finalClientName={currentOrder?.client_name}
        />

        <OnboardingSection
          allOrders={userOrders}
          onboardingStepsByOrder={onboardingStepsByOrder}
          hasOrders={userOrders.length > 0}
          onStartOnboarding={handleStartOnboarding}
        />

        <OrdersSection
          ordersByClient={ordersByClient}
          onFileAccess={handleFileAccess}
          onRevisionRequest={handleRevisionRequest}
        />
        
        {/* Order Creation Dialog */}
        <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Créer une nouvelle commande
              </DialogTitle>
              <DialogDescription>
                Sélectionnez les produits souhaités et ajoutez des options personnalisées si nécessaire
              </DialogDescription>
            </DialogHeader>
            
            {/* Order Name Input */}
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium block mb-1">Nom de la commande *</label>
                <Input 
                  value={newOrderData.name}
                  onChange={(e) => setNewOrderData({ ...newOrderData, name: e.target.value })}
                  placeholder="ex: Campagne Marketing Q3 2025"
                  className="w-full"
                />
              </div>
              
              {/* Available Products */}
              <div>
                <h3 className="font-medium mb-2">Produits disponibles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {productTemplates.map((template) => {
                    const isSelected = newOrderData.selectedProducts.some(
                      (p) => p.template.id === template.id
                    );
                    
                    return (
                      <Card 
                        key={template.id} 
                        className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <CardContent className="p-3 flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-gray-500">{template.format}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{template.basePrice}€</p>
                            {isSelected && <Check className="w-4 h-4 text-green-500" />}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
              
              {/* Selected Products */}
              {newOrderData.selectedProducts.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Produits sélectionnés</h3>
                  <div className="space-y-3">
                    {newOrderData.selectedProducts.map((product) => (
                      <Card key={product.template.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{product.template.name}</h4>
                            <p className="text-sm text-gray-500">{product.template.format}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateQuantity(product.template.id, product.quantity - 1);
                                }}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-6 text-center">{product.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateQuantity(product.template.id, product.quantity + 1);
                                }}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <p className="font-medium w-24 text-right">
                              {product.template.basePrice * product.quantity}€
                            </p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveProduct(product.template.id);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Custom Options */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Options personnalisées</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddCustomOption} 
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Ajouter une option
                  </Button>
                </div>
                
                {newOrderData.customOptions.length > 0 ? (
                  <div className="space-y-4">
                    {newOrderData.customOptions.map((option, index) => (
                      <div key={index} className="grid grid-cols-12 gap-3 items-start">
                        <div className="col-span-4">
                          <label className="text-xs text-gray-500 block mb-1">Nom</label>
                          <Input
                            value={option.name}
                            onChange={(e) => handleUpdateCustomOption(index, 'name', e.target.value)}
                            placeholder="ex: Traduction"
                          />
                        </div>
                        <div className="col-span-5">
                          <label className="text-xs text-gray-500 block mb-1">Description</label>
                          <Input
                            value={option.description}
                            onChange={(e) => handleUpdateCustomOption(index, 'description', e.target.value)}
                            placeholder="ex: Traduction en anglais"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-gray-500 block mb-1">Prix</label>
                          <div className="relative">
                            <Input
                              type="text"
                              value={option.price}
                              onChange={(e) => handleUpdateCustomOption(index, 'price', e.target.value)}
                              placeholder="0"
                              className="pl-6"
                            />
                            <span className="absolute left-2 top-2 text-gray-500">
                              €
                            </span>
                          </div>
                        </div>
                        <div className="col-span-1 pt-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500"
                            onClick={() => handleRemoveCustomOption(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Aucune option personnalisée ajoutée.
                  </p>
                )}
              </div>
              
              {/* Order Total */}
              <div className="py-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Total</span>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-xl">{getTotalPrice()}€</span>
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end mt-2">
                <Button
                  onClick={handleCreateOrder}
                  disabled={isCreatingOrder || !newOrderData.name || newOrderData.selectedProducts.length === 0}
                  className="bg-gradient-turquoise hover:opacity-90"
                >
                  {isCreatingOrder ? "Création en cours..." : "Créer la commande"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ClientInterface;
