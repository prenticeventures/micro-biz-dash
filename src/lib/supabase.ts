/**
 * Supabase Client Configuration
 * 
 * This file sets up the connection to your Supabase backend.
 * It handles authentication, database queries, and real-time subscriptions.
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabaseConfigError = isSupabaseConfigured
  ? null
  : 'Missing Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). Running in guest-only mode.';

if (!isSupabaseConfigured) {
  console.error(
    'Missing Supabase environment variables. Running in guest-only mode.'
  );
}

// Fallback values prevent a hard crash before React can render an error state.
const clientUrl = supabaseUrl || 'https://invalid.local';
const clientAnonKey = supabaseAnonKey || 'missing-anon-key';

/**
 * Supabase client instance
 * 
 * This is the main client used throughout the app for:
 * - Authentication (sign up, sign in, sign out)
 * - Database queries (users, game sessions, stats)
 * - Real-time subscriptions (leaderboard updates)
 */
export const supabase = createClient(clientUrl, clientAnonKey, {
  auth: {
    // Store auth tokens in localStorage for persistence
    storage: window.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

/**
 * Database table names
 * 
 * These constants help prevent typos when querying tables
 */
export const TABLES = {
  USERS: 'users',
  GAME_SESSIONS: 'game_sessions',
  USER_STATS: 'user_stats',
  LEADERBOARD: 'leaderboard_entries'
} as const;
