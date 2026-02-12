export type Vector = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export enum EntityType {
  PLAYER = 'PLAYER',
  PLATFORM = 'PLATFORM',
  
  // Enemies
  ENEMY_RED_TAPE = 'ENEMY_RED_TAPE',   
  ENEMY_INFLATION = 'ENEMY_INFLATION', 
  ENEMY_SHADOW_IT = 'ENEMY_SHADOW_IT', 
  ENEMY_AUDIT = 'ENEMY_AUDIT',
  ENEMY_CHURN = 'ENEMY_CHURN',
  
  // Specific Business Lesson Collectibles
  COLLECTIBLE_FUNDING = 'COLLECTIBLE_FUNDING',     // Lvl 1
  COLLECTIBLE_DISTRIBUTION = 'COLLECTIBLE_DISTRIBUTION', // Lvl 2
  COLLECTIBLE_TECH = 'COLLECTIBLE_TECH',           // Lvl 3 (Customer Service/Ops)
  COLLECTIBLE_FINANCE = 'COLLECTIBLE_FINANCE',     // Lvl 4 (Ledgers)
  COLLECTIBLE_RETENTION = 'COLLECTIBLE_RETENTION', // Lvl 5 (Loyalty)
  
  POWERUP_AI = 'POWERUP_AI',
  POWERUP_REST = 'POWERUP_REST',
  GOAL = 'GOAL',
  DECORATION = 'DECORATION'
}

export interface Entity {
  id: string;
  type: EntityType;
  pos: Vector;
  size: Size;
  vel: Vector;
  color: string;
  label?: string; // Emoji or text
  patrolStart?: number;
  patrolEnd?: number;
  isDead?: boolean;
  opacity?: number; 
  scale?: number;
  // Parallax depth: 0.1 = far (moves slow), 0.3 = mid, 1.0 = foreground (moves with camera)
  depth?: number;
}

export interface Player extends Entity {
  isGrounded: boolean;
  isInvincible: boolean;
  invincibleTimer: number;
  health: number;
  capital: number;
  direction: 1 | -1; // Added for rendering
}

export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export interface LevelData {
  id: number;
  name: string;
  description: string;
  bossTheme: string;
  entities: Entity[];
  width: number;
  backgroundTerrain: Vector[]; 
}