
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CLIENT-AND-ORDER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Verify user is a closer
    const { data: userRoles, error: rolesError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (rolesError) throw new Error(`Failed to fetch user roles: ${rolesError.message}`);
    
    const isCloser = userRoles.some(role => role.role === 'closer');
    if (!isCloser) throw new Error("Only closers can create clients and orders");

    const { 
      clientName, 
      clientEmail, 
      clientCompany, 
      orderName,
      templateId,
      customOptions = [] 
    } = await req.json();

    if (!clientName || !clientEmail || !orderName || !templateId) {
      throw new Error("Missing required parameters");
    }

    logStep("Parameters received", { clientName, clientEmail, orderName, templateId });

    // Get template details
    const { data: template, error: templateError } = await supabaseClient
      .from("product_templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (templateError) throw new Error(`Failed to fetch template: ${templateError.message}`);
    logStep("Template fetched", { templateName: template.name, price: template.price_cents });

    // Create or get client user
    let clientId;
    
    // First, try to find existing client
    const { data: existingClient, error: clientSearchError } = await supabaseClient
      .from("profiles")
      .select("id")
      .eq("email", clientEmail)
      .single();

    if (existingClient) {
      clientId = existingClient.id;
      logStep("Existing client found", { clientId });
    } else {
      // Create new client user
      const { data: newUser, error: createUserError } = await supabaseClient.auth.admin.createUser({
        email: clientEmail,
        email_confirm: true,
        user_metadata: {
          name: clientName
        }
      });

      if (createUserError) throw new Error(`Failed to create client user: ${createUserError.message}`);
      clientId = newUser.user.id;
      
      // Update profile with company info
      await supabaseClient
        .from("profiles")
        .update({ company: clientCompany })
        .eq("id", clientId);

      logStep("New client created", { clientId });
    }

    // Generate order number
    const { data: orderNumber, error: orderNumberError } = await supabaseClient
      .rpc("generate_order_number");

    if (orderNumberError) throw new Error(`Failed to generate order number: ${orderNumberError.message}`);

    // Calculate total amount
    const customOptionsTotal = customOptions.reduce((sum, option) => sum + (option.price_adjustment_cents || 0), 0);
    const totalAmount = template.price_cents + customOptionsTotal;

    // Create order
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .insert({
        client_id: clientId,
        closer_id: user.id,
        order_number: orderNumber,
        total_amount_cents: totalAmount,
        status: 'onboarding'
      })
      .select()
      .single();

    if (orderError) throw new Error(`Failed to create order: ${orderError.message}`);
    logStep("Order created", { orderId: order.id, orderNumber: order.order_number });

    // Create order product
    const { error: productError } = await supabaseClient
      .from("order_products")
      .insert({
        order_id: order.id,
        template_id: templateId,
        title: template.name,
        format: template.format,
        price_cents: template.price_cents,
        status: 'pending'
      });

    if (productError) throw new Error(`Failed to create order product: ${productError.message}`);

    // Create custom options if any
    if (customOptions.length > 0) {
      const { error: optionsError } = await supabaseClient
        .from("custom_options")
        .insert(
          customOptions.map(option => ({
            order_id: order.id,
            option_name: option.name,
            option_value: option.description,
            price_adjustment_cents: option.price_adjustment_cents || 0
          }))
        );

      if (optionsError) throw new Error(`Failed to create custom options: ${optionsError.message}`);
    }

    // Create onboarding steps
    const onboardingSteps = [
      { order_id: order.id, step: 'contract_signed' },
      { order_id: order.id, step: 'form_completed' },
      { order_id: order.id, step: 'payment_made' },
      { order_id: order.id, step: 'call_scheduled' }
    ];

    const { error: stepsError } = await supabaseClient
      .from("onboarding_steps")
      .insert(onboardingSteps);

    if (stepsError) throw new Error(`Failed to create onboarding steps: ${stepsError.message}`);

    logStep("Order creation completed successfully", { 
      orderId: order.id, 
      clientId, 
      totalAmount,
      customOptionsCount: customOptions.length 
    });

    return new Response(JSON.stringify({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        client_id: clientId,
        total_amount_cents: totalAmount
      },
      client: {
        id: clientId,
        name: clientName,
        email: clientEmail
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
