
import { useState, useEffect } from "react";
import { ClientHeader } from "@/components/client/ClientHeader";
import { WelcomeSection } from "@/components/client/WelcomeSection";
import { OnboardingSection } from "@/components/client/OnboardingSection";
import { OrdersSection } from "@/components/client/OrdersSection";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const ClientInterface = () => {
  const { user, userProfile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchClientData();
    }
  }, [user]);

  const fetchClientData = async () => {
    try {
      setLoading(true);

      // Fetch user's orders with products and onboarding steps
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_products (
            id,
            title,
            format,
            status,
            price_cents,
            deliverable_link,
            preparation_link,
            instructions,
            estimated_delivery,
            actual_delivery
          ),
          onboarding_steps (
            step,
            completed,
            completed_at
          )
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      
      setOrders(ordersData || []);

    } catch (error) {
      console.error('Error fetching client data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer vos données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileAccess = (link: string, type: string) => {
    toast({
      title: `Accès ${type}`,
      description: "Ouverture du lien dans un nouvel onglet...",
    });
    window.open(link, '_blank');
  };

  const handleRevisionRequest = async (productId: string, description: string) => {
    try {
      const { error } = await supabase
        .from('revisions')
        .insert({
          product_id: productId,
          requested_by: user.id,
          description: description,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Demande de révision envoyée",
        description: "Votre demande a été transmise à l'équipe de production.",
      });

      // Refresh data to show updated status
      await fetchClientData();

    } catch (error) {
      console.error('Error requesting revision:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande de révision",
        variant: "destructive"
      });
    }
  };

  const handleStartOnboarding = (orderTitle?: string) => {
    toast({
      title: "Onboarding commencé",
      description: orderTitle ? `La commande "${orderTitle}" a été créée avec succès.` : "Votre processus d'onboarding a été lancé avec succès.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement de vos données...</span>
        </div>
      </div>
    );
  }

  // Get current order (most recent)
  const currentOrder = orders[0];
  
  // Transform data for components
  const onboardingStepsByOrder = orders.reduce((acc, order) => {
    acc[order.id] = (order.onboarding_steps || []).map(step => ({
      id: step.step,
      title: step.step === 'contract_signed' ? 'Signature du contrat' :
             step.step === 'form_completed' ? 'Formulaire d\'Onboarding' :
             step.step === 'payment_made' ? 'Paiement' :
             step.step === 'call_scheduled' ? 'Appel d\'Onboarding' : step.step,
      completed: step.completed,
      icon: () => null
    }));
    return acc;
  }, {});
  
  const ordersByClient = orders.reduce((acc, order) => {
    acc[order.id] = { 
      order: {
        id: order.id,
        clientName: userProfile?.name || 'Client',
        status: order.status,
        order_number: order.order_number,
        created_at: order.created_at
      }, 
      products: (order.order_products || []).map(product => ({
        ...product,
        nextActionDate: undefined // Remove to eliminate "next action" mentions
      }))
    };
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ClientHeader
        user={{ name: userProfile?.name || 'Client', email: user?.email || '' }}
        isSubcontracted={currentOrder?.is_subcontracted || false}
        customBranding={currentOrder?.custom_branding}
        finalClientName={currentOrder?.final_client_name}
        onLogout={() => {}} // This will be handled by useAuth
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection
          userName={userProfile?.name || 'Client'}
          isSubcontracted={currentOrder?.is_subcontracted || false}
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
