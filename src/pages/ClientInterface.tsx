
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Profile, 
  getOrdersByClientId, 
  getProductsByOrderId, 
  getOnboardingStepsByOrderId,
  mockOrders 
} from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";
import { 
  LogOut, 
  ArrowLeft, 
  FileText, 
  Calendar, 
  CreditCard, 
  Upload,
  CheckCircle,
  Clock,
  ExternalLink,
  Video,
  Download,
  Folder,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ClientInterfaceProps {
  user: Profile;
  onLogout: () => void;
}

const ClientInterface = ({ user, onLogout }: ClientInterfaceProps) => {
  const navigate = useNavigate();
  
  // Get user's orders
  const userOrders = getOrdersByClientId(user.id);
  const currentOrder = userOrders[0];
  
  // Check if this is a subcontracted client
  const orderData = mockOrders.find(o => o.id === currentOrder?.id);
  const isSubcontracted = orderData?.isSubcontracted || false;
  const customBranding = orderData?.customBranding;
  
  const onboardingSteps = currentOrder ? getOnboardingStepsByOrderId(currentOrder.id) : [];
  const orderProducts = currentOrder ? getProductsByOrderId(currentOrder.id) : [];
  
  const steps = [
    {
      id: 'contract_signed',
      title: 'Contrat signé',
      completed: onboardingSteps.find(s => s.step === 'contract_signed')?.completed || false,
      icon: FileText
    },
    {
      id: 'form_completed', 
      title: 'Formulaire complété',
      completed: onboardingSteps.find(s => s.step === 'form_completed')?.completed || false,
      icon: CheckCircle
    },
    {
      id: 'payment_made',
      title: 'Paiement effectué',
      completed: onboardingSteps.find(s => s.step === 'payment_made')?.completed || false,
      icon: CreditCard
    },
    {
      id: 'call_scheduled',
      title: 'Appel planifié',
      completed: onboardingSteps.find(s => s.step === 'call_scheduled')?.completed || false,
      icon: Calendar
    }
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

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

  const handleFileAccess = (link: string, type: string) => {
    toast({
      title: `Accès ${type}`,
      description: "Ouverture du lien dans un nouvel onglet...",
    });
    window.open(link, '_blank');
  };

  const handleRevisionRequest = (productId: string) => {
    toast({
      title: "Demande de révision envoyée",
      description: "Votre demande a été transmise à l'équipe de production.",
    });
  };

  // Custom styling for subcontracted clients
  const brandColor = customBranding?.primaryColor || 'hsl(var(--primary))';
  const brandSecondaryColor = customBranding?.secondaryColor || 'hsl(var(--primary-foreground))';

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
              
              {isSubcontracted && customBranding ? (
                <div className="flex items-center gap-2">
                  <div className="text-2xl">{customBranding.logo}</div>
                  <div className="text-xl font-bold" style={{ color: brandColor }}>
                    {orderData?.finalClientName}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-avigea text-gradient-turquoise">
                    illustre!
                  </div>
                  <div className="hidden sm:block text-gray-300">|</div>
                  <div className="hidden sm:block text-gray-600">
                    Espace Client
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                Client {isSubcontracted && "(Sous-traitance)"}
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSubcontracted 
              ? `Bienvenue ${orderData?.finalClientName} !` 
              : `Bienvenue ${user.name} !`
            } 🎬
          </h1>
          <p className="text-gray-600">
            Suivez l'avancement de vos projets audiovisuels et accédez à vos livrables.
          </p>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects">Mes Projets</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid gap-6">
              {orderProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{product.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Video className="w-4 h-4" />
                          Format: {product.format} • Responsable: {product.responsible}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(product.status)}>
                        {getStatusLabel(product.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Instructions */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Instructions du projet</h4>
                        <p className="text-sm text-gray-600">{product.instructions}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => handleFileAccess(product.deliverableLink, "aux livrables")}
                          className="flex items-center gap-2"
                        >
                          <Video className="w-4 h-4" />
                          Voir les livrables
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          variant="outline"
                          onClick={() => handleFileAccess(product.fileDepositLink, "au dépôt de fichiers")}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Déposer des fichiers
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          variant="outline"
                          onClick={() => handleFileAccess(product.preparationLink, "à la préparation")}
                          className="flex items-center gap-2"
                        >
                          <Folder className="w-4 h-4" />
                          Documents préparation
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Revision Request */}
                      {product.status === 'delivered' && (
                        <div className="pt-4 border-t">
                          <Button 
                            variant="outline"
                            onClick={() => handleRevisionRequest(product.id)}
                            className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Demander une nouvelle version
                          </Button>
                        </div>
                      )}

                      {/* Next Action */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        Prochaine action prévue: {new Date(product.nextActionDate).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Onboarding Tab */}
          <TabsContent value="onboarding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Statut de l'onboarding</CardTitle>
                <CardDescription>
                  Suivez l'avancement de votre processus d'onboarding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Progression</span>
                      <span className="text-sm text-gray-600">
                        {completedSteps}/{steps.length} étapes
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>

                  {/* Steps */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {steps.map((step) => {
                      const Icon = step.icon;
                      return (
                        <div 
                          key={step.id}
                          className={`flex items-center gap-3 p-4 rounded-lg ${
                            step.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            step.completed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                          }`}>
                            {step.completed ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <Icon className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{step.title}</div>
                            <div className={`text-sm ${
                              step.completed ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              {step.completed ? 'Complété' : 'En attente'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ClientInterface;
