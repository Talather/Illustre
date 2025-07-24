import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Profile, mockProfiles, mockOrders, productTemplates, ProductTemplate } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";
import logo from "./../assets/logo.png";

import { 
  LogOut, 
  ArrowLeft, 
  Plus,
  ShoppingCart,
  Send,
  UserPlus,
  DollarSign,
  Settings,
  Edit,
  Package,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client.js";
import emailjs from "emailjs-com";

interface ClientUser {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
  created_at: string;
  tempPass?: boolean;
  temporaryPassword?: string;
}

interface Order {
  id: string;
  client_id: string;
  closer_id: string;
  order_name: string;
  status: string;
  products: any[];
  custom_options: any[];
  total_price: number;
  created_at: string;
  updated_at: string;
  // Client info from JOIN
  client_name?: string;
  client_email?: string;
  temporaryPassword?:string;
}

interface CloserInterfaceProps {
  user: Profile;
  onLogout: () => void;
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

const CloserInterface = ({ user, onLogout }: CloserInterfaceProps) => {
  // console.log(user);
  // const navigate = useNavigate();
  const [newClientData, setNewClientData] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
  });
  const [newOrderData, setNewOrderData] = useState({
    clientId: "",
    name: "",
    selectedProducts: [] as SelectedProduct[],
    customOptions: [] as CustomOption[]
  });
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  
  // State for clients fetched from Supabase
  const [existingClients, setExistingClients] = useState<ClientUser[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);

  // State for orders fetched from Supabase
  const [existingOrders, setExistingOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Function to fetch clients from Supabase
  const fetchClients = async () => {
    try {
      setIsLoadingClients(true);
      const { data, error } = await (supabase as any)
        .from('users')
        .select('id, email, full_name, roles, tempPass, temporaryPassword, created_at')
        .filter('roles', 'cs', '{"client"}');

      if (error) {
        console.error('Error fetching clients:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les clients",
          variant: "destructive"
        });
        return;
      }

      setExistingClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients",
        variant: "destructive"
      });
    } finally {
      setIsLoadingClients(false);
    }
  };

  // Function to fetch orders from Supabase
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
          users!client_id (id, full_name, email, tempPass, temporaryPassword)
        `)
        .order('created_at', { ascending: false })
        .eq('closer_id', user.id);

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
        temporaryPassword: order.users?.temporaryPassword || '',
        tempPass: order.users?.tempPass || false,
      })) || [];

      setExistingOrders(transformedOrders);
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

  // Fetch clients and orders on component mount and set up real-time subscriptions
  useEffect(() => {
    fetchClients();
    fetchOrders();

    // Set up real-time subscription for users table
    const usersSubscription = supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'users'
        },
        (payload) => {
          console.log('Users table changed:', payload);
          // Refresh clients when users table changes
          fetchClients();
        }
      )
      .subscribe();

    // Set up real-time subscription for orders table
    const ordersSubscription = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Orders table changed:', payload);
          // Refresh orders when orders table changes
          fetchOrders();
        }
      )
      .subscribe();

    // Cleanup subscriptions on component unmount
    return () => {
      console.log('Cleaning up real-time subscriptions');
      supabase.removeChannel(usersSubscription);
      supabase.removeChannel(ordersSubscription);
    };
  }, []);

  const handleCreateClient = async () => {
    if (!newClientData.name || !newClientData.email || !newClientData.password) {
      toast({
        title: "Erreur",
        description: "Nom, email et mot de passe sont requis",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingClient(true);
    
    try {
      
      // Call the Supabase edge function to create new client
      const { data, error } = await supabase.functions.invoke('createNewClient', {
        body: {
          full_name: newClientData.name,
          email: newClientData.email,
          password: newClientData.password,
          company_name: newClientData.company || ''
        }
      });
      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Client créé avec succès",
        description: `${newClientData.name} a été ajouté en tant que client`,
      });

      // Reset form
      setNewClientData({ name: "", email: "", password: "", company: "" });
      
      // Refresh clients list
      await fetchClients();
      
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast({
        title: "Erreur lors de la création",
        description: error.message || "Impossible de créer le client",
        variant: "destructive"
      });
    } finally {
      setIsCreatingClient(false);
    }
  };

  const handleSelectTemplate = (template: ProductTemplate) => {
    setNewOrderData(prev => {
      const existingProductIndex = prev.selectedProducts.findIndex(
        p => p.template.id === template.id
      );
      
      if (existingProductIndex >= 0) {
        // If product already exists, increase quantity
        const updatedProducts = [...prev.selectedProducts];
        updatedProducts[existingProductIndex].quantity += 1;
        return { ...prev, selectedProducts: updatedProducts };
      } else {
        // If product doesn't exist, add it
        return {
          ...prev,
          selectedProducts: [...prev.selectedProducts, { template, quantity: 1 }]
        };
      }
    });
    
    toast({
      title: "Produit ajouté",
      description: `${template.name} - ${template.basePrice}€`,
    });
  };
  
  const handleRemoveProduct = (templateId: string) => {
    setNewOrderData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.filter(p => p.template.id !== templateId)
    }));
  };
  
  const handleUpdateQuantity = (templateId: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveProduct(templateId);
      return;
    }
    
    setNewOrderData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map(p => 
        p.template.id === templateId ? { ...p, quantity } : p
      )
    }));
  };

  const handleAddCustomOption = () => {
    setNewOrderData(prev => ({
      ...prev,
      customOptions: [...prev.customOptions, {
        name: "",
        description: "",
        price: ""
      }]
    }));
  };

  const handleUpdateCustomOption = (index: number, field: string, value: string) => {
    setNewOrderData(prev => ({
      ...prev,
      customOptions: prev.customOptions.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };

  const handleRemoveCustomOption = (index: number) => {
    setNewOrderData(prev => ({
      ...prev,
      customOptions: prev.customOptions.filter((_, i) => i !== index)
    }));
  };

  const handleCreateOrder = async () => {
    if (!newOrderData.clientId || !newOrderData.name || newOrderData.selectedProducts.length === 0) {
      toast({
        title: "Erreur",
        description: "Sélectionnez un client, nom de commande et au moins un produit",
        variant: "destructive"
      });
      return;
    }

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
          client_id: newOrderData.clientId,
          closer_id: user.id, // Current user (closer) creates the order
          order_name: newOrderData.name,
          status: 'pending',
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
      const selectedClient = existingClients.find(client => client.id === newOrderData.clientId);
      const clientEmail = selectedClient?.email || '';
      const clientName = selectedClient?.full_name || '';
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

      // Reset form
      setNewOrderData({ 
        clientId: "", 
        name: "",
        selectedProducts: [], 
        customOptions: [] 
      });
      
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

  const handleLaunchOnboarding = async (orderId: string) => {
    try {
      // Find the order
      const order = existingOrders.find(o => o.id === orderId);
      console.log(order);
      if (!order) {
        toast({
          title: "Erreur",
          description: "Commande non trouvée",
          variant: "destructive"
        });
        return;
      }

      if (!order.client_email) {
        toast({
          title: "Erreur",
          description: "Email du client non trouvé",
          variant: "destructive"
        });
        return;
      }
      const client = existingClients.find(c => c.id === order.client_id);
      console.log(client);
      if (client.tempPass === true) {
        toast({
          title: "Lancement de l'onboarding",
          description: "Envoi de l'email au client...",
        });
  
        // Initialize EmailJS with your public key
        emailjs.init("x-KEsWMqd6YU2shKC");
        
  
        // Email template parameters
        const templateParams = {
          email: order.client_email,
          password:order.temporaryPassword,
          website: window.location.origin + "/login"
        };
  
        // Send email using EmailJS
        await emailjs.send(
          'service_w3kbrbw', // Your service ID from the screenshot
          'template_amirf0e', // You'll need to create this template
          templateParams,
          'x-KEsWMqd6YU2shKC' // Your public key
        );
      }

     

      // Update order status to 'onboarding' in database
      const { error: updateError } = await (supabase as any)
        .from('orders')
        .update({
          status: 'onboarding',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        throw new Error('Erreur lors de la mise à jour du statut de la commande');
      }

      // Refresh orders list
      await fetchOrders();

      toast({
        title: "Onboarding lancé",
        description: `Email envoyé à ${order.client_email} avec succès`,
      });

    } catch (error: any) {
      console.error('Error launching onboarding:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer l'email",
        variant: "destructive"
      });
    }
  };

  const getTotalPrice = () => {
    const productsTotal = newOrderData.selectedProducts.reduce((total, product) => {
      return total + (product.template.basePrice * product.quantity);
    }, 0);
    
    const customOptionsTotal = newOrderData.customOptions.reduce((total, option) => {
      return total + (parseFloat(option.price) || 0);
    }, 0);
    
    return productsTotal + customOptionsTotal;
  };

  const groupedTemplates = {
    podcast: productTemplates.filter(t => t.format === 'podcast'),
    scripted: productTemplates.filter(t => t.format === 'scripted'),
    'micro-interview': productTemplates.filter(t => t.format === 'micro-interview')
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
            <img src={logo} className="w-36"/>
              <div className="hidden sm:block text-gray-300">|</div>
              <div className="hidden sm:block text-gray-600">
                Interface Closer
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Closer
              </Badge>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interface Closer 💼
          </h1>
          <p className="text-gray-600">
            Gérez vos clients, créez des commandes avec templates prédéfinis et lancez les processus d'onboarding.
          </p>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Créer</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
          </TabsList>

          {/* Create Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create Client */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Créer un nouveau client
                  </CardTitle>
                  <CardDescription>
                    Ajoutez un nouveau client à la base de données
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nom complet *</label>
                    <Input
                      placeholder="Jean Dupont"
                      value={newClientData.name}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      type="email"
                      placeholder="jean@exemple.com"
                      value={newClientData.email}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Mot de passe *</label>
                    <Input
                      type="password"
                      placeholder="Mot de passe temporaire"
                      value={newClientData.password}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Entreprise</label>
                    <Input
                      placeholder="Nom de l'entreprise"
                      value={newClientData.company}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, company: e.target.value }))}
                    />
                  </div>
                  <Button 
                    onClick={handleCreateClient}
                    disabled={isCreatingClient}
                    className="w-full bg-gradient-turquoise hover:opacity-90"
                  >
                    {isCreatingClient ? "Création..." : "Créer le client"}
                  </Button>
                </CardContent>
              </Card>

              {/* Create Order */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Créer une commande
                  </CardTitle>
                  <CardDescription>
                    Créez une nouvelle commande avec templates prédéfinis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Client *</label>
                    <Select value={newOrderData.clientId} onValueChange={(value) => 
                      setNewOrderData(prev => ({ ...prev, clientId: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingClients ? (
                          <SelectItem value="loading" disabled>
                            Chargement des clients...
                          </SelectItem>
                        ) : existingClients.length === 0 ? (
                          <SelectItem value="no-clients" disabled>
                            Aucun client trouvé
                          </SelectItem>
                        ) : (
                          existingClients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.full_name} ({client.email})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Nom de la commande *</label>
                    <Input
                      placeholder="ex: Campagne Podcast Q1 2024"
                      value={newOrderData.name}
                      onChange={(e) => setNewOrderData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  {/* Selected Products */}
                  {newOrderData.selectedProducts.length > 0 && (
                    <div>
                      <label className="text-sm font-medium">Produits sélectionnés</label>
                      <div className="space-y-2 mt-2">
                        {newOrderData.selectedProducts.map((product) => (
                          <div key={product.template.id} className="p-3 border rounded-lg bg-primary/5 border-primary">
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <div className="font-medium text-sm">{product.template.name}</div>
                                <div className="text-xs text-gray-600">{product.template.description}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleUpdateQuantity(product.template.id, product.quantity - 1)}
                                    className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center text-sm">{product.quantity}</span>
                                  <button
                                    onClick={() => handleUpdateQuantity(product.template.id, product.quantity + 1)}
                                    className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs"
                                  >
                                    +
                                  </button>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-sm">{product.template.basePrice * product.quantity}€</div>
                                  <div className="text-xs text-gray-500">{product.template.basePrice}€/unité</div>
                                </div>
                                <button
                                  onClick={() => handleRemoveProduct(product.template.id)}
                                  className="ml-2 w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center text-xs text-red-600"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Template Selection */}
                  <div>
                    <label className="text-sm font-medium">Ajouter des produits</label>
                    <div className="space-y-4 mt-2">
                      {Object.entries(groupedTemplates).map(([format, templates]) => (
                        <div key={format} className="space-y-2">
                          <h4 className="font-medium text-sm capitalize">
                            {format === 'podcast' ? 'Podcast' :
                             format === 'scripted' ? 'Scripté' :
                             'Micro-trottoir'}
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {templates.map((template) => {
                              const isSelected = newOrderData.selectedProducts.some(p => p.template.id === template.id);
                              return (
                                <div
                                  key={template.id}
                                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                    isSelected
                                      ? 'border-green-500 bg-green-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                  onClick={() => handleSelectTemplate(template)}
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <div className="font-medium text-sm">{template.name}</div>
                                      <div className="text-xs text-gray-600">{template.description}</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-bold text-sm">{template.basePrice}€</div>
                                      <div className="text-xs text-gray-500">{template.quantity} vidéos</div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Options */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium">Options personnalisées</label>
                      <Button variant="outline" size="sm" onClick={handleAddCustomOption}>
                        <Plus className="w-4 h-4 mr-1" />
                        Ajouter option
                      </Button>
                    </div>
                    
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {newOrderData.customOptions.map((option, index) => (
                        <div key={index} className="p-3 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Option {index + 1}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemoveCustomOption(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Supprimer
                            </Button>
                          </div>
                          <Input
                            placeholder="Nom de l'option"
                            value={option.name}
                            onChange={(e) => handleUpdateCustomOption(index, 'name', e.target.value)}
                          />
                          <Textarea
                            placeholder="Description"
                            value={option.description}
                            onChange={(e) => handleUpdateCustomOption(index, 'description', e.target.value)}
                            rows={2}
                          />
                          <Input
                            placeholder="Prix"
                            type="number"
                            value={option.price}
                            onChange={(e) => handleUpdateCustomOption(index, 'price', e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {(newOrderData.selectedProducts.length > 0 || newOrderData.customOptions.length > 0) && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between font-medium">
                        <span>Prix total:</span>
                        <span className="text-lg">{getTotalPrice()}€</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {newOrderData.selectedProducts.length} produit(s) + {newOrderData.customOptions.length} option(s) personnalisée(s)
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleCreateOrder}
                    disabled={isCreatingOrder || !newOrderData.clientId || newOrderData.selectedProducts.length === 0}
                    className="w-full bg-gradient-turquoise hover:opacity-90"
                  >
                    {isCreatingOrder ? "Création..." : "Créer la commande"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {isLoadingOrders ? (
              <div className="flex justify-center items-center py-8">
                <p className="text-gray-500">Chargement des commandes...</p>
              </div>
            ) : existingOrders.length === 0 ? (
              <div className="flex justify-center items-center py-8">
                <p className="text-gray-500">Aucune commande trouvée</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {existingOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{order.order_name}</h3>
                          <p className="text-gray-600">{order.client_name}</p>
                          <p className="text-sm text-gray-500">
                            Créé le {new Date(order.created_at).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-sm font-medium text-gray-700 mt-1">
                            {order.products.length} produit(s) • {order.total_price}€
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-orange-100 text-orange-800'
                          }>
                            {order.status === 'completed' ? 'Terminé' :
                             order.status === 'in_progress' ? 'En cours' : 
                             order.status === 'pending' ? 'En attente' : 'Onboarding'}
                          </Badge>
                          
                          {order.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                onClick={() => setEditingOrderId(order.id)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier
                              </Button>
                              <Button
                                onClick={() => handleLaunchOnboarding(order.id)}
                                className="bg-gradient-turquoise hover:opacity-90"
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Lancer l'onboarding
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CloserInterface;