
import { ClientHeader } from "@/components/client/ClientHeader";
import { WelcomeSection } from "@/components/client/WelcomeSection";
import { OnboardingSection } from "@/components/client/OnboardingSection";
import { OrdersSection } from "@/components/client/OrdersSection";
import { toast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  name: string;
  email: string;
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

        <OnboardingSection />

        <OrdersSection
          onFileAccess={handleFileAccess}
        />
      </main>
    </div>
  );
};

export default ClientInterface;
