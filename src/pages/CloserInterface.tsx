
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Profile, mockProfiles, mockOrders, mockOrderProducts } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";
import { 
  LogOut, 
  ArrowLeft, 
  Plus,
  Users,
  ShoppingCart,
  Package,
  Send,
  UserPlus,
  FileText,
  DollarSign,
  Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CloserInterfaceProps {
  user: Profile;
  onLogout: () => void;
}

const CloserInterface = ({ user, onLogout }: CloserInterfaceProps) => {
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState("");
  const [newClientData, setNewClientData] = useState({
    name: "",
    email: "",
    company: ""
  });
  const [newOrderData, setNewOrderData] = useState({
    clientId: "",
    products: [] as Array<{
      title: string;
      format: string;
      price: number;
      instructions: string;
    }>
  });
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Get existing clients (exclude current user and other closers/admins)
  const existingClients = mockProfiles.filter(p => 
    p.roles.includes('client') || p.roles.includes('lead')
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Client créé",
      description: `${newClientData.name} a été ajouté avec succès`,
    });

    setNewClientData({ name: "", email: "", company: "" });
    setIsCreatingClient(false);
  };

  const handleAddProduct = () => {
    setNewOrderData(prev => ({
      ...prev,
      products: [...prev.products, {
        title: "",
        format: "podcast",
        price: 0,
        instructions: ""
      }]
    }));
  };

  const handleRemoveProduct = (index: number) => {
    setNewOrderData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateProduct = (index: number, field: string, value: any) => {
    setNewOrderData(prev => ({
      ...prev,
      products: prev.products.map((product, i) => 
        i === index ? { ...product, [field]: value } : product
      )
    }));
  };

  const handleCreateOrder = async () => {
    if (!newOrderData.clientId || newOrderData.products.length === 0) {
      toast({
        title: "Erreur",
        description: "Sélectionnez un client et ajoutez au moins un produit",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingOrder(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Commande créée",
      description: "La commande a été créée avec succès",
    });

    setNewOrderData({ clientId: "", products: [] });
    setIsCreatingOrder(false);
  };

  const handleLaunchOnboarding = async (orderId: string) => {
    toast({
      title: "Lancement de l'onboarding",
      description: "Génération des liens et envoi des emails...",
    });

    // Simulate onboarding launch
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Onboarding lancé",
      description: "Tous les liens ont été générés et les emails envoyés au client",
    });
  };

  const totalOrderValue = newOrderData.products.reduce((sum, product) => sum + product.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
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
            Gérez vos clients, créez des commandes et lancez les processus d'onboarding.
          </p>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Créer</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
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
                    Créez une nouvelle commande pour un client existant
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

                  {/* Products */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium">Produits</label>
                      <Button variant="outline" size="sm" onClick={handleAddProduct}>
                        <Plus className="w-4 h-4 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                    
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {newOrderData.products.map((product, index) => (
                        <div key={index} className="p-3 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Produit {index + 1}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemoveProduct(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Supprimer
                            </Button>
                          </div>
                          <Input
                            placeholder="Titre du produit"
                            value={product.title}
                            onChange={(e) => handleUpdateProduct(index, 'title', e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Select value={product.format} onValueChange={(value) => 
                              handleUpdateProduct(index, 'format', value)
                            }>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="podcast">Podcast</SelectItem>
                                <SelectItem value="scripted">Scripté</SelectItem>
                                <SelectItem value="micro-interview">Micro-interview</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              placeholder="Prix"
                              value={product.price}
                              onChange={(e) => handleUpdateProduct(index, 'price', Number(e.target.value))}
                            />
                          </div>
                          <Textarea
                            placeholder="Instructions spécifiques"
                            value={product.instructions}
                            onChange={(e) => handleUpdateProduct(index, 'instructions', e.target.value)}
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>

                    {newOrderData.products.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between font-medium">
                          <span>Total de la commande:</span>
                          <span className="text-lg">{totalOrderValue}€</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={handleCreateOrder}
                    disabled={isCreatingOrder || !newOrderData.clientId || newOrderData.products.length === 0}
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
                          <Button
                            onClick={() => handleLaunchOnboarding(order.id)}
                            className="bg-gradient-turquoise hover:opacity-90"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Lancer l'onboarding
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {existingClients.map((client) => (
                <Card key={client.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{client.avatar}</div>
                      <div>
                        <h3 className="font-medium">{client.name}</h3>
                        <p className="text-sm text-gray-600">{client.email}</p>
                        <div className="flex gap-1 mt-1">
                          {client.roles.map((role) => (
                            <Badge key={role} variant="outline" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
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
