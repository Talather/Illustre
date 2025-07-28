import React,{useState} from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, X, Minus, Check, DollarSign } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client.js";
import { toast } from "@/hooks/use-toast";
import PricingCard from '@/components/client/PricingCard';


import { 
      productTemplates,
      ProductTemplate
    } from "@/lib/mockData";
interface CustomOption {
  name: string;
  description: string;
  price: string;
}

interface SelectedProduct {
  id?: string;
  template?: ProductTemplate;
  quantity?: number;
  title?: string;
  price?: number;
  format?: string;
}



const CreateNewOrder = ({user, showOrderDialog , setShowOrderDialog , fetchOrders}:any)=>{
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);

    const pricingPlans = [{
      id: 'basic',
      title: '3 vidéos',
      subtitle: 'Pour découvrir ce qu\'on sait faire sans se ruiner',
      price: 900,
      features: [{
        text: '1 format au choix',
        status: 'included' as const
      }, {
        text: 'Accompagnement stratégique',
        status: 'included' as const
      }, {
        text: 'Rédaction des scripts ou trames',
        status: 'included' as const
      }, {
        text: 'Tournage possible dans 3 lieux :',
        status: 'included' as const,
        details: ['Dans nos studios à Paris', 'Dans vos locaux (en France métropolitaine)', 'En extérieur (en France métropolitaine)']
      }, {
        text: 'Tournage de 30min',
        status: 'included' as const
      }, {
        text: 'Incarnation par vous ou par des acteurs (+200€)',
        status: 'unavailable' as const
      }, {
        text: 'Montage de qualité',
        status: 'unavailable' as const
      }, {
        text: '3 salves de révisions',
        status: 'included' as const
      }, {
        text: 'Garantie de vues',
        status: 'excluded' as const
      }, {
        text: 'Analyse des performances et reporting complet',
        status: 'excluded' as const
      }]
    }, {
      id: 'standard',
      title: '6 vidéos',
      subtitle: '100k vues garanties et révisions illimitées',
      price: 1700,
      features: [{
        text: '1 format au choix',
        status: 'included' as const
      }, {
        text: 'Accompagnement stratégique',
        status: 'included' as const
      }, {
        text: 'Rédaction des scripts ou trames',
        status: 'included' as const
      }, {
        text: 'Tournage possible dans 3 lieux :',
        status: 'included' as const,
        details: ['Dans nos studios à Paris', 'Dans vos locaux (en France métropolitaine)', 'En extérieur (en France métropolitaine)']
      }, {
        text: 'Tournage de 1h',
        status: 'included' as const
      }, {
        text: 'Incarnation par vous ou par des acteurs (+200€)',
        status: 'unavailable' as const
      }, {
        text: 'Montage de qualité',
        status: 'unavailable' as const
      }, {
        text: 'Révisions illimitées',
        status: 'included' as const
      }, {
        text: '100k vues garanties',
        status: 'included' as const
      }, {
        text: 'Analyse des performances et reporting complet',
        status: 'excluded' as const
      }]
    }, {
      id: 'premium',
      title: '10 vidéos',
      subtitle: '200k vues garanties et analyse poussée des résultats',
      price: 2300,
      isPopular: true,
      features: [{
        text: '1 format au choix',
        status: 'included' as const
      }, {
        text: 'Accompagnement stratégique',
        status: 'included' as const
      }, {
        text: 'Rédaction des scripts ou trames',
        status: 'included' as const
      }, {
        text: 'Tournage possible dans 3 lieux :',
        status: 'included' as const,
        details: ['Dans nos studios à Paris', 'Dans vos locaux (en France métropolitaine)', 'En extérieur (en France métropolitaine)']
      }, {
        text: 'Tournage de 2h',
        status: 'included' as const
      }, {
        text: 'Incarnation par vous ou par des acteurs (+200€)',
        status: 'included' as const
      }, {
        text: 'Montage de qualité',
        status: 'included' as const
      }, {
        text: 'Révisions illimitées',
        status: 'included' as const
      }, {
        text: '200k vues garanties',
        status: 'included' as const
      }, {
        text: 'Analyse des performances et reporting complet',
        status: 'included' as const
      }]
    }];

    const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null);
    const [productFormats, setProductFormats] = useState<{
      [key: string]: string;
    }>({});
    const handleFormatChange = (planId: string, format: string) => {
      setProductFormats(prev => ({
        ...prev,
        [planId]: format
      }));
  
      // Mettre à jour le format du produit s'il est sélectionné
      if (selectedProduct && selectedProduct.id === planId) {
        setSelectedProduct(prev => prev ? { ...prev, format } : null);
      }
    };  
    
  const handleProductSelect = (plan: any) => {
    const format = productFormats[plan.id] || 'micro-trottoir';
    const isCurrentlySelected = selectedProduct?.id === plan.id;
    
    if (isCurrentlySelected) {
      // Désélectionner le produit actuel
      setSelectedProduct(null);
    } else {
      // Sélectionner le nouveau produit (remplace l'ancien s'il y en a un)
      const newProduct: SelectedProduct = {
        id: plan.id,
        title: plan.title,
        price: plan.price,
        format: format
      };
      setSelectedProduct(newProduct);
    }
  };

  

 const [newOrderData, setNewOrderData] = useState({
    name: "",
    selectedProducts: [] as SelectedProduct[],
  });
 
  const handleRemoveProduct = () => {
    setSelectedProduct(null);
  };
 

  const getTotalPrice = () => {
    // Sum of product prices (base price * quantity)
    const productsTotal = selectedProduct?.price || 0;
    
  
    
    return productsTotal ;
  };
  const handleCreateOrder = async () => {
      if (!newOrderData.name || !selectedProduct) {
        toast({
          title: "Erreur",
          description: "Vous devez ajouter un nom de commande et au moins un produit",
          variant: "destructive"
        });
        return;
      }
  
     
  
      setIsCreatingOrder(true);
      
      try {
        const totalPrice = getTotalPrice();
        
        // Prepare products JSON data
        const productsData = {
          product_type: selectedProduct.format,
          product_name: selectedProduct.title,
          quantity: 1,
          unit_price: selectedProduct.price,
          total_price: selectedProduct.price
        };
        
       
        
        // Create the order with products and custom options as JSON
        const { data: orderData, error: orderError } = await (supabase as any)
          .from('orders')
          .insert({
            client_id: user.id, // Current user is the client
            // No closer_id needed for client-created orders
            order_name: newOrderData.name,
            status: 'onboarding',
            products: productsData,
            total_price: totalPrice
          })
          .select()
          .single();
        
        if (orderError) {
          throw new Error(orderError.message);
        }
        
        console.log('Order created:', orderData);
        
        // Get client information for onboarding links
        const clientEmail = user.email || '';
        const clientName = user.name || '';
        const orderId = orderData.id;
        const orderName = orderData.order_name;
        
        const onboardingSteps = [
          {
            order_id: orderId,
            step: 'contract_signed',
            completed: false,
            link: null
          },
          {
            order_id: orderId,
            step: 'payment_made',
            completed: false,
            link: 'https://illustre.com'
          },
          {
            order_id: orderId,
            step: 'call_scheduled',
            completed: false,
            link: `https://illustre.fillout.com/rendez-vous?email=${encodeURIComponent(clientEmail)}&name=${encodeURIComponent(clientName)}&order=${encodeURIComponent(orderId)}`
          },
          {
            order_id: orderId,
            step: 'form_completed',
            completed: false,
            link: `https://illustre.fillout.com/formulaire-donboarding?email=${encodeURIComponent(clientEmail)}&name=${encodeURIComponent(clientName)}&order=${encodeURIComponent(orderId)}`
          }
        ];
        
        // Insert onboarding steps into the database
        const { error: onboardingError } = await (supabase as any)
          .from('onboardings')
          .insert(onboardingSteps);

          console.log(onboardingError);
        
        if (onboardingError) {
          console.error('Error creating onboarding steps:', onboardingError);
          
          // Delete the order if onboarding step creation failed
          const { error: deleteError } = await (supabase as any)
            .from('orders')
            .delete()
            .eq('id', orderId);
            
          if (deleteError) {
            console.error('Error deleting order after onboarding creation failure:', deleteError);
          }
          
          toast({
            title: "Erreur",
            description: "Erreur lors de la création des étapes d'onboarding. La commande n'a pas été créée.",
            variant: "destructive"
          });
        } else {
          console.log('Onboarding steps created successfully');
          toast({
            title: "Commande créée avec succès",
            description: "Commande \"" + newOrderData.name + "\" créée avec " + newOrderData.selectedProducts.length + " produit(s) et ",
          });
        }
  
        // Reset form and close dialog
        setNewOrderData({ 
          name: "",
          selectedProducts: [], 
        });
        setShowOrderDialog(false);
        
        // Refresh orders list
        fetchOrders();
        
      } catch (error: any) {
        console.error('Error creating order:', error);
        toast({
          title: "Erreur lors de la création",
          description: error.message || "Impossible de créer la commande",
          variant: "destructive"
        });
      } finally {
        setIsCreatingOrder(false);
      }
    };
  

console.log(selectedProduct);



    return(
         <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
         <DialogContent className="md:max-w-4xl lg:max-w-6xl xl:max-w-7xl  max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle className="text-xl font-bold flex items-center gap-2">
               <Plus className="w-5 h-5" />
               Créer une nouvelle commande
             </DialogTitle>
             <DialogDescription>
               Sélectionnez les produits souhaités et ajoutez des options personnalisées si nécessaire
             </DialogDescription>
           </DialogHeader>
           
           {/* Order Name Input */}
           <div className="space-y-4 py-2 " >
             <div className="mb-10">
               <label className="text-sm font-medium block mb-1">Nom de la commande *</label>
               <Input 
                 value={newOrderData.name}
                 onChange={(e) => setNewOrderData({ ...newOrderData, name: e.target.value })}
                 placeholder="ex: Campagne Marketing Q3 2025"
                 className="w-full"
               />
             </div>
             <div className="grid md:grid-cols-3  gap-8 ">
                {pricingPlans.map(plan => (
                  <PricingCard
                    key={plan.id}
                    title={plan.title}
                    subtitle={plan.subtitle}
                    price={plan.price}
                    // originalPrice={plan.originalPrice}
                    features={plan.features}
                    isPopular={plan.isPopular}
                    onFormatChange={format => handleFormatChange(plan.id, format)}
                    selectedFormat={productFormats[plan.id] || 'micro-trottoir'}
                    isSelected={selectedProduct?.id === plan.id}
                    onSelect={() => handleProductSelect(plan)}
                  />
                ))}
           </div>
             
           
             {/* Selected Products */}
             {selectedProduct && (
               <div>
                 <h3 className="font-medium mb-2">Produits sélectionnés</h3>
                 <div className="space-y-3">
                  
                    <Card key={selectedProduct.id}>
                       <CardContent className="p-4 flex items-center justify-between">
                         <div>
                           <h4 className="font-medium">{selectedProduct.title}</h4>
                           <p className="text-sm text-gray-500">{selectedProduct.format}</p>
                         </div>
                         <div className="flex items-center gap-4">
                           <p className="font-medium w-24 text-right">
                             {selectedProduct.price}€
                           </p>
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             className="h-8 w-8 p-0 text-red-500"
                             onClick={(e) => {
                               e.stopPropagation();
                               handleRemoveProduct();
                             }}
                           >
                             <X className="w-4 h-4" />
                           </Button>
                         </div>
                       </CardContent>
                     </Card>
                 </div>
               </div>
             )}
             
           
             
             {/* Order Total */}
             <div className="py-4 border-t border-gray-200 pt-10">
               <div className="flex justify-between items-center">
                 <span className="font-semibold text-lg">Total</span>
                 <div className="flex items-center gap-2">
                   {/* <DollarSign className="w-4 h-4 text-green-600" /> */}
                   <span className="font-bold text-xl">{getTotalPrice()}€</span>
                 </div>
               </div>
             </div>
             
             {/* Submit Button */}
             <div className="flex justify-end mt-2">
               <Button
                 onClick={handleCreateOrder}
                 disabled={isCreatingOrder || !newOrderData.name || !selectedProduct}
                 className="bg-gradient-turquoise hover:opacity-90"
               >
                 {isCreatingOrder ? "Création en cours..." : "Créer la commande"}
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>
    )
}

export default CreateNewOrder;