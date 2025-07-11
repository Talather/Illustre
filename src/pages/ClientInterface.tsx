
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OnboardingSection } from "@/components/client/OnboardingSection";
import { OrderAccordion } from "@/components/client/OrderAccordion";
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
  ArrowLeft
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
  
  const onboardingSteps = currentOrder ? getOnboardingStepsByOrderId(current.id) : [];
  
  // Group orders with their products
  const ordersByClient = userOrders.reduce((acc, order) => {
    const products = getProductsByOrderId(order.id);
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

  const handleRevisionRequest = (productId: string, description: string) => {
    toast({
      title: "Demande de révision envoyée",
      description: "Votre demande a été transmise à l'équipe de production.",
    });
    console.log(`Revision request for product ${productId}: ${description}`);
  };

  const handleStartOnboarding = (orderTitle?: string) => {
    if (orderTitle) {
      toast({
        title: "Nouvelle commande créée",
        description: `La commande "${orderTitle}" a été créée avec succès.`,
      });
    } else {
      toast({
        title: "Onboarding commencé",
        description: "Votre processus d'onboarding a été lancé avec succès.",
      });
    }
    console.log('Starting onboarding with title:', orderTitle);
  };

  // Custom styling for subcontracted clients
  const brandColor = customBranding?.primaryColor || 'hsl(var(--primary))';

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

        {/* Onboarding Section - Prominent at top */}
        <OnboardingSection
          currentOrder={currentOrder}
          allOrders={userOrders}
          onboardingSteps={onboardingSteps.map(step => ({
            id: step.step,
            title: step.step === 'contract_signed' ? 'Contrat signé' :
                   step.step === 'form_completed' ? 'Formulaire complété' :
                   step.step === 'payment_made' ? 'Paiement effectué' :
                   step.step === 'call_scheduled' ? 'Appel planifié' : step.step,
            completed: step.completed,
            icon: () => null
          }))}
          hasOrders={userOrders.length > 0}
          onStartOnboarding={handleStartOnboarding}
        />

        {/* Orders Section */}
        {userOrders.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Mes Commandes</h2>
              <div className="text-sm text-gray-600">
                {Object.keys(ordersByClient).length} commande(s)
              </div>
            </div>
            
            <OrderAccordion
              ordersByClient={ordersByClient}
              onFileAccess={handleFileAccess}
              onRevisionRequest={handleRevisionRequest}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientInterface;
