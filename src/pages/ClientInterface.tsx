
import { ClientHeader } from "@/components/client/ClientHeader";
import { WelcomeSection } from "@/components/client/WelcomeSection";
import { OnboardingSection } from "@/components/client/OnboardingSection";
import { OrdersSection } from "@/components/client/OrdersSection";
import { useClientOrderData } from "@/hooks/useOrderData";
import { revisionService } from "@/services/supabaseService";
import { toast } from "@/hooks/use-toast";

interface TestAccount {
  id: string;
  name: string;
  email: string;
  company: string;
  roles: string[];
}

interface ClientInterfaceProps {
  user: TestAccount;
  onLogout: () => void;
}

/**
 * ClientInterface - Main interface for client users
 * Now integrated with Supabase for real data management
 */
const ClientInterface = ({ user, onLogout }: ClientInterfaceProps) => {
  const { orders, loading } = useClientOrderData(user.id);

  // Get current order (most recent)
  const currentOrder = orders[0];
  
  // Check if this is a subcontracted client
  const isSubcontracted = currentOrder?.is_subcontracted || false;
  const customBranding = currentOrder?.custom_branding as any;
  
  // Group onboarding steps by order ID for efficient lookup
  const onboardingStepsByOrder = orders.reduce((acc, order) => {
    acc[order.id] = order.onboardingSteps.map(step => ({
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
  
  // Group orders with their products
  const ordersByClient = orders.reduce((acc, order) => {
    const products = order.products.map(product => ({
      ...product,
      // Map database fields to expected interface
      nextActionDate: undefined, // Removed as requested
      revisions: product.revisions?.map(rev => ({
        id: rev.id,
        requestedAt: rev.requested_at || '',
        description: rev.description,
        status: rev.status as 'pending' | 'in_progress' | 'completed'
      })) || []
    }));
    acc[order.id] = { order, products };
    return acc;
  }, {} as Record<string, { order: any; products: any[] }>);

  /**
   * Handle file access requests
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
   */
  const handleRevisionRequest = async (productId: string, description: string) => {
    const revision = await revisionService.createRevision(productId, description);
    
    if (revision) {
      toast({
        title: "Demande de révision envoyée",
        description: "Votre demande a été transmise à l'équipe de production.",
      });
    } else {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande de révision.",
        variant: "destructive"
      });
    }
  };

  /**
   * Handle onboarding initiation
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-gray-600 text-xl font-medium">Chargement des données...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ClientHeader
        user={user}
        isSubcontracted={isSubcontracted}
        customBranding={customBranding}
        finalClientName={currentOrder?.final_client_name}
        onLogout={onLogout}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection
          userName={user.name}
          isSubcontracted={isSubcontracted}
          finalClientName={currentOrder?.final_client_name}
        />

        <OnboardingSection
          allOrders={orders}
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
