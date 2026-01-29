/**
 * Database Type Definitions
 * 
 * These types match the structure of your Supabase database tables.
 * They ensure type safety when working with database data.
 */

/**
 * User Profile
 * 
 * Stores basic user information including their chosen game name.
 */
export interface UserProfile {
  id: string;                    // UUID from auth.users
  game_name: string;             // User's chosen game name (displayed in leaderboard)
  email?: string;                // User's email (optional, from auth)
  created_at: string;            // When the account was created
  updated_at: string;            // Last profile update
  last_played_at?: string;        // Last time they played
}

/**
 * Game Session
 * 
 * Represents a single play session. Users can save and resume sessions.
 */
export interface GameSession {
  id: string;                    // Unique session ID
  user_id: string;               // Who owns this session
  level: number;                 // Current level (1-5+)
  score: number;                 // Current score
  health: number;                // Current health (0-3)
  player_position_x: number;     // Player's X position (for resume)
  player_position_y: number;     // Player's Y position (for resume)
  game_state: string;            // JSON string of full game state (entities, etc.)
  is_active: boolean;            // Is this the current active session?
  created_at: string;            // When session started
  updated_at: string;            // Last save time
  completed_at?: string;         // When session was completed (if finished)
}

/**
 * User Statistics
 * 
 * Aggregated stats for each user (best scores, total playtime, etc.)
 */
export interface UserStats {
  id: string;                    // Unique stat record ID
  user_id: string;               // Who these stats belong to
  game_name: string;             // Denormalized for quick leaderboard queries
  best_score: number;            // Highest score ever achieved
  highest_level: number;          // Furthest level reached
  total_playtime_seconds: number; // Total time played (in seconds)
  total_sessions: number;         // Number of game sessions
  total_coins_collected: number;  // Total coins/funding collected
  games_completed: number;        // Number of times finished all levels
  created_at: string;            // When stats record was created
  updated_at: string;            // Last stats update
}

/**
 * Leaderboard Entry
 * 
 * Top scores for the leaderboard display (top 3)
 * This is a materialized view or computed from user_stats
 */
export interface LeaderboardEntry {
  rank: number;                  // Position (1, 2, 3)
  user_id: string;               // User ID
  game_name: string;             // Display name
  best_score: number;            // Their best score
  highest_level: number;         // Their highest level
  updated_at: string;            // When they last played
}

/**
 * Database helper types
 */
export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>;
      };
      game_sessions: {
        Row: GameSession;
        Insert: Omit<GameSession, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<GameSession, 'id' | 'created_at'>>;
      };
      user_stats: {
        Row: UserStats;
        Insert: Omit<UserStats, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserStats, 'id' | 'created_at'>>;
      };
    };
  };
};
