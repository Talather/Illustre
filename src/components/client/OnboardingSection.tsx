import { useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client.js";
import { redirectToCheckout } from "@/utils/stripe";
import { 
  CheckCircle,
  Clock,
  FileText,
  Calendar,
  CreditCard,
  Plus,
  Phone,
  Download,
  Upload,
  ExternalLink,
  FileCheck
} from "lucide-react";

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

interface OnboardingStep {
  id: string;
  title: string;
  completed: boolean;
  icon: React.ComponentType<any>;
  step?:string;
  link?:string;
}

interface OnboardingSectionProps {
  /** All orders for the client, sorted by creation date (newest first) */
  allOrders: DatabaseOrder[];
  /** Onboarding steps grouped by order ID */
  onboardingStepsByOrder: Record<string, OnboardingStep[]>;
  /** Whether user has any orders */
  hasOrders: boolean;
  /** Callback to start new onboarding */
  onStartOnboarding: (orderTitle?: string) => void;
}

const PDF_MONKEY_API_KEY = "7co4zPYMXdbsJ1dMuniP"
const TEMPLATE_ID = "0E5ACB73-B140-494E-BFF4-765C56D01729" // <-- Replace with your actual template ID

const generatePdfAndSaveLink = async (order: DatabaseOrder) => {
  const payload = {
    nom_client: order.client_name,
    adresse_client: order.client_email,
    nombre_videos: order.products[0].product_name,
    prix: order.total_price,
    price: order.total_price,
    price_ttc: order.total_price,
    format: order.products[0].product_type,
    date_signature: new Date().toISOString().split('T')[0]
  }

  try {
    toast({
      title: "Génération du PDF en cours",
      description: "Veuillez patienter...",
    });

    // Step 1: Create the document
    const createRes = await fetch("https://api.pdfmonkey.io/api/v1/documents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PDF_MONKEY_API_KEY}`
      },
      body: JSON.stringify({
        document: {
          payload,
          document_template_id: TEMPLATE_ID,
          status:"pending"
        }
      })
    })

    const createdDoc = await createRes.json();
    console.log(createdDoc);
    const documentId = createdDoc.document.id

    console.log("📄 PDFMonkey document ID:", documentId)

    // Step 2: Poll until the PDF is ready
    let pdfUrl = null
    for (let i = 0; i < 10; i++) {
      const statusRes = await fetch(`https://api.pdfmonkey.io/api/v1/documents/${documentId}`, {
        headers: {
          Authorization: `Bearer ${PDF_MONKEY_API_KEY}`
        }
      })

      const statusData = await statusRes.json();
      console.log(statusData);
      const status = statusData.document.status

      if (status === "success") {
        pdfUrl = statusData.document.download_url
        break
      }

      console.log(`⏳ Waiting for PDF... [attempt ${i + 1}]`)
      await new Promise(res => setTimeout(res, 2000))
    }

    if (!pdfUrl) {
      throw new Error("PDF generation timed out")
    }

    console.log("✅ PDF ready:", pdfUrl)

    // Download the PDF automatically
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'contrat-illustre.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Contrat téléchargé",
      description: "Le PDF a été téléchargé avec succès",
    });

    // Return the URL so it can be stored in state
    return pdfUrl;
  } catch (err) {
    console.error("❌ Error creating PDF:", err)
    toast({
      title: "Erreur",
      description: "Impossible de générer le PDF",
      variant: "destructive"
    });
    return null;
  }
}

// Function to update contract status in database
const updateContractStatus = async (orderId: string) => {
  try {
    const { error } = await (supabase as any).from('onboardings')
      .update({ completed: true })
      .eq('order_id', orderId)
      .eq('step', 'contract_signed');

    if (error) {
      throw error;
    }

    toast({
      title: "Contrat validé",
      description: "Le contrat a été marqué comme signé",
    });

    return true;
  } catch (err) {
    console.error("Error updating contract status:", err);
    toast({
      title: "Erreur",
      description: "Impossible de mettre à jour le statut du contrat",
    });
    return false;
  }
}

export const OnboardingSection = ({
  allOrders,
  onboardingStepsByOrder,
  hasOrders,
  onStartOnboarding
}: OnboardingSectionProps) => {
  const [newOrderTitle, setNewOrderTitle] = useState("");
  const [showNewOrderForm, setShowNewOrderForm] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState<Record<string, boolean>>({});
  const [paymentLoading, setPaymentLoading] = useState<Record<string, boolean>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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
        link:orderSteps.find(s => s.step === 'call_scheduled')?.link,
        completed: orderSteps.find(s => s.step === 'call_scheduled')?.completed || false,
        icon: Phone
      },
      {
        id: 'contract_signed', 
        title: 'Signature du contrat',
        link:orderSteps.find(s => s.step === 'contract_signed')?.link,
        completed: orderSteps.find(s => s.step === 'contract_signed')?.completed || false,
        icon: FileText
      },
      {
        id: 'payment_made',
        title: 'Paiement',
        completed: orderSteps.find(s => s.step === 'payment_made')?.completed || false,
        icon: CreditCard
      },
      {
        id: 'form_completed',
        title: 'Formulaire d\'Onboarding',
        link:orderSteps.find(s => s.step === 'form_completed')?.link,
        completed: orderSteps.find(s => s.step === 'form_completed')?.completed || false,
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
  
  const onboardingOrders = useMemo(()=>{
    console.log(allOrders , onboardingStepsByOrder)
    return allOrders.filter(order => order.status === 'onboarding');
  },[allOrders, onboardingStepsByOrder]);


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



//  const onboardingOrders = allOrders.filter(order => order.status === 'onboarding');

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
                  Onboarding - {order.order_name}
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
                  {steps.map((step ,i) => {
                    const Icon = step.icon;
                    const prevStep = steps[i-1];
                    let isPrevCompleted = false;
                    if(prevStep){
                      if(prevStep.completed){
                        isPrevCompleted = true;
                      }
                    }else{
                      isPrevCompleted = true;
                    }
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
                        <div className="flex-1">
                          <div className="font-medium">{step.title}</div>
                          <div className={`text-sm ${
                            step.completed ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {step.completed ? 'Complété' : 'En attente'}
                          </div>
                          {/* Show link if step has link and is not completed */}
                          {!step.completed && step.link && isPrevCompleted   && (
                            <a 
                              href={step.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Commencer cette étape
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>

                        {step.title === "Signature du contrat" && isPrevCompleted && (
                          <div className="mt-3">
                            {!step.completed && !pdfDownloaded[order.id] && (
                              <Button
                                onClick={async () => {
                                  const pdfUrl = await generatePdfAndSaveLink(order);
                                  if (pdfUrl) {
                                    setPdfDownloaded(prev => ({ ...prev, [order.id]: true }));
                                  }
                                }}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                              >
                                <Download className="w-4 h-4" />
                                Télécharger le contrat
                              </Button>
                            )}
                            
                            {!step.completed && pdfDownloaded[order.id] && (
                              <div className="space-y-2">
                                <p className="text-xs text-gray-500">
                                  Veuillez téléverser le contrat signé (format PDF uniquement)
                                </p>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    ref={el => fileInputRefs.current[order.id] = el}
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        if (file.type !== 'application/pdf') {
                                          toast({
                                            title: "Format invalide",
                                            description: "Seuls les fichiers PDF sont acceptés",
                                          });
                                          return;
                                        }
                                        
                                        // Here you would upload the file to storage
                                        // For now, we'll just update the contract status
                                        const success = await updateContractStatus(order.id);
                                        if (success) {
                                          // Clear file input
                                          if (fileInputRefs.current[order.id]) {
                                            fileInputRefs.current[order.id]!.value = '';
                                          }
                                        }
                                      }
                                    }}
                                  />
                                  <Button
                                    onClick={() => fileInputRefs.current[order.id]?.click()}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
                                  >
                                    <Upload className="w-4 h-4" />
                                    Téléverser le contrat signé
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            {step.completed && (
                              <div className="flex items-center text-green-600 gap-2">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm">Contrat signé</span>
                              </div>
                            )}
                          </div>
                        )}


                        {step.title === "Paiement" && isPrevCompleted && !step.completed && (
                          <div className="mt-3">
                            <Button
                              onClick={async () => {
                                try {
                                  // Set loading state for this specific order
                                  setPaymentLoading(prev => ({ ...prev, [order.id]: true }));
                                  
                                  toast({
                                    title: "Redirection vers le paiement",
                                    description: "Vous allez être redirigé vers la page de paiement sécurisée"
                                  });
                                  
                                  // Redirect to Stripe checkout
                                  const result = await redirectToCheckout(order.id, order);
                                  
                                  if (!result.success) {
                                    throw new Error(result.error?.message || "Erreur lors du paiement");
                                  }
                                  
                                  // Note: The user will be redirected to Stripe, so this code may not execute
                                } catch (error) {
                                  console.error("Payment error:", error);
                                  toast({
                                    title: "Erreur de paiement",
                                    description: error.message || "Une erreur est survenue lors du paiement"
                                  });
                                } finally {
                                  setPaymentLoading(prev => ({ ...prev, [order.id]: false }));
                                }
                              }}
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                              disabled={paymentLoading[order.id]}
                            >
                              {paymentLoading[order.id] ? (
                                <>Redirection...</>
                              ) : (
                                <>
                                  <CreditCard className="h-4 w-4" />
                                  Procéder au paiement
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                        
                        {step.title === "Paiement" && step.completed && (
                          <div className="mt-3 flex items-center text-green-600 gap-1">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">Paiement effectué</span>
                          </div>
                        )}
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
      {/* <div className="flex flex-col sm:flex-row gap-4 items-start">
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
      </div> */}

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
                      <span className="font-medium">{order.client_name}</span>
                      <span className="text-sm text-gray-600 ml-2">#{order.order_name}</span>
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
