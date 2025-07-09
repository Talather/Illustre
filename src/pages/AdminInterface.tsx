
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Profile, 
  mockProfiles, 
  mockOrders, 
  mockOrderProducts, 
  mockOnboardingSteps 
} from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";
import { 
  LogOut, 
  ArrowLeft, 
  Users,
  ShoppingCart,
  Package,
  Settings,
  Mail,
  Edit,
  Calendar,
  BarChart3,
  Shield,
  Eye,
  Save
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminInterfaceProps {
  user: Profile;
  onLogout: () => void;
}

const AdminInterface = ({ user, onLogout }: AdminInterfaceProps) => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  const handleUpdateUserRoles = async (userId: string, newRoles: string[]) => {
    toast({
      title: "Rôles mis à jour",
      description: "Les rôles de l'utilisateur ont été modifiés",
    });
  };

  const handleSendTestEmail = async (type: string, recipient: string) => {
    toast({
      title: "Email de test envoyé",
      description: `Email "${type}" envoyé à ${recipient}`,
    });
  };

  const handleUpdateProductStatus = async (productId: string, newStatus: string) => {
    toast({
      title: "Statut mis à jour",
      description: "Le statut du produit a été modifié",
    });
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      lead: "bg-yellow-100 text-yellow-800",
      client: "bg-blue-100 text-blue-800",
      closer: "bg-green-100 text-green-800",
      collaborator: "bg-purple-100 text-purple-800",
      admin: "bg-red-100 text-red-800"
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-gray-100 text-gray-800',
      'files_requested': 'bg-orange-100 text-orange-800',
      'in_production': 'bg-blue-100 text-blue-800',
      'delivered': 'bg-green-100 text-green-800',
      'revision_requested': 'bg-purple-100 text-purple-800',
      'onboarding': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Statistics
  const totalUsers = mockProfiles.length;
  const totalOrders = mockOrders.length;
  const totalProducts = mockOrderProducts.length;
  const activeOrders = mockOrders.filter(o => o.status !== 'completed').length;

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
                Administration
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-red-100 text-red-800">
                <Shield className="w-3 h-3 mr-1" />
                Admin
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
            Tableau de bord Admin 🛠️
          </h1>
          <p className="text-gray-600">
            Gestion complète de la plateforme et supervision de tous les projets.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalUsers}</div>
                  <div className="text-sm text-gray-600">Utilisateurs</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalOrders}</div>
                  <div className="text-sm text-gray-600">Commandes</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalProducts}</div>
                  <div className="text-sm text-gray-600">Produits</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{activeOrders}</div>
                  <div className="text-sm text-gray-600">Projets actifs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des utilisateurs</CardTitle>
                <CardDescription>
                  Modifiez les rôles et gérez les accès des utilisateurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockProfiles.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{profile.avatar}</div>
                        <div>
                          <div className="font-medium">{profile.name}</div>
                          <div className="text-sm text-gray-600">{profile.email}</div>
                          <div className="flex gap-1 flex-wrap mt-1">
                            {profile.roles.map((role) => (
                              <Badge 
                                key={role}
                                variant="outline"
                                className={getRoleBadgeColor(role)}
                              >
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          profile.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }>
                          {profile.status === 'active' ? 'Actif' : 'Inactif'}
                        </Badge>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Modifier {profile.name}</DialogTitle>
                              <DialogDescription>
                                Modifiez les rôles et paramètres de l'utilisateur
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Rôles</label>
                                <div className="mt-2 space-y-2">
                                  {['lead', 'client', 'closer', 'collaborator', 'admin'].map((role) => (
                                    <label key={role} className="flex items-center gap-2">
                                      <input 
                                        type="checkbox" 
                                        defaultChecked={profile.roles.includes(role)}
                                      />
                                      <span className="capitalize">{role}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <Button 
                                onClick={() => handleUpdateUserRoles(profile.id, profile.roles)}
                                className="w-full"
                              >
                                <Save className="w-4 h-4 mr-2" />
                                Enregistrer
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Management */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des commandes</CardTitle>
                <CardDescription>
                  Vue d'ensemble de toutes les commandes et leur statut
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium font-mono">{order.id}</div>
                        <div className="text-sm text-gray-600">{order.clientName}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status === 'onboarding' ? 'Onboarding' :
                           order.status === 'in_progress' ? 'En cours' : 'Terminé'}
                        </Badge>
                        {order.isSubcontracted && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            Sous-traitance
                          </Badge>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Management */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des produits</CardTitle>
                <CardDescription>
                  Modifiez les statuts, responsables et instructions des produits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockOrderProducts.map((product) => (
                    <Card key={product.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{product.title}</h3>
                            <p className="text-sm text-gray-600">
                              Responsable: {product.responsible} • Format: {product.format}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(product.status)}>
                              {product.status}
                            </Badge>
                            <Select
                              value={product.status}
                              onValueChange={(value) => handleUpdateProductStatus(product.id, value)}
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
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Management */}
          <TabsContent value="emails" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Emails de test</CardTitle>
                <CardDescription>
                  Déclenchez manuellement des emails de test pour valider les automatisations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handleSendTestEmail("Onboarding", "test@client.com")}
                    className="flex items-center gap-2 p-4 h-auto"
                  >
                    <Mail className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Email d'onboarding</div>
                      <div className="text-sm text-gray-600">Liens et instructions initiales</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleSendTestEmail("Fichiers", "test@client.com")}
                    className="flex items-center gap-2 p-4 h-auto"
                  >
                    <Mail className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Demande de fichiers</div>
                      <div className="text-sm text-gray-600">Lien Dropbox et instructions</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleSendTestEmail("Livrable", "test@client.com")}
                    className="flex items-center gap-2 p-4 h-auto"
                  >
                    <Mail className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Livrable disponible</div>
                      <div className="text-sm text-gray-600">Lien Frame.io et visualisation</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleSendTestEmail("Révision", "test@collaborator.com")}
                    className="flex items-center gap-2 p-4 h-auto"
                  >
                    <Mail className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Demande de révision</div>
                      <div className="text-sm text-gray-600">Notification au collaborateur</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres système</CardTitle>
                <CardDescription>
                  Configuration globale de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Liens par défaut</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Base URL Frame.io</label>
                        <Input defaultValue="https://frame.io/project/" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Base URL Dropbox</label>
                        <Input defaultValue="https://dropbox.com/deposit/" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Base URL Notion</label>
                        <Input defaultValue="https://notion.so/" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Templates d'emails</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Email d'onboarding</label>
                        <Textarea 
                          rows={3}
                          defaultValue="Bonjour {client_name}, voici vos liens d'onboarding..."
                        />
                      </div>
                    </div>
                  </div>

                  <Button className="bg-gradient-turquoise hover:opacity-90">
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer les paramètres
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminInterface;
