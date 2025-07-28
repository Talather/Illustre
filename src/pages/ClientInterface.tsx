import { useState, useEffect } from "react";
import { ClientHeader } from "@/components/client/ClientHeader";
import { WelcomeSection } from "@/components/client/WelcomeSection";
import { OnboardingSection } from "@/components/client/OnboardingSection";
import { OrdersSection } from "@/components/client/OrdersSection";
import { ProfileSection } from "@/components/client/ProfileSection";
import { useLocation } from "react-router-dom";
import { 
Profile,
  getOrdersByClientId, 
  getProductsByOrderId, 
  getOnboardingStepsByOrderId,
  productTemplates,
  ProductTemplate
} from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client.js";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateNewOrder from "@/components/client/CreateNewOrder";
// Interface for orders from database
interface DatabaseOrder {
  id: string;
  client_id: string;
  closer_id?: string;
  order_name: string;
  status: string;
  products: any[];
  custom_options: any[];
  total_price: number;
  created_at: string;
  updated_at: string;
  client_name?: string;
  client_email?: string;
}



interface ClientInterfaceProps {
  user: Profile;
  onLogout: () => void;
}


const ClientInterface = ({ user, onLogout }: ClientInterfaceProps) => {
  const location = useLocation();
  const isProfilePage = location.pathname.includes("/profile");
  // State for orders data
  const [userOrders, setUserOrders] = useState<DatabaseOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [onboardingStepsByOrder, setOnboardingStepsByOrder] = useState<Record<string, any[]>>({});
  
  // State for order creation
  const [showOrderDialog, setShowOrderDialog] = useState(false);
 
  // Fetch orders from database for current user
  const fetchOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const { data, error } = await (supabase as any)
        .from('orders')
        .select(`
          id,
          client_id,
          closer_id,
          order_name,
          status,
          products,
          custom_options,
          total_price,
          created_at,
          updated_at,
          users!client_id (id, full_name, email)
        `)
        .eq('client_id', user.id) // Filter by current user's ID
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les commandes",
          variant: "destructive"
        });
        return;
      }

      // Transform the data to include client info
      const transformedOrders = data?.map((order: any) => ({
        ...order,
        client_name: order.users?.full_name || 'Client inconnu',
        client_email: order.users?.email || '',
      })) || [];

      setUserOrders(transformedOrders);
      
      // Fetch onboarding steps for orders with status 'onboarding'
      await fetchOnboardingSteps(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes",
        variant: "destructive"
      });
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Fetch onboarding steps from database for orders with status 'onboarding'
  const fetchOnboardingSteps = async (orders: DatabaseOrder[]) => {
    try {
      // Get order IDs for orders with status 'onboarding'
      console.log(orders);
      const onboardingOrderIds = orders
        .filter(order => order.status === 'onboarding')
        .map(order => order.id);
        console.log(onboardingOrderIds);

      if (onboardingOrderIds.length === 0) {
        // setOnboardingStepsByOrder({});
        return;
      }

      // Fetch onboarding steps for these orders
      const { data, error } = await (supabase as any)
        .from('onboardings')
        .select('*')
        .in('order_id', onboardingOrderIds);

      if (error) {
        console.error('Error fetching onboarding steps:', error);
        return;
      }

      // Define the correct order of steps
      const stepOrder = ['contract_signed', 'payment_made', 'call_scheduled', 'form_completed'];
      
      // Group steps by order ID and sort them in the correct order
      const stepsByOrder = data?.reduce((acc: Record<string, any[]>, step: any) => {
        if (!acc[step.order_id]) {
          acc[step.order_id] = [];
        }
        acc[step.order_id].push({
          id: step.id,
          step: step.step,
          title: step.step === 'call_scheduled' ? 'Appel d\'Onboarding' :
                 step.step === 'contract_signed' ? 'Signature du contrat' :
                 step.step === 'payment_made' ? 'Paiement' :
                 step.step === 'form_completed' ? 'Formulaire d\'Onboarding' : step.step,
          completed: step.completed,
          link: step.link,
          icon: () => null
        });
        return acc;
      }, {}) || {};


      // Sort steps within each order according to the defined order
      Object.keys(stepsByOrder).forEach(orderId => {
        stepsByOrder[orderId].sort((a, b) => {
          const aIndex = stepOrder.indexOf(a.step);
          const bIndex = stepOrder.indexOf(b.step);
          return aIndex - bIndex;
        });
      });

      setOnboardingStepsByOrder(stepsByOrder);
    } catch (error) {
      console.error('Error fetching onboarding steps:', error);
    }
  };
 

  useEffect(() => {
    fetchOrders();
    
    // Track active subscriptions
    let activeOrdersSubscription: any = null;
    let activeOnboardingsSubscription: any = null;
    
    // Function to set up orders subscription
    const setupOrdersSubscription = () => {
      // Remove any existing subscription first
      if (activeOrdersSubscription) {
        supabase.removeChannel(activeOrdersSubscription);
      }
      
      // Set up real-time subscription for orders table
      const subscription = supabase
        .channel('client-orders-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'orders',
            filter: `client_id=eq.${user.id}` // Only listen to changes for this client
          },
          async (payload) => {
            console.log('Orders table changed for client:', payload);
            // Refresh orders when orders table changes
            await fetchOrders();
          }
        )
        .subscribe();
      
      activeOrdersSubscription = subscription;
      return subscription;
    };
    
    // Function to set up onboardings subscription
    const setupOnboardingsSubscription = () => {
      // Remove any existing subscription first
      if (activeOnboardingsSubscription) {
        supabase.removeChannel(activeOnboardingsSubscription);
      }
      
      // Set up real-time subscription for onboardings table
      const subscription = supabase
        .channel('client-onboardings-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'onboardings',
          },
          async (payload) => {
            
            console.log('Onboardings table changed:', payload);
            
            // console.log(payload.new.completed);
            // console.log(payload.id);
            // Refresh onboarding steps when onboardings table changes
            await fetchOnboardingSteps(userOrders);
          }
        )
        .subscribe();
      
      activeOnboardingsSubscription = subscription;
      return subscription;
    };
    
    // Function to setup all subscriptions
    const setupAllSubscriptions = () => {
      // console.log('Setting up all subscriptions');
      setupOrdersSubscription();
      setupOnboardingsSubscription();
    };
    
    // Set up initial subscriptions
    setupAllSubscriptions();
    
    // Set up window focus event listener to reactivate subscriptions
    const handleWindowFocus = async () => {
      console.log('Window focus gained - reactivating subscriptions');
      await fetchOrders();
      setupAllSubscriptions();
    };
    
    window.addEventListener('focus', handleWindowFocus);

    // Cleanup subscriptions and event listener on component unmount
    return () => {
      // console.log('Cleaning up client subscriptions');
      if (activeOrdersSubscription) {
        supabase.removeChannel(activeOrdersSubscription);
      }
      if (activeOnboardingsSubscription) {
        supabase.removeChannel(activeOnboardingsSubscription);
      }
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [user.id]); 
  
  const currentOrder = userOrders[0];
  


  const ordersByClient = userOrders.filter(order => order.status !== 'onboarding').reduce((acc, order) => {
    const products = getProductsByOrderId(order.id).map(product => ({
      ...product,
      nextActionDate: undefined
    }));
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
        finalClientName={currentOrder?.client_name}
        onLogout={onLogout}
        activeTab={isProfilePage ? 'profile' : 'dashboard'}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isProfilePage ? (
          <ProfileSection user={user} />
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
                <p className="text-gray-600">Gérez vos commandes et suivez votre processus d'onboarding</p>
              </div>
              
              {/* Add Order Button */}
              <Button 
                onClick={() => setShowOrderDialog(true)}
                className="bg-gradient-turquoise hover:opacity-90 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nouvelle commande
              </Button>
            </div>
            
            <WelcomeSection
              userName={user.name}
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
           <CreateNewOrder
              user={user}
              showOrderDialog={showOrderDialog}
              setShowOrderDialog={setShowOrderDialog}
              fetchOrders={fetchOrders}
           />
          </>
        )};

      
        
       
      </main>
    </div>
  );
};

export default ClientInterface;
