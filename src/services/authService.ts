/**
 * Authentication Service
 * 
 * Handles user registration, login, logout, and profile management.
 * Uses Supabase Auth for secure authentication.
 */

import { supabase, TABLES } from '../lib/supabase';
import type { UserProfile } from '../types/database';

/**
 * Sign up a new user
 * 
 * @param email - User's email address
 * @param password - User's password (min 6 characters)
 * @param gameName - User's chosen game name (displayed in leaderboard)
 * @returns User profile and session, or error
 */
export async function signUp(email: string, password: string, gameName: string) {
  try {
    // 1. Create auth user with game_name in metadata
    // The database trigger will automatically create the user profile
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          game_name: gameName,
        },
      },
    });

    if (authError) {
      // Handle rate limit error specifically
      if (authError.message.includes('rate limit') || authError.message.includes('429')) {
        throw new Error('Too many signup attempts. Please wait a few minutes and try again, or check your email for a confirmation link from a previous attempt.');
      }
      throw authError;
    }
    if (!authData.user) throw new Error('Failed to create user');

    // When email confirmation is required, Supabase returns session: null.
    // We can't read the profile (RLS blocks anon), but the trigger did create it.
    // Return success and tell the user to check their email.
    if (!authData.session) {
      return {
        user: { id: authData.user.id, email: authData.user.email ?? '', game_name: gameName } as UserProfile,
        session: null,
        error: null,
        needsEmailConfirmation: true,
      };
    }

    // 2. We have a session (e.g. email confirmation disabled). Wait for the trigger to create the profile.
    let profile = null;
    let retries = 0;
    const maxRetries = 15;
    const retryDelay = 300;

    while (!profile && retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));

      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (data && !error) {
        profile = data;
        break;
      }
      retries++;
    }

    if (!profile) {
      const { data: rpcData, error: rpcError } = await supabase.rpc('ensure_user_profile');
      if (!rpcError && rpcData?.ok) {
        const { data: retryProfile } = await supabase
          .from(TABLES.USERS)
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();
        if (retryProfile) profile = retryProfile;
      }
      if (!profile) {
        throw new Error('User profile was not created by trigger');
      }
    }

    // 3. Update the game_name in both users and user_stats tables
    // (The trigger creates them with a default, we update with the actual game_name)
    const { data: updatedProfile, error: updateError } = await supabase
      .from(TABLES.USERS)
      .update({ game_name: gameName })
      .eq('id', authData.user.id)
      .select()
      .maybeSingle(); // Use maybeSingle() to avoid the "single JSON object" error

    if (updateError) throw updateError;
    if (!updatedProfile) throw new Error('Failed to update user profile');

    // Update game_name in user_stats as well
    await supabase
      .from(TABLES.USER_STATS)
      .update({ game_name: gameName })
      .eq('user_id', authData.user.id);

    return {
      user: updatedProfile as UserProfile,
      session: authData.session,
      error: null,
    };
  } catch (error: any) {
    return {
      user: null,
      session: null,
      error: error.message || 'Failed to sign up',
    };
  }
}

/**
 * Sign in an existing user
 * 
 * @param email - User's email
 * @param password - User's password
 * @returns User profile and session, or error
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user returned');

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    return {
      user: profile as UserProfile,
      session: data.session,
      error: null,
    };
  } catch (error: any) {
    return {
      user: null,
      session: null,
      error: error.message || 'Failed to sign in',
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get the current user's profile
 * 
 * @returns Current user profile, or null if not logged in
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data as UserProfile;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Update user's game name
 * 
 * @param gameName - New game name
 * @returns Updated profile, or error
 */
export async function updateGameName(gameName: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from(TABLES.USERS)
      .update({ game_name: gameName })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    // Also update game_name in stats table
    await supabase
      .from(TABLES.USER_STATS)
      .update({ game_name: gameName })
      .eq('user_id', user.id);

    return { data: data as UserProfile, error: null };
  } catch (error: any) {
    return { data: null, error: error.message || 'Failed to update game name' };
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}
