/**
 * Apple Receipt Validation Edge Function
 *
 * Validates App Store receipts and updates user payment status.
 * Called after a successful iOS in-app purchase.
 */

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { receipt, userId } = await req.json();

    if (!receipt || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing receipt or userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate receipt with Apple
    // Use sandbox URL for testing, production URL for live
    const isProduction = Deno.env.get("APPLE_ENVIRONMENT") === "production";
    const verifyUrl = isProduction
      ? "https://buy.itunes.apple.com/verifyReceipt"
      : "https://sandbox.itunes.apple.com/verifyReceipt";

    const appleResponse = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "receipt-data": receipt,
        "password": Deno.env.get("APPLE_SHARED_SECRET"),
        "exclude-old-transactions": true,
      }),
    });

    const appleResult = await appleResponse.json();

    // Status 0 = valid receipt
    // Status 21007 = sandbox receipt sent to production, retry with sandbox
    if (appleResult.status === 21007 && isProduction) {
      // Retry with sandbox
      const sandboxResponse = await fetch(
        "https://sandbox.itunes.apple.com/verifyReceipt",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            "receipt-data": receipt,
            "password": Deno.env.get("APPLE_SHARED_SECRET"),
            "exclude-old-transactions": true,
          }),
        }
      );
      const sandboxResult = await sandboxResponse.json();

      if (sandboxResult.status !== 0) {
        return new Response(
          JSON.stringify({ error: "Invalid receipt", status: sandboxResult.status }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else if (appleResult.status !== 0) {
      return new Response(
        JSON.stringify({ error: "Invalid receipt", status: appleResult.status }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Receipt is valid - update user's payment status
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: updateError } = await supabase
      .from("users")
      .update({
        has_paid: true,
        payment_source: "apple",
        paid_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to update user:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update payment status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error validating receipt:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
