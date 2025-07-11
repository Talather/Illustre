
import { ClientHeader } from "@/components/client/ClientHeader";
import { WelcomeSection } from "@/components/client/WelcomeSection";
import { OnboardingSection } from "@/components/client/OnboardingSection";
import { OrdersSection } from "@/components/client/OrdersSection";
import { useOrders } from "@/hooks/useOrders";
import { useOnboarding } from "@/hooks/useOnboarding";
import { toast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: string;
}

interface ClientInterfaceProps {
  user: UserProfile;
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
  // Fetch orders and onboarding data
  const { orders, createOrder, isLoading: ordersLoading } = useOrders();
  const { onboardingSteps, startOnboarding, isLoading: onboardingLoading } = useOnboarding();

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
   * Handle revision requests
   */
  const handleRevisionRequest = (productId: string, description: string) => {
    console.log('Revision request:', { productId, description });
    toast({
      title: "Demande de révision",
      description: "Votre demande de révision a été envoyée.",
    });
  };

  /**
   * Handle starting onboarding for an order
   */
  const handleStartOnboarding = (orderTitle?: string) => {
    console.log('Starting onboarding for:', orderTitle);
    toast({
      title: "Onboarding démarré",
      description: `Processus d'onboarding démarré${orderTitle ? ` pour ${orderTitle}` : ''}.`,
    });
  };

  // Group orders by status for onboarding section
  const onboardingOrders = orders.filter(order => order.status === 'onboarding');
  const onboardingStepsByOrder = onboardingOrders.reduce((acc, order) => {
    acc[order.id] = onboardingSteps.filter(step => step.order_id === order.id);
    return acc;
  }, {} as Record<string, any[]>);

  // Group orders and products for main section
  const ordersByClient = orders.reduce((acc, order) => {
    if (!acc[order.client_id]) {
      acc[order.client_id] = { order, products: [] };
    }
    return acc;
  }, {} as Record<string, { order: any; products: any[] }>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ClientHeader
        user={user}
        isSubcontracted={false}
        onLogout={onLogout}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection
          userName={user.name}
          isSubcontracted={false}
        />

        <OnboardingSection 
          allOrders={onboardingOrders}
          onboardingStepsByOrder={onboardingStepsByOrder}
          hasOrders={orders.length > 0}
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
