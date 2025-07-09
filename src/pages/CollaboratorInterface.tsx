
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Profile, mockOrderProducts, mockOrders } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";
import { 
  LogOut, 
  ArrowLeft, 
  Calendar,
  Filter,
  Upload,
  Send,
  Eye,
  FileText,
  Clock,
  Video,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CollaboratorInterfaceProps {
  user: Profile;
  onLogout: () => void;
}

const CollaboratorInterface = ({ user, onLogout }: CollaboratorInterfaceProps) => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // Get products assigned to current user
  const assignedProducts = mockOrderProducts.filter(product => 
    product.responsible === user.name
  );

  // Filter products based on status
  const filteredProducts = assignedProducts.filter(product => {
    if (statusFilter === "all") return true;
    return product.status === statusFilter;
  });

  // Sort by next action date
  const sortedProducts = [...filteredProducts].sort((a, b) => 
    new Date(a.nextActionDate).getTime() - new Date(b.nextActionDate).getTime()
  );

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

    // Simulate API call
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

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Notification envoyée",
      description: "Le client peut maintenant voir le livrable",
    });
  };

  const handleViewInstructions = (productId: string) => {
    const product = mockOrderProducts.find(p => p.id === productId);
    if (product) {
      toast({
        title: "Instructions du projet",
        description: product.instructions,
      });
    }
  };

  const handleViewPreparation = (link: string) => {
    toast({
      title: "Ouverture de la préparation",
      description: "Redirection vers Notion...",
    });
    window.open(link, '_blank');
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
            Gérez vos projets assignés et suivez l'avancement de la production.
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
                {filteredProducts.length} projet(s) affiché(s)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        <div className="space-y-4">
          {sortedProducts.map((product) => {
            const urgency = getUrgencyLevel(product.nextActionDate);
            const order = mockOrders.find(o => 
              mockOrderProducts.some(p => p.orderId === o.id && p.id === product.id)
            );
            
            return (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-2xl">{getFormatIcon(product.format)}</div>
                        <div>
                          <h3 className="font-semibold text-lg">{product.title}</h3>
                          <p className="text-gray-600 text-sm">
                            Client: {order?.clientName} • Format: {product.format}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Instructions</h4>
                        <p className="text-sm text-gray-700">{product.instructions}</p>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
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
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <Badge className={getStatusColor(product.status)}>
                        {getStatusLabel(product.status)}
                      </Badge>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewInstructions(product.id)}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPreparation(product.preparationLink)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
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

                    <Button
                      variant="outline"
                      onClick={() => window.open(product.deliverableLink, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Frame.io
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => window.open(product.fileDepositLink, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Dropbox
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
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
