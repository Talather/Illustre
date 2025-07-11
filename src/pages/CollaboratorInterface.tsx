
import { useState } from "react";
import { Profile, mockOrderProducts, mockOrders } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";
import { CollaboratorHeader } from "@/components/collaborator/CollaboratorHeader";
import { CollaboratorStats } from "@/components/collaborator/CollaboratorStats";
import { CollaboratorFilters } from "@/components/collaborator/CollaboratorFilters";
import { OrderAccordion } from "@/components/collaborator/OrderAccordion";
import { EmptyState } from "@/components/collaborator/EmptyState";
import { RoleSwitcher } from "@/components/ui/RoleSwitcher";
import { UserProfile } from "@/types/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface CollaboratorInterfaceProps {
  /** Current authenticated user profile */
  user: UserProfile;
  /** Callback function to handle user logout */
  onLogout: () => void;
  /** Available roles for the user */
  availableRoles?: string[];
  /** Current selected role */
  currentRole?: string;
  /** Callback to change role */
  onRoleChange?: (role: string) => void;
}

/**
 * Main Collaborator Interface Component
 * 
 * This is the primary dashboard for collaborators to manage their assigned products
 * and interact with the production workflow.
 * 
 * Key Features:
 * - Calendar-based view of assigned projects
 * - Product status filtering and management
 * - File request and deliverable deposit workflows
 * - Frame.io link management for client collaboration
 * - Revision request tracking and management
 * - Onboarding form access for project requirements
 * 
 * The interface is organized hierarchically:
 * Order -> Products -> Actions/Information
 * 
 * Data Flow:
 * 1. Products are filtered by user assignment
 * 2. Products are grouped by their parent orders
 * 3. Orders are sorted by earliest next action date
 * 4. Status-based filtering is applied
 * 
 * @param user - The authenticated collaborator's profile
 * @param onLogout - Function to handle user logout
 */
const CollaboratorInterface = ({ user, onLogout, availableRoles = [], currentRole = 'collaborator', onRoleChange }: CollaboratorInterfaceProps) => {
  // Filter state for product status
  const [statusFilter, setStatusFilter] = useState("all");
  
  // State for managing Frame.io link editing per product
  const [editingFrameLink, setEditingFrameLink] = useState<{[key: string]: string}>({});

  /**
   * Get all products assigned to the current collaborator
   * Based on the 'responsible' field matching the user's name
   */
  const assignedProducts = mockOrderProducts.filter(product => 
    product.responsible === user.name
  );

  /**
   * Group assigned products by their parent orders
   * Creates a lookup structure: { orderId: { order, products[] } }
   */
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

  /**
   * Apply status filtering to grouped products
   * Only includes orders that have products matching the filter
   */
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

  // Calculate totals for display
  const totalProductsCount = Object.values(filteredProductsByOrder).reduce((sum, data) => sum + data.products.length, 0);
  const totalOrdersCount = Object.keys(filteredProductsByOrder).length;

  /**
   * Handle file request workflow
   * Simulates sending file request notification to client
   */
  const handleRequestFiles = async (productId: string) => {
    toast({
      title: "Demande de fichiers envoyée",
      description: "Le client va recevoir un email avec le lien de dépôt",
    });

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Lien généré",
      description: "Le lien Dropbox a été envoyé au client",
    });
  };

  /**
   * Handle deliverable deposit workflow
   * Simulates notifying client of completed deliverable
   */
  const handleDepositDeliverable = async (productId: string) => {
    toast({
      title: "Livrable déposé",
      description: "Le client va recevoir une notification",
    });

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Notification envoyée",
      description: "Le client peut maintenant voir le livrable",
    });
  };

  /**
   * Handle Frame.io link update
   * Updates the sharing link for client collaboration
   */
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

  /**
   * Handle onboarding form access
   * Opens Fillout form in new tab
   */
  const handleViewOnboardingForm = (formLink: string) => {
    toast({
      title: "Ouverture du formulaire d'onboarding",
      description: "Redirection vers Fillout...",
    });
    window.open(formLink, '_blank');
  };

  /**
   * Handle Frame.io link input changes
   * Updates the editing state for specific product
   */
  const handleFrameLinkChange = (productId: string, value: string) => {
    setEditingFrameLink(prev => ({ 
      ...prev, 
      [productId]: value 
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
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
              {availableRoles.length > 1 && onRoleChange && (
                <RoleSwitcher
                  currentRole={currentRole}
                  availableRoles={availableRoles}
                  onRoleChange={onRoleChange}
                />
              )}
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
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Espace Production 🎬
          </h1>
          <p className="text-gray-600">
            Vue calendrier des projets - Gérez vos commandes et produits assignés.
          </p>
        </div>

        {/* Statistics Dashboard */}
        <CollaboratorStats assignedProducts={assignedProducts} />

        {/* Filter Controls */}
        <CollaboratorFilters
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          totalProductsCount={totalProductsCount}
          totalOrdersCount={totalOrdersCount}
        />

        {/* Orders and Products Display */}
        {totalOrdersCount > 0 ? (
          <OrderAccordion
            productsByOrder={filteredProductsByOrder}
            editingFrameLink={editingFrameLink}
            onFrameLinkChange={handleFrameLinkChange}
            onRequestFiles={handleRequestFiles}
            onDepositDeliverable={handleDepositDeliverable}
            onUpdateFrameLink={handleUpdateFrameLink}
            onViewOnboardingForm={handleViewOnboardingForm}
          />
        ) : (
          <EmptyState statusFilter={statusFilter} />
        )}
      </main>
    </div>
  );
};

export default CollaboratorInterface;
