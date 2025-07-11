
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  LogOut, 
  Plus,
  ShoppingCart,
  Send,
  UserPlus,
  Edit,
  Loader2
} from "lucide-react";

interface ProductTemplate {
  id: string;
  name: string;
  description: string;
  video_count: number;
  price_cents: number;
  format: string;
  features: string[];
}

interface CustomOption {
  name: string;
  description: string;
  price_adjustment_cents: number;
}

const CloserInterface = () => {
  const { signOut, user, userRoles } = useAuth();
  const [newClientData, setNewClientData] = useState({
    name: "",
    email: "",
    company: ""
  });
  const [newOrderData, setNewOrderData] = useState({
    clientId: "",
    name: "",
    selectedTemplate: null as ProductTemplate | null,
    customOptions: [] as CustomOption[]
  });
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isLaunchingOnboarding, setIsLaunchingOnboarding] = useState<string | null>(null);
  
  const [existingClients, setExistingClients] = useState([]);
  const [existingOrders, setExistingOrders] = useState([]);
  const [productTemplates, setProductTemplates] = useState<ProductTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Verify user is a closer
  useEffect(() => {
    if (!userRoles.includes('closer')) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions pour accéder à cette interface.",
        variant: "destructive"
      });
    }
  }, [userRoles]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch existing clients
      const { data: clients, error: clientsError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          company,
          user_roles!inner(role)
        `)
        .eq('user_roles.role', 'client');

      if (clientsError) throw clientsError;
      setExistingClients(clients || []);

      // Fetch orders created by this closer
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_client_id_fkey(name, email)
        `)
        .eq('closer_id', user?.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setExistingOrders(orders || []);

      // Fetch product templates
      const { data: templates, error: templatesError } = await supabase
        .from('product_templates')
        .select('*')
        .eq('is_active', true)
        .order('price_cents', { ascending: true });

      if (templatesError) throw templatesError;
      setProductTemplates(templates || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!newOrderData.clientId || !newOrderData.name || !newOrderData.selectedTemplate) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingOrder(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-client-and-order', {
        body: {
          clientName: existingClients.find(c => c.id === newOrderData.clientId)?.name,
          clientEmail: existingClients.find(c => c.id === newOrderData.clientId)?.email,
          orderName: newOrderData.name,
          templateId: newOrderData.selectedTemplate.id,
          customOptions: newOrderData.customOptions
        }
      });

      if (error) throw error;

      toast({
        title: "Commande créée",
        description: `La commande "${newOrderData.name}" a été créée avec succès`,
      });

      // Reset form and refresh data
      setNewOrderData({ 
        clientId: "", 
        name: "",
        selectedTemplate: null, 
        customOptions: [] 
      });
      
      await fetchData();

    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la commande",
        variant: "destructive"
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleLaunchOnboarding = async (orderId: string) => {
    const order = existingOrders.find(o => o.id === orderId);
    if (!order) return;

    setIsLaunchingOnboarding(orderId);
    
    try {
      const { error } = await supabase.functions.invoke('send-onboarding-email', {
        body: {
          orderId: order.id,
          clientEmail: order.profiles.email,
          clientName: order.profiles.name
        }
      });

      if (error) throw error;

      toast({
        title: "Onboarding lancé",
        description: "L'email d'onboarding a été envoyé au client",
      });

      // Update order status to in_progress
      await supabase
        .from('orders')
        .update({ status: 'in_progress' })
        .eq('id', orderId);

      await fetchData();

    } catch (error) {
      console.error('Error launching onboarding:', error);
      toast({
        title: "Erreur",
        description: "Impossible de lancer l'onboarding",
        variant: "destructive"
      });
    } finally {
      setIsLaunchingOnboarding(null);
    }
  };

  const handleSelectTemplate = (template: ProductTemplate) => {
    setNewOrderData(prev => ({
      ...prev,
      selectedTemplate: template
    }));
  };

  const handleAddCustomOption = () => {
    setNewOrderData(prev => ({
      ...prev,
      customOptions: [...prev.customOptions, {
        name: "",
        description: "",
        price_adjustment_cents: 0
      }]
    }));
  };

  const handleUpdateCustomOption = (index: number, field: string, value: string | number) => {
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

  const getTotalPrice = () => {
    const basePrice = newOrderData.selectedTemplate?.price_cents || 0;
    const customOptionsPrice = newOrderData.customOptions.reduce((sum, option) => sum + (option.price_adjustment_cents || 0), 0);
    return basePrice + customOptionsPrice;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement des données...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-avigea text-gradient-turquoise">
                illustre!
              </div>
              <div className="hidden sm:block text-gray-300">|</div>
              <div className="hidden sm:block text-gray-600">
                Interface Closer
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Closer
              </Badge>
              <Button variant="outline" onClick={signOut}>
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

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="create">Créer</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="grid gap-4">
              {existingOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500">Aucune commande trouvée</p>
                  </CardContent>
                </Card>
              ) : (
                existingOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{order.order_number}</h3>
                          <p className="text-gray-600">{order.profiles.name} ({order.profiles.email})</p>
                          <p className="text-sm text-gray-500">
                            Créé le {new Date(order.created_at).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-sm font-medium">
                            Total: {(order.total_amount_cents / 100).toFixed(2)}€
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-orange-100 text-orange-800'
                          }>
                            {order.status === 'completed' ? 'Terminé' :
                             order.status === 'in_progress' ? 'En cours' : 'Onboarding'}
                          </Badge>
                          
                          {order.status === 'onboarding' && (
                            <Button
                              onClick={() => handleLaunchOnboarding(order.id)}
                              disabled={isLaunchingOnboarding === order.id}
                              className="bg-gradient-turquoise hover:opacity-90"
                            >
                              {isLaunchingOnboarding === order.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Envoi...
                                </>
                              ) : (
                                <>
                                  <Send className="w-4 h-4 mr-2" />
                                  Lancer l'onboarding
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Create Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
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
                        {existingClients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} ({client.email})
                          </SelectItem>
                        ))}
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

                  {/* Template Selection */}
                  <div>
                    <label className="text-sm font-medium">Template produit *</label>
                    <div className="grid grid-cols-1 gap-3 mt-2">
                      {productTemplates.map((template) => (
                        <div
                          key={template.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            newOrderData.selectedTemplate?.id === template.id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleSelectTemplate(template)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{template.name}</div>
                              <div className="text-sm text-gray-600">{template.description}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                Format: {template.format}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{(template.price_cents / 100).toFixed(0)}€</div>
                              <div className="text-sm text-gray-500">{template.video_count} vidéos</div>
                            </div>
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
                            type="number"
                            placeholder="Ajustement prix (centimes)"
                            value={option.price_adjustment_cents}
                            onChange={(e) => handleUpdateCustomOption(index, 'price_adjustment_cents', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {newOrderData.selectedTemplate && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between font-medium">
                        <span>Prix total:</span>
                        <span className="text-lg">{(getTotalPrice() / 100).toFixed(2)}€</span>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleCreateOrder}
                    disabled={isCreatingOrder || !newOrderData.clientId || !newOrderData.selectedTemplate}
                    className="w-full bg-gradient-turquoise hover:opacity-90"
                  >
                    {isCreatingOrder ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Création...
                      </>
                    ) : (
                      "Créer la commande"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CloserInterface;
