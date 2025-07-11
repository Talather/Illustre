
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  CheckCircle,
  Clock,
  FileText,
  Calendar,
  CreditCard,
  Plus,
  Phone
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  completed: boolean;
  icon: React.ComponentType<any>;
}

interface Order {
  id: string;
  clientName: string;
  status: string;
}

interface OnboardingSectionProps {
  /** All orders for the client, sorted by creation date (newest first) */
  allOrders: Order[];
  /** Onboarding steps grouped by order ID */
  onboardingStepsByOrder: Record<string, OnboardingStep[]>;
  /** Whether user has any orders */
  hasOrders: boolean;
  /** Callback to start new onboarding */
  onStartOnboarding: (orderTitle?: string) => void;
}

/**
 * OnboardingSection - Manages onboarding progress for all client orders
 * 
 * Key Features:
 * - Shows individual onboarding blocks for each order in onboarding status
 * - Orders are displayed from newest to oldest
 * - Correct onboarding step order: Call → Contract → Payment → Form
 * - Big "Start Onboarding" button if no orders exist
 * - "New Order" button to create additional orders
 * - Progress tracking with visual step completion indicators
 * 
 * Order Processing Logic:
 * 1. New orders appear at the top with their own onboarding block
 * 2. Only orders with 'onboarding' status show onboarding progress
 * 3. Completed/in-progress orders don't show onboarding blocks
 */
export const OnboardingSection = ({
  allOrders,
  onboardingStepsByOrder,
  hasOrders,
  onStartOnboarding
}: OnboardingSectionProps) => {
  const [newOrderTitle, setNewOrderTitle] = useState("");
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);

  /**
   * Define the correct onboarding step order and configuration
   * Order: Call Scheduled → Contract Signed → Payment Made → Form Completed
   */
  const getStepsForOrder = (orderId: string): OnboardingStep[] => {
    const orderSteps = onboardingStepsByOrder[orderId] || [];
    
    return [
      {
        id: 'call_scheduled',
        title: 'Appel d\'Onboarding',
        completed: orderSteps.find(s => s.id === 'call_scheduled')?.completed || false,
        icon: Phone
      },
      {
        id: 'contract_signed', 
        title: 'Signature du contrat',
        completed: orderSteps.find(s => s.id === 'contract_signed')?.completed || false,
        icon: FileText
      },
      {
        id: 'payment_made',
        title: 'Paiement',
        completed: orderSteps.find(s => s.id === 'payment_made')?.completed || false,
        icon: CreditCard
      },
      {
        id: 'form_completed',
        title: 'Formulaire d\'Onboarding',
        completed: orderSteps.find(s => s.id === 'form_completed')?.completed || false,
        icon: CheckCircle
      }
    ];
  };

  /**
   * Calculate progress percentage for an order
   */
  const calculateProgress = (orderId: string): number => {
    const steps = getStepsForOrder(orderId);
    const completedSteps = steps.filter(step => step.completed).length;
    return (completedSteps / steps.length) * 100;
  };

  /**
   * Handle starting onboarding for first-time users
   */
  const handleStartOnboarding = () => {
    onStartOnboarding();
    toast({
      title: "Onboarding commencé",
      description: "Votre processus d'onboarding a été lancé avec succès.",
    });
  };

  /**
   * Handle creating a new order
   */
  const handleCreateNewOrder = () => {
    if (newOrderTitle.trim()) {
      onStartOnboarding(newOrderTitle.trim());
      setNewOrderTitle("");
      setShowNewOrderForm(false);
      toast({
        title: "Nouvelle commande créée",
        description: `La commande "${newOrderTitle}" a été créée avec succès.`,
      });
    }
  };

  /**
   * Get status styling for order badges
   */
  const getOrderStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'completed': 'bg-green-100 text-green-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'onboarding': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getOrderStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'completed': 'Terminé',
      'in_progress': 'En cours',
      'onboarding': 'Onboarding'
    };
    return labels[status] || status;
  };

  // Show welcome screen for users with no orders
  if (!hasOrders) {
    return (
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bienvenue ! Commençons votre projet 🚀
            </h2>
            <p className="text-gray-600 mb-6">
              Lancez votre première commande en cliquant sur le bouton ci-dessous.
              Nous vous guiderons à travers chaque étape.
            </p>
          </div>
          <Button 
            onClick={handleStartOnboarding}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
          >
            Commencer l'onboarding
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Filter orders that need onboarding display (only 'onboarding' status)
  const onboardingOrders = allOrders.filter(order => order.status === 'onboarding');
  
  return (
    <div className="mb-8 space-y-6">
      {/* Display onboarding blocks for each order in onboarding status */}
      {onboardingOrders.map((order) => {
        const steps = getStepsForOrder(order.id);
        const completedSteps = steps.filter(step => step.completed).length;
        const progressPercentage = calculateProgress(order.id);

        return (
          <Card key={order.id} className="border-2 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  Onboarding - {order.clientName}
                </CardTitle>
                <Badge className={getOrderStatusColor(order.status)}>
                  {getOrderStatusLabel(order.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Progression</span>
                    <span className="text-sm text-gray-600">
                      {completedSteps}/{steps.length} étapes
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                {/* Onboarding Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {steps.map((step) => {
                    const Icon = step.icon;
                    return (
                      <div 
                        key={step.id}
                        className={`flex items-center gap-3 p-4 rounded-lg ${
                          step.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          step.completed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                        }`}>
                          {step.completed ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{step.title}</div>
                          <div className={`text-sm ${
                            step.completed ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {step.completed ? 'Complété' : 'En attente'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* New Order Creation */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {!showNewOrderForm ? (
          <Button 
            onClick={() => setShowNewOrderForm(true)}
            variant="outline"
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle commande
          </Button>
        ) : (
          <Card className="flex-1">
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nom de la nouvelle commande..."
                  value={newOrderTitle}
                  onChange={(e) => setNewOrderTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateNewOrder()}
                />
                <Button onClick={handleCreateNewOrder} disabled={!newOrderTitle.trim()}>
                  Créer
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowNewOrderForm(false);
                    setNewOrderTitle("");
                  }}
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* List of other orders (non-onboarding) */}
      {allOrders.filter(order => order.status !== 'onboarding').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Autres commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allOrders
                .filter(order => order.status !== 'onboarding')
                .map((order) => (
                  <div 
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span className="font-medium">{order.clientName}</span>
                      <span className="text-sm text-gray-600 ml-2">#{order.id}</span>
                    </div>
                    <Badge className={getOrderStatusColor(order.status)}>
                      {getOrderStatusLabel(order.status)}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
