/**
 * Purchase Service
 *
 * Handles in-app purchases for iOS (Apple StoreKit) and web (Stripe).
 * iOS purchases are required by Apple for digital content unlocks.
 * Web uses Stripe Checkout for browser-based purchases.
 */

import { Capacitor } from "@capacitor/core";
import { NativePurchases, PURCHASE_TYPE } from "@capgo/native-purchases";
import { supabase } from "../lib/supabase";

// Product ID configured in App Store Connect
const PRODUCT_ID = "com.microbizdash.game.unlock_all_levels";

// Stripe configuration (for web)
const STRIPE_CHECKOUT_URL = import.meta.env.VITE_STRIPE_CHECKOUT_URL;

/**
 * Check if we're running on iOS native platform
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get product information from App Store
 * Returns price and product details for display
 */
export async function getProductInfo(): Promise<{
  price: string;
  productId: string;
  title: string;
} | null> {
  if (!isNativePlatform()) {
    // Web - return static info (Stripe handles pricing)
    return {
      price: "$0.99",
      productId: PRODUCT_ID,
      title: "Unlock All Levels"
    };
  }

  try {
    const { products } = await NativePurchases.getProducts({
      productIdentifiers: [PRODUCT_ID],
      productType: PURCHASE_TYPE.INAPP
    });

    if (products.length === 0) {
      console.error("Product not found in App Store");
      return null;
    }

    const product = products[0];
    return {
      price: product.priceString || "$0.99",
      productId: product.identifier,
      title: product.title || "Unlock All Levels"
    };
  } catch (error) {
    console.error("Failed to get product info:", error);
    return null;
  }
}

/**
 * Purchase unlock on iOS via Apple In-App Purchase
 */
async function purchaseApple(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Make the purchase
    const transaction = await NativePurchases.purchaseProduct({
      productIdentifier: PRODUCT_ID,
      productType: PURCHASE_TYPE.INAPP
    });

    if (!transaction) {
      return { success: false, error: "Purchase was cancelled" };
    }

    // For a simple one-time purchase, we can validate client-side
    // and update the database. For production, you'd want server-side validation.

    // Update user's paid status in database
    const { error: updateError } = await supabase
      .from("users")
      .update({
        has_paid: true,
        payment_source: "apple",
        paid_at: new Date().toISOString()
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to update payment status:", updateError);
      return { success: false, error: "Payment recorded but failed to update account. Please contact support." };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Apple purchase failed:", error);

    // Handle specific error cases
    if (error.message?.includes("cancelled") || error.code === "E_USER_CANCELLED") {
      return { success: false, error: "Purchase was cancelled" };
    }

    return { success: false, error: error.message || "Purchase failed. Please try again." };
  }
}

/**
 * Purchase unlock on web via Stripe Checkout
 * This redirects to Stripe's hosted checkout page
 */
async function purchaseStripe(userId: string, userEmail: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Call Supabase Edge Function to create a Stripe Checkout session
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { userId, userEmail }
    });

    if (error) {
      console.error("Failed to create checkout session:", error);
      return { success: false, error: "Failed to start checkout. Please try again." };
    }

    if (data?.url) {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
      return { success: true }; // Will redirect, webhook handles the rest
    }

    return { success: false, error: "Failed to get checkout URL" };
  } catch (error: any) {
    console.error("Stripe checkout failed:", error);
    return { success: false, error: error.message || "Checkout failed. Please try again." };
  }
}

/**
 * Main purchase function - routes to correct payment method
 */
export async function purchaseUnlock(
  userId: string,
  userEmail: string
): Promise<{ success: boolean; error?: string }> {
  if (isNativePlatform()) {
    return purchaseApple(userId);
  } else {
    return purchaseStripe(userId, userEmail);
  }
}

/**
 * Restore previous purchases (iOS only)
 * Required by Apple App Store guidelines
 */
export async function restorePurchases(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!isNativePlatform()) {
    return { success: false, error: "Restore is only available on iOS" };
  }

  try {
    await NativePurchases.restorePurchases();

    // After restore, check if user has the unlock
    // The plugin will restore all previous non-consumable purchases
    // We need to verify they have our product

    // For simplicity, we'll update their status if restore succeeds
    // In production, you'd verify the restored transactions
    const { error: updateError } = await supabase
      .from("users")
      .update({
        has_paid: true,
        payment_source: "apple",
        paid_at: new Date().toISOString()
      })
      .eq("id", userId);

    if (updateError) {
      return { success: false, error: "Restore completed but failed to update account" };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Restore failed:", error);

    if (error.message?.includes("No purchases to restore")) {
      return { success: false, error: "No previous purchases found" };
    }

    return { success: false, error: error.message || "Restore failed. Please try again." };
  }
}

/**
 * Check if user has paid (from database)
 */
export async function checkPaidStatus(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("has_paid")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Failed to check paid status:", error);
      return false;
    }

    return data?.has_paid ?? false;
  } catch (error) {
    console.error("Error checking paid status:", error);
    return false;
  }
}
