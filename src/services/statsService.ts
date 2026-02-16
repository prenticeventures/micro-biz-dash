/**
 * Stats Service
 * 
 * Handles user statistics tracking and leaderboard queries.
 */

import { supabase, TABLES } from '../lib/supabase';
import type { UserStats, LeaderboardEntry } from '../types/database';

/**
 * Update user stats after a game session
 * 
 * @param score - Final score for this session
 * @param level - Highest level reached
 * @param playtimeSeconds - How long they played (in seconds)
 * @param coinsCollected - Coins collected in this session
 * @param gameCompleted - Did they finish all levels?
 * @param incrementSession - Should total_sessions increment for this update?
 */
export async function updateUserStats(
  score: number,
  level: number,
  playtimeSeconds: number,
  coinsCollected: number,
  gameCompleted: boolean = false,
  incrementSession: boolean = false
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get current stats
    const { data: currentStats } = await supabase
      .from(TABLES.USER_STATS)
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!currentStats) {
      throw new Error('User stats not found');
    }

    // Calculate new stats
    const newBestScore = Math.max(currentStats.best_score, score);
    const newHighestLevel = Math.max(currentStats.highest_level, level);
    const newTotalPlaytime = currentStats.total_playtime_seconds + playtimeSeconds;
    const newTotalSessions = currentStats.total_sessions + (incrementSession ? 1 : 0);
    const newTotalCoins = currentStats.total_coins_collected + coinsCollected;
    const newGamesCompleted = gameCompleted
      ? currentStats.games_completed + 1
      : currentStats.games_completed;

    // Update stats
    const { data, error } = await supabase
      .from(TABLES.USER_STATS)
      .update({
        best_score: newBestScore,
        highest_level: newHighestLevel,
        total_playtime_seconds: newTotalPlaytime,
        total_sessions: newTotalSessions,
        total_coins_collected: newTotalCoins,
        games_completed: newGamesCompleted,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    // Update last_played_at in users table
    await supabase
      .from(TABLES.USERS)
      .update({ last_played_at: new Date().toISOString() })
      .eq('id', user.id);

    return { data: data as UserStats, error: null };
  } catch (error: any) {
    return { data: null, error: error.message || 'Failed to update stats' };
  }
}

/**
 * Get current user's stats
 * 
 * @returns User's stats, or null if not found
 */
export async function getUserStats(): Promise<UserStats | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from(TABLES.USER_STATS)
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data as UserStats;
  } catch (error) {
    console.error('Error getting user stats:', error);
    return null;
  }
}

/**
 * Get top 3 leaderboard entries
 * 
 * @returns Array of top 3 players by best_score
 */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const { data, error } = await supabase
      .from(TABLES.USER_STATS)
      .select('user_id, game_name, best_score, highest_level, updated_at')
      .gt('best_score', 0) // Only show players who have actually played
      .order('best_score', { ascending: false })
      .limit(3);

    if (error) throw error;

    // Add rank to each entry
    return (data || []).map((entry, index) => ({
      rank: index + 1,
      user_id: entry.user_id,
      game_name: entry.game_name,
      best_score: entry.best_score,
      highest_level: entry.highest_level,
      updated_at: entry.updated_at,
    })) as LeaderboardEntry[];
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
}

/**
 * Subscribe to leaderboard updates (real-time)
 * 
 * @param callback - Function to call when leaderboard changes
 * @returns Unsubscribe function
 */
export function subscribeToLeaderboard(
  callback: (entries: LeaderboardEntry[]) => void
) {
  const channel = supabase
    .channel('leaderboard-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLES.USER_STATS,
      },
      async () => {
        // Reload leaderboard when stats change
        const entries = await getLeaderboard();
        callback(entries);
      }
    )
    .subscribe();

  // Initial load
  getLeaderboard().then(callback);

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}
