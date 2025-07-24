// Note: loadStripe is not needed anymore since we're using Checkout Sessions
// The publishable key is only used server-side now

/**
 * Creates a checkout session using the Supabase Edge Function
 * @param orderId The ID of the order
 * @param order The complete order data including products and custom options
 * @returns The checkout session URL for redirection
 */
import {supabase} from "@/integrations/supabase/client.js";

export async function createCheckoutSession(orderId: string, order: any) {
  try {

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body:{
        orderId,
        order,
      },
    })

    console.log(data);
    if (error) {
      throw new Error(`Error creating checkout session: ${error}`);
    }

    const { url } = await data;
    return { url };
  } catch (error) {
    console.error('Checkout session error:', error);
    throw error;
  }
}

/**
 * Initiates the payment process for an order
 * @param orderId The ID of the order
 * @param order The complete order data
 */
/**
 * Redirects to Stripe Checkout for the given order
 * @param orderId The ID of the order
 * @param order The complete order data
 * @returns Object indicating success or failure
 */
export async function initiatePayment(orderId: string, order: any) {
  try {
    // Create a checkout session and get the URL
    const { url } = await createCheckoutSession(orderId, order);
    
    // Redirect the user to the Stripe Checkout page
    window.location.href = url;
    
    return { success: true };
  } catch (error) {
    console.error('Payment error:', error);
    return { success: false, error };
  }
}

/**
 * Redirects to Stripe Checkout for the given payment intent
 * @param orderId The ID of the order
 * @param order The complete order data
 */
/**
 * Redirects to Stripe Checkout for the given order
 * @param orderId The ID of the order
 * @param order The complete order data
 * @returns Object indicating success or failure
 */
export async function redirectToCheckout(orderId: string, order: any) {
  return initiatePayment(orderId, order);
}
