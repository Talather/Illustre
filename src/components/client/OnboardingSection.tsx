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
  Plus
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  completed: boolean;
  icon: React.ComponentType<any>;
}

interface OnboardingSectionProps {
  /** Current order data */
  currentOrder?: {
    id: string;
    clientName: string;
    status: string;
  };
  /** All orders for the client */
  allOrders: Array<{
    id: string;
    clientName: string;
    status: string;
  }>;
  /** Onboarding steps for current order */
  onboardingSteps: OnboardingStep[];
  /** Whether user has any orders */
  hasOrders: boolean;
  /** Callback to start new onboarding */
  onStartOnboarding: (orderTitle?: string) => void;
}

/**
 * OnboardingSection - Prominent section at the top of client interface
 * 
 * Features:
 * - Shows current order onboarding progress if orders exist
 * - Big "Start Onboarding" button if no orders exist
 * - "New Order" button and existing orders list if orders exist
 * - Progress tracking with step completion
 */
export const OnboardingSection = ({
  currentOrder,
  allOrders,
  onboardingSteps,
  hasOrders,
  onStartOnboarding
}: OnboardingSectionProps) => {
  const [newOrderTitle, setNewOrderTitle] = useState("");
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);

  const steps = [
    {
      id: 'contract_signed',
      title: 'Contrat signé',
      completed: onboardingSteps.find(s => s.id === 'contract_signed')?.completed || false,
      icon: FileText
    },
    {
      id: 'form_completed', 
      title: 'Formulaire complété',
      completed: onboardingSteps.find(s => s.id === 'form_completed')?.completed || false,
      icon: CheckCircle
    },
    {
      id: 'payment_made',
      title: 'Paiement effectué',
      completed: onboardingSteps.find(s => s.id === 'payment_made')?.completed || false,
      icon: CreditCard
    },
    {
      id: 'call_scheduled',
      title: 'Appel planifié',
      completed: onboardingSteps.find(s => s.id === 'call_scheduled')?.completed || false,
      icon: Calendar
    }
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const handleStartOnboarding = () => {
    onStartOnboarding();
    toast({
      title: "Onboarding commencé",
      description: "Votre processus d'onboarding a été lancé avec succès.",
    });
  };

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

  return (
    <div className="mb-8 space-y-6">
      {/* Current Order Onboarding */}
      {currentOrder && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                Onboarding - {currentOrder.clientName}
              </CardTitle>
              <Badge className={getOrderStatusColor(currentOrder.status)}>
                {getOrderStatusLabel(currentOrder.status)}
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

              {/* Steps */}
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
      )}

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

      {/* Existing Orders List */}
      {allOrders.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Autres commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allOrders
                .filter(order => order.id !== currentOrder?.id)
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
