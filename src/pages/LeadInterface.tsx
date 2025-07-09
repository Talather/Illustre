
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Profile, getOrdersByClientId, getOnboardingStepsByOrderId } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";
import { 
  LogOut, 
  ArrowLeft, 
  FileText, 
  Calendar, 
  CreditCard, 
  Upload,
  CheckCircle,
  Clock,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LeadInterfaceProps {
  user: Profile;
  onLogout: () => void;
}

const LeadInterface = ({ user, onLogout }: LeadInterfaceProps) => {
  const navigate = useNavigate();
  const [uploadingContract, setUploadingContract] = useState(false);
  
  // Get user's orders and onboarding status
  const userOrders = getOrdersByClientId(user.id);
  const currentOrder = userOrders[0]; // Assume lead has one active order
  
  const onboardingSteps = currentOrder ? getOnboardingStepsByOrderId(currentOrder.id) : [];
  
  const steps = [
    {
      id: 'form_completed',
      title: 'Formulaire d\'onboarding',
      description: 'Remplir le questionnaire de préparation',
      icon: FileText,
      completed: onboardingSteps.find(s => s.step === 'form_completed')?.completed || false,
      action: () => handleFormAccess()
    },
    {
      id: 'call_scheduled',
      title: 'Réservation d\'appel',
      description: 'Planifier l\'appel de lancement du projet',
      icon: Calendar,
      completed: onboardingSteps.find(s => s.step === 'call_scheduled')?.completed || false,
      action: () => handleCallScheduling()
    },
    {
      id: 'payment_made',
      title: 'Paiement',
      description: 'Effectuer le règlement du projet',
      icon: CreditCard,
      completed: onboardingSteps.find(s => s.step === 'payment_made')?.completed || false,
      action: () => handlePayment()
    },
    {
      id: 'contract_signed',
      title: 'Contrat signé',
      description: 'Télécharger et signer le contrat',
      icon: Upload,
      completed: onboardingSteps.find(s => s.step === 'contract_signed')?.completed || false,
      action: () => handleContractUpload()
    }
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const handleFormAccess = () => {
    toast({
      title: "Redirection vers le formulaire",
      description: "Ouverture du formulaire Fillout prérempli...",
    });
    // Simulate opening Fillout form
    window.open('https://fillout.com/onboarding-form?lead_id=' + user.id, '_blank');
  };

  const handleCallScheduling = () => {
    toast({
      title: "Réservation d'appel",
      description: "Ouverture du calendrier de réservation...",
    });
    // Simulate opening calendar booking
    window.open('https://calendly.com/illustre/onboarding-call', '_blank');
  };

  const handlePayment = () => {
    toast({
      title: "Redirection paiement",
      description: "Ouverture de la page de paiement Stripe...",
    });
    // Simulate opening Stripe payment
    window.open('https://checkout.stripe.com/pay/mock-payment-link', '_blank');
  };

  const handleContractUpload = () => {
    setUploadingContract(true);
    // Simulate file upload
    setTimeout(() => {
      toast({
        title: "Contrat téléchargé",
        description: "Votre contrat signé a été enregistré avec succès.",
      });
      setUploadingContract(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div className="text-2xl font-avigea text-gradient-turquoise">
                illustre!
              </div>
              <div className="hidden sm:block text-gray-300">|</div>
              <div className="hidden sm:block text-gray-600">
                Espace Lead - Onboarding
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                Lead
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue dans votre processus d'onboarding ! 🚀
          </h1>
          <p className="text-gray-600 mb-6">
            Suivez ces étapes pour finaliser le lancement de votre projet avec illustre!
          </p>
          
          {/* Progress Bar */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Progression de l'onboarding</h3>
                <span className="text-sm text-gray-600">
                  {completedSteps}/{steps.length} étapes complétées
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <div className="mt-2 text-sm text-gray-600">
                {progressPercentage === 100 
                  ? "🎉 Félicitations ! Votre onboarding est terminé."
                  : `${Math.round(progressPercentage)}% complété`
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onboarding Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card 
                key={step.id}
                className={`transition-all duration-200 ${
                  step.completed 
                    ? 'border-green-200 bg-green-50' 
                    : 'hover:shadow-lg border-2 hover:border-primary/30'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg flex-shrink-0 ${
                        step.completed 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          {step.title}
                          {step.completed && (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              Complété
                            </Badge>
                          )}
                        </h3>
                        <p className="text-gray-600">{step.description}</p>
                        {step.completed && (
                          <p className="text-sm text-green-600 mt-1">
                            ✅ Cette étape a été validée
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!step.completed && (
                        <>
                          <Clock className="w-4 h-4 text-orange-500" />
                          <Button 
                            onClick={step.action}
                            disabled={step.id === 'contract_signed' && uploadingContract}
                            className="bg-gradient-turquoise hover:opacity-90"
                          >
                            {step.id === 'contract_signed' && uploadingContract ? (
                              "Téléchargement..."
                            ) : (
                              <>
                                Accéder
                                <ExternalLink className="w-4 h-4 ml-2" />
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Besoin d'aide ?</CardTitle>
            <CardDescription>
              Notre équipe est là pour vous accompagner dans ce processus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl">📧</div>
                <div>
                  <div className="font-medium">Email</div>
                  <div className="text-sm text-gray-600">contact@illustre.agency</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <div className="text-2xl">📱</div>
                <div>
                  <div className="font-medium">Téléphone</div>
                  <div className="text-sm text-gray-600">+33 1 23 45 67 89</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LeadInterface;
