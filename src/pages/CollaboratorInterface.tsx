import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Profile, mockOrderProducts, mockOrders } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";
import { 
  LogOut, 
  Calendar,
  Filter,
  Upload,
  Send,
  Clock,
  Video,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Edit,
  MessageSquare,
} from "lucide-react";

interface CollaboratorInterfaceProps {
  user: Profile;
  onLogout: () => void;
}

const CollaboratorInterface = ({ user, onLogout }: CollaboratorInterfaceProps) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingFrameLink, setEditingFrameLink] = useState<{[key: string]: string}>({});

  // Get products assigned to current user
  const assignedProducts = mockOrderProducts.filter(product => 
    product.responsible === user.name
  );

  // Group products by order
  const productsByOrder = assignedProducts.reduce((acc, product) => {
    const order = mockOrders.find(o => 
      mockOrderProducts.some(p => p.orderId === o.id && p.id === product.id)
    );
    if (order) {
      if (!acc[order.id]) {
        acc[order.id] = {
          order,
          products: []
        };
      }
      acc[order.id].products.push(product);
    }
    return acc;
  }, {} as Record<string, {order: any, products: any[]}>);

  // Filter products based on status
  const filteredProductsByOrder = Object.entries(productsByOrder).reduce((acc, [orderId, data]) => {
    const filteredProducts = data.products.filter(product => {
      if (statusFilter === "all") return true;
      return product.status === statusFilter;
    });
    if (filteredProducts.length > 0) {
      acc[orderId] = {
        ...data,
        products: filteredProducts
      };
    }
    return acc;
  }, {} as Record<string, {order: any, products: any[]}>);

  // Sort by next action date
  const sortedProductsByOrder = Object.entries(filteredProductsByOrder)
    .sort(([, a], [, b]) => {
      const aEarliest = Math.min(...a.products.map(p => new Date(p.nextActionDate).getTime()));
      const bEarliest = Math.min(...b.products.map(p => new Date(p.nextActionDate).getTime()));
      return aEarliest - bEarliest;
    });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
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
      'pending': 'En attente',
      'files_requested': 'Fichiers demandés',
      'in_production': 'En production',
      'delivered': 'Livré',
      'revision_requested': 'Révision demandée'
    };
    return labels[status] || status;
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'podcast': return '🎙️';
      case 'scripted': return '🎬';
      case 'micro-interview': return '🎤';
      default: return '📹';
    }
  };

  const handleRequestFiles = async (productId: string) => {
    toast({
      title: "Demande de fichiers envoyée",
      description: "Le client va recevoir un email avec le lien de dépôt",
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Lien généré",
      description: "Le lien Dropbox a été envoyé au client",
    });
  };

  const handleDepositDeliverable = async (productId: string) => {
    toast({
      title: "Livrable déposé",
      description: "Le client va recevoir une notification",
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Notification envoyée",
      description: "Le client peut maintenant voir le livrable",
    });
  };

  const handleUpdateFrameLink = (productId: string) => {
    const newLink = editingFrameLink[productId];
    if (newLink) {
      toast({
        title: "Lien Frame.io mis à jour",
        description: "Le nouveau lien de partage a été enregistré",
      });
      setEditingFrameLink(prev => ({ ...prev, [productId]: "" }));
    }
  };

  const handleViewOnboardingForm = (formLink: string) => {
    toast({
      title: "Ouverture du formulaire d'onboarding",
      description: "Redirection vers Fillout...",
    });
    window.open(formLink, '_blank');
  };

  const getUrgencyLevel = (date: string) => {
    const nextAction = new Date(date);
    const now = new Date();
    const diffDays = Math.ceil((nextAction.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { level: 'overdue', color: 'text-red-600', label: 'En retard' };
    if (diffDays <= 1) return { level: 'urgent', color: 'text-orange-600', label: 'Urgent' };
    if (diffDays <= 3) return { level: 'soon', color: 'text-yellow-600', label: 'Bientôt' };
    return { level: 'normal', color: 'text-green-600', label: 'Normal' };
  };

  const totalProductsCount = Object.values(filteredProductsByOrder).reduce((sum, data) => sum + data.products.length, 0);

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
                Espace Collaborateur
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-purple-100 text-purple-800">
                Collaborateur
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
            Espace Production 🎬
          </h1>
          <p className="text-gray-600">
            Vue calendrier des projets - Gérez vos commandes et produits assignés.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {assignedProducts.filter(p => p.status === 'in_production').length}
                  </div>
                  <div className="text-sm text-gray-600">En cours</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {assignedProducts.filter(p => p.status === 'files_requested').length}
                  </div>
                  <div className="text-sm text-gray-600">En attente</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {assignedProducts.filter(p => p.status === 'delivered').length}
                  </div>
                  <div className="text-sm text-gray-600">Livrés</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Video className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{assignedProducts.length}</div>
                  <div className="text-sm text-gray-600">Total assigné</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="files_requested">Fichiers demandés</SelectItem>
                  <SelectItem value="in_production">En production</SelectItem>
                  <SelectItem value="delivered">Livrés</SelectItem>
                  <SelectItem value="revision_requested">Révision demandée</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-600">
                {totalProductsCount} produit(s) affiché(s) dans {sortedProductsByOrder.length} commande(s)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Accordion */}
        {sortedProductsByOrder.length > 0 ? (
          <Accordion type="multiple" className="space-y-4">
            {sortedProductsByOrder.map(([orderId, { order, products }]) => (
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
                        <Badge className={
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }>
                          {order.status === 'completed' ? 'Terminé' :
                           order.status === 'in_progress' ? 'En cours' : 'Onboarding'}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent>
                    <div className="px-6 pb-6 space-y-4">
                      {products.map((product) => {
                        const urgency = getUrgencyLevel(product.nextActionDate);
                        
                        return (
                          <Card key={product.id} className="border-l-4 border-l-primary">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="text-2xl">{getFormatIcon(product.format)}</div>
                                    <div>
                                      <h4 className="font-semibold text-lg">{product.title}</h4>
                                      <p className="text-gray-600 text-sm">
                                        Format: {product.format} • Prix: {product.price}€
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <h5 className="font-medium mb-2 text-blue-900">Formulaire d'onboarding</h5>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleViewOnboardingForm(product.onboardingFormLink)}
                                      className="text-blue-700 hover:text-blue-900"
                                    >
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      Voir le formulaire Fillout
                                    </Button>
                                  </div>

                                  <div className="flex items-center gap-4 text-sm mb-4">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4" />
                                      <span>Prochaine action:</span>
                                      <span className={`font-medium ${urgency.color}`}>
                                        {new Date(product.nextActionDate).toLocaleDateString('fr-FR')}
                                      </span>
                                      <Badge variant="outline" className={urgency.color}>
                                        {urgency.label}
                                      </Badge>
                                    </div>
                                  </div>

                                  {/* Frame.io Link Editor */}
                                  <div className="mb-4 p-3 border rounded-lg">
                                    <h5 className="font-medium mb-2">Lien Frame.io</h5>
                                    <div className="flex gap-2">
                                      <Input
                                        placeholder="Nouveau lien de partage Frame.io"
                                        value={editingFrameLink[product.id] || ""}
                                        onChange={(e) => setEditingFrameLink(prev => ({ 
                                          ...prev, 
                                          [product.id]: e.target.value 
                                        }))}
                                      />
                                      <Button
                                        variant="outline"
                                        onClick={() => handleUpdateFrameLink(product.id)}
                                        disabled={!editingFrameLink[product.id]}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Actuel: {product.deliverableLink}
                                    </p>
                                  </div>

                                  {/* Revision Requests Section */}
                                  {product.revisions && product.revisions.length > 0 && (
                                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                      <h5 className="font-medium mb-2 text-yellow-900 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Demandes de révision
                                      </h5>
                                      <div className="space-y-2">
                                        {product.revisions.map((revision) => (
                                          <div key={revision.id} className="bg-white p-2 rounded border">
                                            <div className="flex items-center justify-between mb-1">
                                              <span className="text-xs text-gray-500">
                                                {new Date(revision.requestedAt).toLocaleDateString('fr-FR')}
                                              </span>
                                              <Badge 
                                                variant="outline" 
                                                className={
                                                  revision.status === 'completed' ? 'text-green-700 border-green-300' :
                                                  revision.status === 'in_progress' ? 'text-blue-700 border-blue-300' :
                                                  'text-orange-700 border-orange-300'
                                                }
                                              >
                                                {revision.status === 'completed' ? 'Terminé' :
                                                 revision.status === 'in_progress' ? 'En cours' : 'En attente'}
                                              </Badge>
                                            </div>
                                            <p className="text-sm text-gray-700">{revision.description}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-col items-end gap-3">
                                  <Badge className={getStatusColor(product.status)}>
                                    {getStatusLabel(product.status)}
                                  </Badge>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="mt-4 pt-4 border-t flex gap-3">
                                {product.status === 'pending' && (
                                  <Button
                                    onClick={() => handleRequestFiles(product.id)}
                                    className="bg-orange-500 hover:bg-orange-600 text-white"
                                  >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Demander les fichiers
                                  </Button>
                                )}
                                
                                {product.status === 'in_production' && (
                                  <Button
                                    onClick={() => handleDepositDeliverable(product.id)}
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                  >
                                    <Send className="w-4 h-4 mr-2" />
                                    Déposer le livrable
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">Aucun projet trouvé</h3>
              <p className="text-gray-600">
                {statusFilter === 'all' 
                  ? "Vous n'avez pas de projets assignés pour le moment."
                  : "Aucun projet ne correspond aux filtres sélectionnés."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default CollaboratorInterface;
