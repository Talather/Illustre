
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

/**
 * ClientInterface - Main interface for client users
 * 
 * Architecture:
 * - ClientHeader: Navigation, branding, and user controls
 * - WelcomeSection: Personalized welcome message
 * - OnboardingSection: Onboarding progress for active orders
 * - OrdersSection: Detailed order and product management
 * 
 * Key Features:
 * - Subcontracted client support with custom branding
 * - Multiple onboarding blocks (one per order in onboarding status)
 * - Order creation and management
 * - File access and revision request handling
 */
const ClientInterface = ({ user, onLogout }: ClientInterfaceProps) => {
  // Get user's orders sorted by creation date (newest first)
  const userOrders = getOrdersByClientId(user.id).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Get current order (most recent)
  const currentOrder = userOrders[0];
  
  // Check if this is a subcontracted client
  const orderData = mockOrders.find(o => o.id === currentOrder?.id);
  const isSubcontracted = orderData?.isSubcontracted || false;
  const customBranding = orderData?.customBranding;
  
  // Group onboarding steps by order ID for efficient lookup
  const onboardingStepsByOrder = userOrders.reduce((acc, order) => {
    const steps = getOnboardingStepsByOrderId(order.id);
    acc[order.id] = steps.map(step => ({
      id: step.step,
      title: step.step === 'contract_signed' ? 'Signature du contrat' :
             step.step === 'form_completed' ? 'Formulaire d\'Onboarding' :
             step.step === 'payment_made' ? 'Paiement' :
             step.step === 'call_scheduled' ? 'Appel d\'Onboarding' : step.step,
      completed: step.completed,
      icon: () => null
    }));
    return acc;
  }, {} as Record<string, any[]>);
  
  // Group orders with their products (excluding next action data)
  const ordersByClient = userOrders.reduce((acc, order) => {
    const products = getProductsByOrderId(order.id).map(product => ({
      ...product,
      // Remove nextActionDate from products to eliminate "next action" mentions
      nextActionDate: undefined
    }));
    acc[order.id] = { order, products };
    return acc;
  }, {} as Record<string, { order: any; products: any[] }>);

  /**
   * Handle file access requests
   * Opens links in new tabs and provides user feedback
   */
  const handleFileAccess = (link: string, type: string) => {
    toast({
      title: `Accès ${type}`,
      description: "Ouverture du lien dans un nouvel onglet...",
    });
    window.open(link, '_blank');
  };

  /**
   * Handle revision requests from clients
   * Logs request and provides user feedback
   */
  const handleRevisionRequest = (productId: string, description: string) => {
    toast({
      title: "Demande de révision envoyée",
      description: "Votre demande a été transmise à l'équipe de production.",
    });
    console.log(`Revision request for product ${productId}: ${description}`);
  };

  /**
   * Handle onboarding initiation
   * Creates new orders and provides feedback
   */
  const handleStartOnboarding = (orderTitle?: string) => {
    if (orderTitle) {
      toast({
        title: "Nouvelle commande créée",
        description: `La commande "${orderTitle}" a été créée avec succès.`,
      });
      console.log('Creating new order with title:', orderTitle);
    } else {
      toast({
        title: "Onboarding commencé",
        description: "Votre processus d'onboarding a été lancé avec succès.",
      });
      console.log('Starting first-time onboarding');
    }
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
          allOrders={userOrders}
          onboardingStepsByOrder={onboardingStepsByOrder}
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
