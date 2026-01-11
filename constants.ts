export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const GRAVITY = 0.5;
export const JUMP_FORCE = -14; 
export const MOVE_SPEED = 6;
export const FRICTION = 0.85;
export const MAX_HEALTH = 3;

export const COLORS = {
  SKY_LEVEL_1: ['#87CEEB', '#E0F7FA'], // Daylight
  SKY_LEVEL_2: ['#FFD700', '#FF8C00'], // Golden Afternoon (Distribution)
  SKY_LEVEL_3: ['#001100', '#000000'], // Matrix Green (Tech)
  SKY_LEVEL_4: ['#708090', '#2F4F4F'], // Cold Gray/Blue (Finance Office)
  SKY_LEVEL_5: ['#4B0082', '#000000'], // Dark Stormy (Churn Peak)
  
  PLATFORM_GRASS: '#4CAF50',
  PLATFORM_DIRT: '#8B4513',
  PLATFORM_CONCRETE: '#708090',
  PLATFORM_OFFICE: '#2F4F4F', 
  PLATFORM_MARBLE: '#EDEADE', // Finance
  PLATFORM_VOLCANIC: '#3e2723', // Churn

  DANGER_RED: '#ff4d4d',
  PROFIT_GREEN: '#00cc66',
  GOLD: '#ffd700',
  TEXT_WHITE: '#ffffff',
  PLAYER_SUIT: '#2563EB', 
  PLAYER_SKIN: '#FFDCB1',
};

export const SPRITES = {
  PLAYER_HEAD: '👱‍♀️',
  // Enemies
  CATERPILLAR: '🐛', // L1: Red Tape 
  GHOST: '👻',       // L2: Inflation/Invisible Market
  ALIEN: '👾',       // L3: Shadow IT 
  ROBOT: '🤖',       // L4: Audit Bot
  VORTEX: '🌪️',      // L5: Churn Vortex
  
  // Collectibles (Business Themed)
  FUNDING: '💵',     // L1: Seed Capital (Changed to Bill to differentiate from Goal)
  MEGAPHONE: '📣',   // L2: Distribution
  CHIP: '💾',        // L3: Tech/Ops
  LEDGER: '📒',      // L4: Finance/Records
  HEART: '💖',       // L5: Loyalty/Retention
  
  // Powerups
  AI_BOT: '🚀',      // Efficiency
  COFFEE: '☕',      // Anti-Burnout
  
  GOAL: '💰',        // Changed from Flag to Money Bag
  
  // Decorations
  CLOUD: '☁️',
  BUSH: '🌳',
  TREE_LARGE: '🌲',
  BUILDING: '🏢',
  SERVER: '🗄️',
  CALCULATOR: '🧮',
  GRAPH: '📉',
  BROKEN_HEART: '💔',
  FLOWER: '🌻',
  MUSHROOM: '🍄',
  ROCK: '🪨',
  OFFICE_PLANT: '🪴',
  BINARY: '10',
};

export const RESEARCH_SNIPPETS = {
  // Popups
  AI_WIN: "Efficiency Boost! 🚀",
  BURNOUT: "Exhausted! 😫",
  MSG_FUNDING: "Seed Funding Secured! 💵",
  MSG_DISTRIBUTION: "New Market Reached! 📣",
  MSG_TECH: "Systems Optimized! 💾",
  MSG_FINANCE: "Books Balanced! 📒",
  MSG_RETENTION: "Customer Saved! 💖",
  
  // Level Descriptions
  LEVEL_1_DESC: "Market Jungle: Validate your idea & Dodge Red Tape!",
  LEVEL_2_DESC: "Distribution Desert: Make noise & Find Product-Market Fit!",
  LEVEL_3_DESC: "Tech Swamp: Automate Operations & Squash Shadow IT!",
  LEVEL_4_DESC: "Audit Office: Manage Cashflow & Survive Tax Season!",
  LEVEL_5_DESC: "Churn Peak: Fight Attrition & Build Loyalty!",
  
  // Game Over Messages
  DEATH_L1: "Ran out of Runway!",
  DEATH_L2: "Nobody heard you!",
  DEATH_L3: "System Failure!",
  DEATH_L4: "Audit Failed!",
  DEATH_L5: "Zero Retention!",
  DEFAULT_DEATH: "Bankrupted!"
};