-- Migration: Add Payment Tracking
-- Date: 2026-02-06
-- Purpose: Add columns to track user payment status for paywall

-- Add payment tracking columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS has_paid BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_source TEXT, -- 'apple', 'stripe', or 'grandfathered'
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN public.users.has_paid IS 'Whether user has paid for full access';
COMMENT ON COLUMN public.users.payment_source IS 'Source of payment: apple, stripe, or grandfathered';
COMMENT ON COLUMN public.users.paid_at IS 'Timestamp when payment was made';

-- GRANDFATHER EXISTING USERS: Set has_paid=true for all current users
-- This ensures users who signed up before the paywall get free access
-- Run this ONCE when deploying the paywall
UPDATE public.users
SET has_paid = true,
    payment_source = 'grandfathered',
    paid_at = NOW()
WHERE has_paid = false;
