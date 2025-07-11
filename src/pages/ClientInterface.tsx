
import { useState } from "react";
import { ClientHeader } from "@/components/client/ClientHeader";
import { WelcomeSection } from "@/components/client/WelcomeSection";
import { OnboardingSection } from "@/components/client/OnboardingSection";
import { OrdersSection } from "@/components/client/OrdersSection";
import { 
  Profile, 
  getOrdersByClientId, 
  getProductsByOrderId, 
  getOnboardingStepsByOrderId,
  mockOrders 
} from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

interface ClientInterfaceProps {
  user: Profile;
  onLogout: () => void;
}

const ClientInterface = ({ user, onLogout }: ClientInterfaceProps) => {
  // Get user's orders
  const userOrders = getOrdersByClientId(user.id);
  const currentOrder = userOrders[0];
  
  // Check if this is a subcontracted client
  const orderData = mockOrders.find(o => o.id === currentOrder?.id);
  const isSubcontracted = orderData?.isSubcontracted || false;
  const customBranding = orderData?.customBranding;
  
  const onboardingSteps = currentOrder ? getOnboardingStepsByOrderId(currentOrder.id) : [];
  
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ClientHeader
        user={user}
        isSubcontracted={isSubcontracted}
        customBranding={customBranding}
        finalClientName={orderData?.finalClientName}
        onLogout={onLogout}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection
          userName={user.name}
          isSubcontracted={isSubcontracted}
          finalClientName={orderData?.finalClientName}
        />

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

        <OrdersSection
          ordersByClient={ordersByClient}
          onFileAccess={handleFileAccess}
          onRevisionRequest={handleRevisionRequest}
        />
      </main>
    </div>
  );
};

export default ClientInterface;
