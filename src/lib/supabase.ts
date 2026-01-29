/**
 * Supabase Client Configuration
 * 
 * This file sets up the connection to your Supabase backend.
 * It handles authentication, database queries, and real-time subscriptions.
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.\n' +
    'You need:\n' +
    '- VITE_SUPABASE_URL\n' +
    '- VITE_SUPABASE_ANON_KEY\n\n' +
    'Get these from: https://app.supabase.com/project/YOUR_PROJECT/settings/api'
  );
}

/**
 * Supabase client instance
 * 
 * This is the main client used throughout the app for:
 * - Authentication (sign up, sign in, sign out)
 * - Database queries (users, game sessions, stats)
 * - Real-time subscriptions (leaderboard updates)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
