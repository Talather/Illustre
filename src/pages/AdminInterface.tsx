
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Profile, 
  mockProfiles, 
  mockOrders, 
  mockOrderProducts
} from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminStats } from "@/components/admin/AdminStats";
import { UserManagement } from "@/components/admin/UserManagement";
import { OrderManagement } from "@/components/admin/OrderManagement";
import { EmailManagement } from "@/components/admin/EmailManagement";

interface AdminInterfaceProps {
  user: Profile;
  onLogout: () => void;
}

/**
 * AdminInterface - Main admin dashboard component
 * 
 * This component provides a comprehensive admin interface with three main sections:
 * 1. User Management - Edit user details and roles
 * 2. Order Management - Manage orders and products in accordion layout
 * 3. Email Management - Send automated emails with recipient input
 * 
 * Features:
 * - Modular component architecture for maintainability
 * - Statistics overview with key metrics
 * - Tab-based navigation between sections
 * - Real-time updates with toast notifications
 * - Responsive design for all screen sizes
 * - Comprehensive user, order, and email management
 * 
 * Architecture:
 * - AdminHeader: Navigation and user actions
 * - AdminStats: Key metrics and statistics
 * - UserManagement: User editing and role management
 * - OrderManagement: Order and product management with accordions
 * - EmailManagement: Email automation with recipient selection
 */
const AdminInterface = ({ user, onLogout }: AdminInterfaceProps) => {
  // Mock handlers for demonstration - in real app these would call APIs
  const handleUpdateUser = async (userId: string, updates: Partial<Profile>) => {
    console.log('Updating user:', userId, updates);
    // TODO: Implement API call to update user
    toast({
      title: "Utilisateur mis à jour",
      description: "Les modifications ont été enregistrées",
    });
  };

  const handleUpdateUserRoles = async (userId: string, newRoles: string[]) => {
    console.log('Updating user roles:', userId, newRoles);
    // TODO: Implement API call to update user roles
    toast({
      title: "Rôles mis à jour",
      description: "Les rôles de l'utilisateur ont été modifiés",
    });
  };

  const handleUpdateOrder = async (orderId: string, updates: Partial<any>) => {
    console.log('Updating order:', orderId, updates);
    // TODO: Implement API call to update order
    toast({
      title: "Commande mise à jour",
      description: "Les modifications ont été enregistrées",
    });
  };

  const handleUpdateProduct = async (productId: string, updates: Partial<any>) => {
    console.log('Updating product:', productId, updates);
    // TODO: Implement API call to update product
    toast({
      title: "Produit mis à jour",
      description: "Le statut du produit a été modifié",
    });
  };

  const handleSendTestEmail = async (type: string, recipient: string) => {
    console.log('Sending test email:', type, 'to:', recipient);
    // TODO: Implement API call to send email
    toast({
      title: "Email envoyé",
      description: `Email "${type}" envoyé à ${recipient}`,
    });
  };

  // Calculate statistics from mock data
  const totalUsers = mockProfiles.length;
  const totalOrders = mockOrders.length;
  const totalProducts = mockOrderProducts.length;
  const activeOrders = mockOrders.filter(o => o.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Component */}
      <AdminHeader user={user} onLogout={onLogout} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title and Description */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de bord Admin 🛠️
          </h1>
          <p className="text-gray-600">
            Gestion complète des utilisateurs, commandes et automatisations email.
          </p>
        </div>

        {/* Statistics Overview */}
        <AdminStats
          totalUsers={totalUsers}
          totalOrders={totalOrders}
          totalProducts={totalProducts}
          activeOrders={activeOrders}
        />

        {/* Main Tabs Interface */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
          </TabsList>

          {/* Users Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <UserManagement
              users={mockProfiles}
              onUpdateUser={handleUpdateUser}
              onUpdateUserRoles={handleUpdateUserRoles}
            />
          </TabsContent>

          {/* Orders Management Tab */}
          <TabsContent value="orders" className="space-y-6">
            <OrderManagement
              orders={mockOrders}
              products={mockOrderProducts}
              onUpdateOrder={handleUpdateOrder}
              onUpdateProduct={handleUpdateProduct}
            />
          </TabsContent>

          {/* Email Management Tab */}
          <TabsContent value="emails" className="space-y-6">
            <EmailManagement onSendTestEmail={handleSendTestEmail} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminInterface;
