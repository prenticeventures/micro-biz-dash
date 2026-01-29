/**
 * Game State Service
 * 
 * Handles saving and loading game sessions.
 * Allows users to resume where they left off.
 */

import { supabase, TABLES } from '../lib/supabase';
import type { GameSession } from '../types/database';

/**
 * Save current game state
 * 
 * @param level - Current level number
 * @param score - Current score
 * @param health - Current health (0-3)
 * @param playerX - Player's X position
 * @param playerY - Player's Y position
 * @param gameState - Full game state as JSON string
 * @returns Saved session, or error
 */
export async function saveGameState(
  level: number,
  score: number,
  health: number,
  playerX: number,
  playerY: number,
  gameState: string
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if user has an active session
    const { data: existingSession } = await supabase
      .from(TABLES.GAME_SESSIONS)
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    let result;

    if (existingSession) {
      // Update existing session
      const { data, error } = await supabase
        .from(TABLES.GAME_SESSIONS)
        .update({
          level,
          score,
          health,
          player_position_x: playerX,
          player_position_y: playerY,
          game_state: gameState,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSession.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new session
      // First, deactivate any other sessions
      await supabase
        .from(TABLES.GAME_SESSIONS)
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Create new active session
      const { data, error } = await supabase
        .from(TABLES.GAME_SESSIONS)
        .insert({
          user_id: user.id,
          level,
          score,
          health,
          player_position_x: playerX,
          player_position_y: playerY,
          game_state: gameState,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return { data: result as GameSession, error: null };
  } catch (error: any) {
    return { data: null, error: error.message || 'Failed to save game state' };
  }
}

/**
 * Load the current user's active game session
 * 
 * @returns Active game session, or null if none exists
 */
export async function loadGameState(): Promise<GameSession | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from(TABLES.GAME_SESSIONS)
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (error) {
      // No active session found - this is OK
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as GameSession;
  } catch (error) {
    console.error('Error loading game state:', error);
    return null;
  }
}

/**
 * Start a new game session (deactivates old sessions)
 * 
 * @returns New session, or error
 */
export async function startNewGame() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Deactivate all existing sessions
    await supabase
      .from(TABLES.GAME_SESSIONS)
      .update({ is_active: false })
      .eq('user_id', user.id);

    // Create new session starting at level 1
    const { data, error } = await supabase
      .from(TABLES.GAME_SESSIONS)
      .insert({
        user_id: user.id,
        level: 1,
        score: 0,
        health: 3,
        player_position_x: 50,
        player_position_y: 100,
        game_state: '{}',
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return { data: data as GameSession, error: null };
  } catch (error: any) {
    return { data: null, error: error.message || 'Failed to start new game' };
  }
}

/**
 * Complete a game session (mark as finished)
 * 
 * @param sessionId - Session ID to complete
 */
export async function completeGameSession(sessionId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from(TABLES.GAME_SESSIONS)
      .update({
        is_active: false,
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    return { error: error.message || 'Failed to complete session' };
  }
}
