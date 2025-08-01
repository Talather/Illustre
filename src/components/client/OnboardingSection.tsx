import { useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client.js";
import { redirectToCheckout } from "@/utils/stripe";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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

const PDF_MONKEY_API_KEY = "AM8AN7ycSUC4jsWahLmgpBUbwBQDJeNZ"
const TEMPLATE_ID = "FCD4AF8A-FBC5-4CB2-BD26-D8BF11BA4FB8" 

const generatePdfAndSaveLink = async (order: DatabaseOrder) => {
  const now = new Date();
const date_signature = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;

  const payload = {
    nom_client: order.client_name,
    adresse_client: order.client_email,
    nombre_videos: order.products[0].product_name,
    prix: order.total_price,
    price: order.total_price,
    price_ttc: order.total_price * 1.2 ,
    format: order.products[0].product_type,
    date_signature: date_signature,
    
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

  const [selectedOrderForContract, setSelectedOrderForContract] = useState<DatabaseOrder | null>(null);
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const addressFormSchema = z.object({
    address: z.string().min(1, "L'adresse est requise"),
    postalCode: z.string().min(1, "Le code postal est requis"),
  });
  
  type AddressFormValues = z.infer<typeof addressFormSchema>;
  
  const addressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      address: "",
      postalCode: "",
    },
  });
  
  const handleGeneratePdf = async (order: DatabaseOrder) => {
    setSelectedOrderForContract(order);
    setAddressFormOpen(true);
  };
  
  const handleAddressSubmit = async (data: AddressFormValues) => {
    if (!selectedOrderForContract) return;
    const now = new Date();
    const date_signature = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
    
    
    const payload = {
      nom_client: selectedOrderForContract.client_name,
      adresse_client: `${data.address}, ${data.postalCode}`,
      nombre_videos: selectedOrderForContract.products[0].product_name,
      prix: selectedOrderForContract.total_price,
      price: selectedOrderForContract.total_price,
      price_ttc: selectedOrderForContract.total_price * 1.2,
      format: selectedOrderForContract.products[0].product_type,
      date_signature: date_signature
    };
    
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
      });

      const createdDoc = await createRes.json();
      const documentId = createdDoc.document.id;

      // Step 2: Poll until the PDF is ready
      let pdfUrl = null;
      for (let i = 0; i < 10; i++) {
        const statusRes = await fetch(`https://api.pdfmonkey.io/api/v1/documents/${documentId}`, {
          headers: {
            Authorization: `Bearer ${PDF_MONKEY_API_KEY}`
          }
        });

        const statusData = await statusRes.json();
        const status = statusData.document.status;

        if (status === "success") {
          pdfUrl = statusData.document.download_url;
          break;
        }

        await new Promise(res => setTimeout(res, 2000));
      }

      if (!pdfUrl) {
        throw new Error("PDF generation timed out");
      }

      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'contrat-illustre.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Contrat téléchargé",
        description: "Le PDF a été téléchargé avec succès. Veuillez signer et téléverser le contrat.",
      });

      // Instead of updating contract status, mark PDF as downloaded
      // This will show the upload option to the user
      setPdfDownloaded(prev => ({
        ...prev,
        [selectedOrderForContract.id]: true
      }));
      
      setAddressFormOpen(false);
      addressForm.reset();
      
    } catch (err) {
      console.error("❌ Error creating PDF:", err);
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF",
        variant: "destructive"
      });
    }
  };

  /**
   * Define the correct onboarding step order and configuration
   * Order: Call Scheduled → Contract Signed → Payment Made → Form Completed
   */
 
  const getStepsForOrder = (orderId: string): OnboardingStep[] => {
    const orderSteps = onboardingStepsByOrder[orderId] || [];
    return [
      {
        id: 'contract_signed',
        title: 'Signature du contrat',
        // link:orderSteps.find(s => s.step === 'contract_signed')?.link,
        completed: orderSteps.find(s => s.step === 'contract_signed')?.completed || false,
        icon: Phone
      },
      {
        id: 'payment_made', 
        title: 'Paiement',
        // link:orderSteps.find(s => s.step === 'payment_made')?.link,
        completed: orderSteps.find(s => s.step === 'payment_made')?.completed || false,
        icon: FileText
      },
      {
        id: 'call_scheduled',
        title: 'Appel d\'Onboarding',
        link:orderSteps.find(s => s.step === 'call_scheduled')?.link,
        completed: orderSteps.find(s => s.step === 'call_scheduled')?.completed || false,
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

  return (
    <div className="mb-8 space-y-6">
      {/* Address Form Dialog */}
      <Dialog open={addressFormOpen} onOpenChange={(open) => {
        setAddressFormOpen(open);
        if (!open) addressForm.reset();
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adresse pour le contrat</DialogTitle>
          </DialogHeader>
          <form onSubmit={addressForm.handleSubmit(handleAddressSubmit)} className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  placeholder="123 rue de Paris"
                  {...addressForm.register("address")}
                />
                {addressForm.formState.errors.address && (
                  <p className="text-sm text-red-500">{addressForm.formState.errors.address.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Code Postal</Label>
                <Input
                  id="postalCode"
                  placeholder="75001"
                  {...addressForm.register("postalCode")}
                />
                {addressForm.formState.errors.postalCode && (
                  <p className="text-sm text-red-500">{addressForm.formState.errors.postalCode.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Générer le contrat</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                    console.log(step);
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
                          {step.completed  ? (
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
                          {!step.completed && step.link && isPrevCompleted  && (
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
                                onClick={() => handleGeneratePdf(order)}
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
                                 Téléversez le contrat signé (PDF)
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


    </div>
  );
};
