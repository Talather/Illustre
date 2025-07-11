
import { ClientHeader } from "@/components/client/ClientHeader";
import { WelcomeSection } from "@/components/client/WelcomeSection";
import { OnboardingSection } from "@/components/client/OnboardingSection";
import { OrdersSection } from "@/components/client/OrdersSection";
import { useOrders } from "@/hooks/useOrders";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useCreateRevision } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { UserProfile } from "@/types/auth";

interface ClientInterfaceProps {
  user: UserProfile;
  onLogout: () => void;
  availableRoles?: string[];
  currentRole?: string;
  onRoleChange?: (role: string) => void;
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
const ClientInterface = ({ 
  user, 
  onLogout, 
  availableRoles = [], 
  currentRole = 'client',
  onRoleChange 
}: ClientInterfaceProps) => {
  const { user: authUser } = useAuth();
  const { orders, isLoading: ordersLoading } = useOrders();
  const { onboardingSteps, isLoading: onboardingLoading } = useOnboarding();
  const createRevisionMutation = useCreateRevision();

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
  const handleRevisionRequest = async (productId: string, description: string) => {
    if (!authUser) return;

    try {
      await createRevisionMutation.mutateAsync({
        product_id: productId,
        description,
        requested_by: authUser.id,
      });
      
      toast({
        title: "Demande de révision envoyée",
        description: "Votre demande de révision a été envoyée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande de révision.",
        variant: "destructive",
      });
    }
  };

  // Group orders by status for onboarding section
  const clientOrders = orders.filter(order => order.client_id === user.id);
  const onboardingOrders = clientOrders.filter(order => order.status === 'onboarding');
  const onboardingStepsByOrder = onboardingOrders.reduce((acc, order) => {
    acc[order.id] = onboardingSteps.filter(step => step.order_id === order.id);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ClientHeader
        user={user}
        isSubcontracted={false}
        onLogout={onLogout}
        availableRoles={availableRoles}
        currentRole={currentRole}
        onRoleChange={onRoleChange}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection
          userName={user.name}
          isSubcontracted={false}
        />

        <OnboardingSection />

        <OrdersSection
          onFileAccess={handleFileAccess}
        />
      </main>
    </div>
  );
};

export default ClientInterface;
