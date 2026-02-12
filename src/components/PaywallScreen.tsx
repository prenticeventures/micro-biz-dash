/**
 * Paywall Screen Component
 *
 * Shown after Level 1 completion for unpaid users.
 * Handles purchase flow for iOS (Apple IAP) and web (Stripe).
 */

import { useState, useEffect } from "react";
import {
  purchaseUnlock,
  restorePurchases,
  getProductInfo,
  isNativePlatform
} from "../services/purchaseService";
import { supabase } from "../lib/supabase";

// Check if running in development mode
const isDev = import.meta.env.DEV || window.location.hostname === "localhost";

interface PaywallScreenProps {
  userId: string;
  userEmail: string;
  score: number;
  onPurchaseComplete: () => void;
  onRestartLevel1: () => void;
}

export function PaywallScreen({
  userId,
  userEmail,
  score,
  onPurchaseComplete,
  onRestartLevel1
}: PaywallScreenProps) {
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [price, setPrice] = useState<string>("$0.99");

  const isIOS = isNativePlatform();

  // Load product info on mount
  useEffect(() => {
    getProductInfo().then((info) => {
      if (info) {
        setPrice(info.price);
      }
    });
  }, []);

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);

    const result = await purchaseUnlock(userId, userEmail);

    if (result.success) {
      onPurchaseComplete();
    } else {
      setError(result.error || "Purchase failed. Please try again.");
    }
    setLoading(false);
  };

  const handleRestore = async () => {
    setRestoring(true);
    setError(null);

    const result = await restorePurchases(userId);

    if (result.success) {
      onPurchaseComplete();
    } else {
      setError(result.error || "No previous purchases found.");
    }
    setRestoring(false);
  };

  // Dev mode: Skip payment for testing
  const handleDevSkip = async () => {
    if (!isDev) return;

    setLoading(true);
    setError(null);

    try {
      // Update database directly in dev mode
      const { error: updateError } = await supabase
        .from("users")
        .update({
          has_paid: true,
          payment_source: "dev_bypass",
          paid_at: new Date().toISOString()
        })
        .eq("id", userId);

      if (updateError) {
        setError("Dev skip failed: " + updateError.message);
      } else {
        onPurchaseComplete();
      }
    } catch (err: any) {
      setError("Dev skip failed: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-50">
      <div className="bg-gray-800 border-2 border-yellow-500 rounded-lg p-6 sm:p-8 max-w-md w-full mx-4">
        {/* Level Complete Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl text-green-400 mb-2 font-['Press_Start_2P']">
            LEVEL 1
          </h1>
          <h2 className="text-lg sm:text-xl text-green-400 mb-4 font-['Press_Start_2P']">
            COMPLETE!
          </h2>
          <p className="text-yellow-400 text-lg">
            Score: <span className="font-bold">{score.toLocaleString()}</span>
          </p>
        </div>

        {/* Unlock Offer */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-yellow-400 text-center text-sm sm:text-base font-bold mb-2">
            UNLOCK ALL LEVELS
          </h3>
          <p className="text-white text-center text-sm mb-2">
            Continue your adventure through all 5 levels!
          </p>
          <p className="text-gray-400 text-center text-xs">
            One-time purchase • Includes all future levels
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-2 rounded text-sm mb-4">
            {error}
          </div>
        )}

        {/* Purchase Button */}
        <button
          onClick={handlePurchase}
          disabled={loading || restoring}
          className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-4 rounded border-b-4 border-green-700 active:border-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3 text-sm sm:text-base"
        >
          {loading ? "Processing..." : `UNLOCK FOR ${price}`}
        </button>

        {/* Restore Purchases (iOS only) */}
        {isIOS && (
          <button
            onClick={handleRestore}
            disabled={loading || restoring}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded border-b-2 border-gray-800 active:border-0 active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3 text-xs sm:text-sm"
          >
            {restoring ? "Restoring..." : "Restore Purchase"}
          </button>
        )}

        {/* Dev Mode Skip Button */}
        {isDev && (
          <button
            onClick={handleDevSkip}
            disabled={loading || restoring}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded border-b-2 border-purple-800 active:border-0 active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3 text-xs sm:text-sm"
          >
            {loading ? "Skipping..." : "Skip Payment (Dev Only)"}
          </button>
        )}

        {/* Restart Level 1 */}
        <button
          onClick={onRestartLevel1}
          disabled={loading || restoring}
          className="w-full text-gray-400 hover:text-white text-xs sm:text-sm underline py-2 disabled:opacity-50"
        >
          No thanks, replay Level 1
        </button>

        {/* Payment Info */}
        <p className="text-gray-500 text-xs text-center mt-4">
          {isIOS
            ? "Payment will be charged to your Apple ID account."
            : "Secure payment powered by Stripe."}
        </p>
      </div>
    </div>
  );
}
