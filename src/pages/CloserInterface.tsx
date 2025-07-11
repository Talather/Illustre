import { useState } from "react";
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

interface CloserInterfaceProps {
  user: Profile;
  onLogout: () => void;
}

interface CustomOption {
  name: string;
  description: string;
  stripeUrl: string;
}

const CloserInterface = ({ user, onLogout }: CloserInterfaceProps) => {
  const navigate = useNavigate();
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
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  // Get existing clients
  const existingClients = mockProfiles.filter(p => 
    p.roles.includes('client')
  );

  // Get existing orders
  const existingOrders = mockOrders;

  const handleCreateClient = async () => {
    if (!newClientData.name || !newClientData.email) {
      toast({
        title: "Erreur",
        description: "Nom et email sont requis",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingClient(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Client créé",
      description: `${newClientData.name} a été ajouté avec succès`,
    });

    setNewClientData({ name: "", email: "", company: "" });
    setIsCreatingClient(false);
  };

  const handleSelectTemplate = (template: ProductTemplate) => {
    setNewOrderData(prev => ({
      ...prev,
      selectedTemplate: template
    }));
    toast({
      title: "Template sélectionné",
      description: `${template.name} - ${template.basePrice}€`,
    });
  };

  const handleAddCustomOption = () => {
    setNewOrderData(prev => ({
      ...prev,
      customOptions: [...prev.customOptions, {
        name: "",
        description: "",
        stripeUrl: ""
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
    if (!newOrderData.clientId || !newOrderData.name || !newOrderData.selectedTemplate) {
      toast({
        title: "Erreur",
        description: "Sélectionnez un client, nom de commande et un template",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingOrder(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Commande créée",
      description: "La commande a été créée avec succès",
    });

    setNewOrderData({ 
      clientId: "", 
      name: "",
      selectedTemplate: null, 
      customOptions: [] 
    });
    setIsCreatingOrder(false);
  };

  const handleLaunchOnboarding = async (orderId: string) => {
    toast({
      title: "Lancement de l'onboarding",
      description: "Génération des liens et envoi des emails...",
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Onboarding lancé",
      description: "Tous les liens ont été générés et les emails envoyés au client",
    });
  };

  const getTotalPrice = () => {
    return (newOrderData.selectedTemplate?.basePrice || 0);
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
                    <div className="space-y-4 mt-2">
                      {Object.entries(groupedTemplates).map(([format, templates]) => (
                        <div key={format} className="space-y-2">
                          <h4 className="font-medium text-sm capitalize">
                            {format === 'podcast' ? 'Podcast' :
                             format === 'scripted' ? 'Scripté' :
                             'Micro-trottoir'}
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {templates.map((template) => (
                              <div
                                key={template.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                  newOrderData.selectedTemplate?.id === template.id
                                    ? 'border-primary bg-primary/5'
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
                            ))}
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
                            placeholder="Lien Stripe checkout"
                            value={option.stripeUrl}
                            onChange={(e) => handleUpdateCustomOption(index, 'stripeUrl', e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {newOrderData.selectedTemplate && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between font-medium">
                        <span>Prix du template:</span>
                        <span className="text-lg">{getTotalPrice()}€</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Options personnalisées facturées séparément
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleCreateOrder}
                    disabled={isCreatingOrder || !newOrderData.clientId || !newOrderData.selectedTemplate}
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
            <div className="grid gap-4">
              {existingOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">Commande #{order.id}</h3>
                        <p className="text-gray-600">{order.clientName}</p>
                        <p className="text-sm text-gray-500">
                          Créé le {new Date(order.createdAt).toLocaleDateString('fr-FR')}
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CloserInterface;