import { Entity, EntityType, LevelData, Vector } from '../types';
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS, SPRITES, RESEARCH_SNIPPETS } from '../constants';

const TILE_SIZE = 40;

class SeededRNG {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

const createPlatform = (id: string, x: number, y: number, width: number, color: string, topColor?: string): Entity => ({
  id,
  type: EntityType.PLATFORM,
  pos: { x, y },
  size: { width, height: TILE_SIZE },
  vel: { x: 0, y: 0 },
  color: color,
  // We can smuggle the top color into label or a custom prop if we expanded Entity, 
  // but for now we'll handle top color logic in renderer based on level
});

const createDecoration = (id: string, x: number, y: number, label: string, scale: number = 1, opacity: number = 1): Entity => ({
  id,
  type: EntityType.DECORATION,
  pos: { x, y },
  size: { width: 0, height: 0 },
  vel: { x: 0, y: 0 },
  color: 'transparent',
  label,
  scale,
  opacity
});

const createEnemy = (id: string, type: EntityType, x: number, y: number, label: string, patrolDist: number = 100): Entity => ({
  id,
  type,
  pos: { x, y },
  size: { width: TILE_SIZE, height: TILE_SIZE },
  vel: { x: 2, y: 0 },
  color: COLORS.DANGER_RED,
  label,
  patrolStart: x,
  patrolEnd: x + patrolDist
});

const createCollectible = (id: string, type: EntityType, x: number, y: number, label: string): Entity => ({
  id,
  type,
  pos: { x, y },
  size: { width: TILE_SIZE * 0.8, height: TILE_SIZE * 0.8 },
  vel: { x: 0, y: 0 },
  color: COLORS.GOLD,
  label
});

export const generateLevel = (levelIndex: number): LevelData => {
  const rng = new SeededRNG(levelIndex * 999);
  const entities: Entity[] = [];
  const levelWidth = 2000 + (levelIndex * 400); 

  // --- Theme Configuration ---
  let bgSprite = SPRITES.CLOUD;
  let groundColor = COLORS.PLATFORM_DIRT;
  let enemySprite = SPRITES.CATERPILLAR;
  let collectibleSprite = SPRITES.FUNDING; 
  let collectibleType = EntityType.COLLECTIBLE_FUNDING;
  let enemyType = EntityType.ENEMY_RED_TAPE;
  let decorOptions = [SPRITES.BUSH, SPRITES.FLOWER];
  let bossTheme = "Red Tape";
  let lvlName = "Market Jungle";
  let lvlDesc = RESEARCH_SNIPPETS.LEVEL_1_DESC;

  switch(levelIndex) {
    case 1: // Validation
      groundColor = COLORS.PLATFORM_DIRT;
      decorOptions = [SPRITES.BUSH, SPRITES.FLOWER, SPRITES.TREE_LARGE];
      break;
    case 2: // Distribution
      lvlName = "Distribution Desert";
      lvlDesc = RESEARCH_SNIPPETS.LEVEL_2_DESC;
      bossTheme = "Algorithm Change";
      bgSprite = SPRITES.BUILDING;
      groundColor = COLORS.PLATFORM_CONCRETE;
      enemySprite = SPRITES.GHOST; // Invisible customers / Ghosting
      enemyType = EntityType.ENEMY_INFLATION; 
      collectibleSprite = SPRITES.MEGAPHONE;
      collectibleType = EntityType.COLLECTIBLE_DISTRIBUTION;
      decorOptions = [SPRITES.OFFICE_PLANT, SPRITES.ROCK];
      break;
    case 3: // Operations
      lvlName = "Tech Swamp";
      lvlDesc = RESEARCH_SNIPPETS.LEVEL_3_DESC;
      bossTheme = "Tech Debt";
      bgSprite = SPRITES.BINARY;
      groundColor = COLORS.PLATFORM_OFFICE;
      enemySprite = SPRITES.ALIEN; // Shadow IT
      enemyType = EntityType.ENEMY_SHADOW_IT;
      collectibleSprite = SPRITES.CHIP;
      collectibleType = EntityType.COLLECTIBLE_TECH;
      decorOptions = [SPRITES.SERVER, '⚡'];
      break;
    case 4: // Finance
      lvlName = "Audit Office";
      lvlDesc = RESEARCH_SNIPPETS.LEVEL_4_DESC;
      bossTheme = "Tax Man";
      bgSprite = SPRITES.GRAPH;
      groundColor = COLORS.PLATFORM_MARBLE;
      enemySprite = SPRITES.ROBOT;
      enemyType = EntityType.ENEMY_AUDIT;
      collectibleSprite = SPRITES.LEDGER;
      collectibleType = EntityType.COLLECTIBLE_FINANCE;
      decorOptions = [SPRITES.CALCULATOR, SPRITES.OFFICE_PLANT];
      break;
    case 5: // Retention
      lvlName = "Churn Peak";
      lvlDesc = RESEARCH_SNIPPETS.LEVEL_5_DESC;
      bossTheme = "The Vortex";
      bgSprite = SPRITES.BROKEN_HEART;
      groundColor = COLORS.PLATFORM_VOLCANIC;
      enemySprite = SPRITES.VORTEX;
      enemyType = EntityType.ENEMY_CHURN;
      collectibleSprite = SPRITES.HEART;
      collectibleType = EntityType.COLLECTIBLE_RETENTION;
      decorOptions = ['⚡', '🔥', SPRITES.ROCK];
      break;
  }

  // --- Background Terrain ---
  const backgroundTerrain: Vector[] = [];
  let bgX = 0;
  let bgY = CANVAS_HEIGHT - 100;
  backgroundTerrain.push({ x: 0, y: CANVAS_HEIGHT });
  backgroundTerrain.push({ x: 0, y: bgY });

  while (bgX < CANVAS_WIDTH) { 
    const segmentWidth = 40 + rng.next() * 60;
    
    if (levelIndex === 4) { // Office (Flat/Blocky)
      if (rng.next() > 0.7) bgY = CANVAS_HEIGHT - 300;
      else bgY = CANVAS_HEIGHT - 100;
      backgroundTerrain.push({ x: bgX, y: bgY });
      backgroundTerrain.push({ x: bgX + segmentWidth, y: bgY });
    } else if (levelIndex === 5) { // Spiky/Volcanic
       bgY = CANVAS_HEIGHT - 100 - (rng.next() * 300);
       backgroundTerrain.push({ x: bgX + segmentWidth/2, y: bgY });
       backgroundTerrain.push({ x: bgX + segmentWidth, y: CANVAS_HEIGHT - 50 });
    } else {
       // Organic
       bgY += (rng.next() * 60) - 30;
       bgY = Math.max(CANVAS_HEIGHT - 250, Math.min(CANVAS_HEIGHT - 50, bgY));
       backgroundTerrain.push({ x: bgX + segmentWidth, y: bgY });
    }
    bgX += segmentWidth;
  }
  backgroundTerrain.push({ x: CANVAS_WIDTH, y: CANVAS_HEIGHT });

  // --- Background Objects ---
  const bgCount = levelWidth / 200;
  for (let i = 0; i < bgCount; i++) {
    entities.push(createDecoration(
      `bg-${i}`, 
      rng.next() * levelWidth, 
      rng.next() * (CANVAS_HEIGHT * 0.6), 
      bgSprite, 
      1 + rng.next() * 2, 
      0.1 + rng.next() * 0.2
    ));
  }

  // --- Platforms & Game Objects ---
  let currentX = 0;
  let groundY = CANVAS_HEIGHT - TILE_SIZE;
  
  while (currentX < levelWidth) {
    const gap = rng.range(60, 180); 
    const width = rng.range(150, 400); 
    
    // Create Gaps
    if (currentX > 300 && currentX < levelWidth - 300 && rng.next() > 0.65) {
       currentX += gap;
    } else {
       // Main Ground
       entities.push(createPlatform(`plat-${currentX}`, currentX, groundY, width, groundColor));
       
       // Floating Platforms
       if (rng.next() > 0.4) {
         const floatY = groundY - rng.range(120, 180);
         const floatW = width * 0.6;
         entities.push(createPlatform(`float-${currentX}`, currentX + width*0.2, floatY, floatW, groundColor));
         
         // Collectibles on floaters
         if (rng.next() > 0.2) {
            entities.push(createCollectible(
              `coll-${currentX}`, 
              collectibleType, 
              currentX + width*0.5, 
              floatY - TILE_SIZE,
              collectibleSprite
            ));
         }
       }

       // Ground Decor
       if (rng.next() > 0.3) {
          const decor = decorOptions[Math.floor(rng.next() * decorOptions.length)];
          entities.push(createDecoration(`dec-${currentX}`, currentX + rng.next() * width, groundY - 20, decor, 1));
       }

       // Enemies
       if (currentX > 500 && rng.next() > 0.35) {
          entities.push(createEnemy(
            `enemy-${currentX}`, 
            enemyType, 
            currentX + width/2, 
            groundY - TILE_SIZE, 
            enemySprite
          ));
       }
       
       // Elevation Change
       if (rng.next() > 0.5) {
         groundY = Math.max(300, Math.min(CANVAS_HEIGHT - TILE_SIZE, groundY + (rng.next() > 0.5 ? -80 : 80)));
       }
       
       currentX += width;
    }
  }

  // Goal
  // Bigger Money Bag for the Goal
  const goalSize = TILE_SIZE * 2.5; 
  entities.push({
    id: 'goal',
    type: EntityType.GOAL,
    pos: { x: levelWidth - 100, y: groundY - goalSize },
    size: { width: goalSize, height: goalSize },
    vel: { x: 0, y: 0 },
    color: COLORS.PROFIT_GREEN,
    label: SPRITES.GOAL
  });

  return {
    id: levelIndex,
    name: lvlName,
    description: lvlDesc,
    bossTheme,
    width: levelWidth,
    entities,
    backgroundTerrain
  };
};