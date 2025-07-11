
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-ONBOARDING-EMAIL] ${step}${detailsStr}`);
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

    const { orderId, clientEmail, clientName } = await req.json();
    if (!orderId || !clientEmail || !clientName) {
      throw new Error("Missing required parameters: orderId, clientEmail, clientName");
    }

    logStep("Parameters received", { orderId, clientEmail, clientName });

    // Get order details with products
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select(`
        *,
        order_products (
          id,
          title,
          format,
          price_cents
        ),
        onboarding_steps (
          step,
          completed
        )
      `)
      .eq("id", orderId)
      .single();

    if (orderError) throw new Error(`Failed to fetch order: ${orderError.message}`);
    logStep("Order details fetched", { orderNumber: order.order_number });

    // Generate onboarding links (mock for now)
    const baseUrl = req.headers.get("origin") || "https://yourapp.com";
    const contractLink = `${baseUrl}/contract/${orderId}`;
    const formLink = `${baseUrl}/onboarding-form/${orderId}`;
    const paymentLink = order.stripe_payment_link || `${baseUrl}/payment/${orderId}`;
    const calendarLink = `${baseUrl}/schedule-call/${orderId}`;

    // Create email content
    const emailContent = {
      to: clientEmail,
      subject: `🎬 Bienvenue chez illustre! - Votre commande ${order.order_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">illustre!</h1>
            <p style="color: white; margin: 10px 0 0 0;">Votre aventure vidéo commence ici</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <h2 style="color: #1f2937;">Bonjour ${clientName} ! 👋</h2>
            
            <p>Félicitations ! Votre commande <strong>${order.order_number}</strong> a été créée avec succès.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">📋 Récapitulatif de votre commande</h3>
              <ul style="list-style: none; padding: 0;">
                ${order.order_products.map(product => `
                  <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <strong>${product.title}</strong> - ${product.format} - ${(product.price_cents / 100).toFixed(2)}€
                  </li>
                `).join('')}
              </ul>
              <p style="font-size: 18px; font-weight: bold; margin: 15px 0 0 0; color: #059669;">
                Total: ${(order.total_amount_cents / 100).toFixed(2)}€
              </p>
            </div>

            <h3 style="color: #1f2937;">🚀 Prochaines étapes</h3>
            <p>Pour commencer la production de vos vidéos, veuillez compléter les étapes suivantes :</p>
            
            <div style="margin: 20px 0;">
              <div style="display: flex; align-items: center; margin: 15px 0; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <span style="font-size: 20px; margin-right: 10px;">📄</span>
                <div>
                  <strong>1. Signature du contrat</strong><br>
                  <a href="${contractLink}" style="color: #3b82f6; text-decoration: none;">Signer le contrat →</a>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; margin: 15px 0; padding: 15px; background: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 4px;">
                <span style="font-size: 20px; margin-right: 10px;">📝</span>
                <div>
                  <strong>2. Formulaire d'onboarding</strong><br>
                  <a href="${formLink}" style="color: #3b82f6; text-decoration: none;">Remplir le formulaire →</a>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; margin: 15px 0; padding: 15px; background: #dcfce7; border-left: 4px solid #10b981; border-radius: 4px;">
                <span style="font-size: 20px; margin-right: 10px;">💳</span>
                <div>
                  <strong>3. Paiement</strong><br>
                  <a href="${paymentLink}" style="color: #3b82f6; text-decoration: none;">Procéder au paiement →</a>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; margin: 15px 0; padding: 15px; background: #fce7f3; border-left: 4px solid #ec4899; border-radius: 4px;">
                <span style="font-size: 20px; margin-right: 10px;">📞</span>
                <div>
                  <strong>4. Appel d'onboarding</strong><br>
                  <a href="${calendarLink}" style="color: #3b82f6; text-decoration: none;">Planifier l'appel →</a>
                </div>
              </div>
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h4 style="color: #1f2937; margin-top: 0;">ℹ️ Informations importantes</h4>
              <ul style="color: #6b7280; line-height: 1.6;">
                <li>La production commencera dès que toutes les étapes seront complétées</li>
                <li>Vous recevrez des mises à jour régulières sur l'avancement</li>
                <li>N'hésitez pas à nous contacter pour toute question</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/client" style="background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Accéder à mon espace client
              </a>
            </div>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280;">
            <p>Merci de faire confiance à illustre! 🎬</p>
            <p style="font-size: 12px;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      `
    };

    // Log the email content for now (replace with actual email service)
    logStep("Email content prepared", { to: emailContent.to, subject: emailContent.subject });
    console.log("EMAIL CONTENT:", emailContent);

    // Here you would integrate with an email service like Resend
    // For now, we'll simulate successful sending
    logStep("Email sent successfully");

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Onboarding email sent successfully",
      orderId,
      clientEmail 
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
