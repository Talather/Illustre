// // Follow Supabase Edge Function format
// const corsHeaders = {
//     'Access-Control-Allow-Origin': '*',
//     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
//   };

// // Import Stripe
// // @ts-ignore - Supabase Edge Runtime handles this import
// import Stripe from 'stripe';

// // Initialize Stripe with the secret key
// const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "sk_test_51REW3y02ZVUur5kwofqqCwM85ozam7hyyYrn0v9hfix3BFjmlVZsH4KDVJ3eVtGgTRNGIzeXJ9xi8mWpVOaNbdzF00iO4mW1Z1", {
//   apiVersion: '2023-10-16', // Use the latest API version
// });

// console.log(`Function "create-checkout-session" up and running!`);

// Deno.serve(async (req) => {
//   // Handle CORS preflight request
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', { headers: corsHeaders });
//   }
  
//   try {
//     const body = await req.json();
//     const { orderId, order } = body;
    
//     if (!orderId || !order) {
//       return new Response(JSON.stringify({
//         error: "Missing required fields - orderId and order details required"
//       }), {
//         headers: {
//           ...corsHeaders,
//           "Content-Type": "application/json"
//         },
//         status: 400
//       });
//     }
    
//     // Calculate the total amount from all products and custom options
//     const amount = Math.round(order.total_price * 100); // Convert to cents for Stripe
    
//     // Create line items for the checkout session
//     const lineItems = [];
    
//     // Add products to line items
//     if (order.products && order.products.length > 0) {
//       order.products.forEach((product: any) => {
//         lineItems.push({
//           price_data: {
//             currency: 'eur',
//             product_data: {
//               name: product.product_name || 'Product',
//               description: product.product_type || 'Standard',
//             },
//             unit_amount: Math.round(product.unit_price * 100),
//           },
//           quantity: product.quantity,
//         });
//       });
//     }
    
//     // Add custom options to line items if they exist
//     if (order.custom_options && order.custom_options.length > 0) {
//       order.custom_options.forEach((option: any) => {
//         lineItems.push({
//           price_data: {
//             currency: 'eur',
//             product_data: {
//               name: option.option_name || 'Custom Option',
//               description: option.option_description || 'Custom service',
//             },
//             unit_amount: Math.round(parseFloat(option.price) * 100),
//           },
//           quantity: 1,
//         });
//       });
//     }
    
//     // Create metadata for the checkout session
//     const metadata = {
//       orderId,
//       clientId: order.client_id,
//       orderName: order.order_name,
//     };
    
//     // Create a Stripe checkout session
//     const session = await stripe.checkout.sessions.create({
//       mode: "payment",
//       success_url: `${req.headers.get("origin") || "https://illustre.com"}`,
//       cancel_url: `${req.headers.get("origin") || "https://illustre.com"}`,
//       line_items: lineItems,
//       metadata: metadata,
//       client_reference_id: orderId,
//       customer_email: order.client_email,
//     });
    
//     return new Response(JSON.stringify({
//       url: session.url,
//       sessionId: session.id
//     }), {
//       headers: {
//         ...corsHeaders,
//         "Content-Type": "application/json"
//       },
//       status: 200
//     });
//   } catch (err) {
//     console.error("Stripe error:", err);
//     return new Response(JSON.stringify({
//       error: "Internal server error: " + err.message
//     }), {
//       headers: {
//         ...corsHeaders,
//         "Content-Type": "application/json"
//       },
//       status: 500
//     });
//   }
// });
