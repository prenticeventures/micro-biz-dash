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

const getTerrainYAtX = (x: number, terrain: Vector[]): number => {
  // terrain[0] is bottom-left corner, terrain[last] is bottom-right corner.
  // Surface points run from index 1 to length-2. Linearly interpolate between them.
  for (let i = 1; i < terrain.length - 1; i++) {
    const a = terrain[i];
    const b = terrain[i + 1];
    if (x >= a.x && x <= b.x) {
      if (b.x === a.x) return a.y;
      const t = (x - a.x) / (b.x - a.x);
      return a.y + t * (b.y - a.y);
    }
  }
  return terrain[terrain.length - 2].y;
};

export const generateLevel = (levelIndex: number): LevelData => {
  const rng = new SeededRNG(levelIndex * 999);
  const bgRng = new SeededRNG(levelIndex * 12345);
  const entities: Entity[] = [];
  const levelWidth = 2000 + (levelIndex * 400); 

  // --- Theme Configuration ---
  let bgSpriteOptions = ['🏡', '🌳', '🌲']; // L1 default: houses, trees (clouds now in sky)
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
      bgSpriteOptions = ['🏡', '🌳', '🌲']; // houses, trees
      break;
    case 2: // Distribution
      lvlName = "Distribution Desert";
      lvlDesc = RESEARCH_SNIPPETS.LEVEL_2_DESC;
      bossTheme = "Algorithm Change";
      bgSpriteOptions = ['🏢', '🏗️', '🌆']; // buildings, construction, cityscape
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
      bgSpriteOptions = ['🗄️', '💻', '10']; // servers, computers, binary
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
      bgSpriteOptions = ['📉', '📊', '🧮']; // graphs, charts, calculator
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
      bgSpriteOptions = ['🪨', '⚡', '💔']; // rocks, lightning, broken hearts
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

  while (bgX < levelWidth) {
    const segmentWidth = 40 + bgRng.next() * 60;

    if (levelIndex === 4) { // Office (Flat/Blocky)
      if (bgRng.next() > 0.7) bgY = CANVAS_HEIGHT - 300;
      else bgY = CANVAS_HEIGHT - 100;
      backgroundTerrain.push({ x: bgX, y: bgY });
      backgroundTerrain.push({ x: bgX + segmentWidth, y: bgY });
    } else if (levelIndex === 5) { // Spiky/Volcanic
       bgY = CANVAS_HEIGHT - 100 - (bgRng.next() * 300);
       backgroundTerrain.push({ x: bgX + segmentWidth/2, y: bgY });
       backgroundTerrain.push({ x: bgX + segmentWidth, y: CANVAS_HEIGHT - 50 });
    } else {
       // Organic
       bgY += (bgRng.next() * 60) - 30;
       bgY = Math.max(CANVAS_HEIGHT - 250, Math.min(CANVAS_HEIGHT - 50, bgY));
       backgroundTerrain.push({ x: bgX + segmentWidth, y: bgY });
    }
    bgX += segmentWidth;
  }
  backgroundTerrain.push({ x: levelWidth, y: CANVAS_HEIGHT });

  // --- Background Objects (with composition rules) ---
  const bgCount = Math.floor(levelWidth / 180); // Moderate density
  const placedObjects: number[] = []; // Track X positions for spacing
  const minSpacing = 180; // Minimum distance between objects

  for (let i = 0; i < bgCount; i++) {
    // Try to place object with minimum spacing
    let bgObjX = -1;
    let attempts = 0;
    while (attempts < 10) {
      const candidateX = bgRng.next() * levelWidth;
      // Check spacing against all placed objects
      const tooClose = placedObjects.some(px => Math.abs(candidateX - px) < minSpacing);
      if (!tooClose) {
        bgObjX = candidateX;
        placedObjects.push(bgObjX);
        break;
      }
      attempts++;
    }

    // If we couldn't find a spot with spacing, skip this object
    if (bgObjX === -1) continue;

    const bgObjY = getTerrainYAtX(bgObjX, backgroundTerrain);
    const sprite = bgSpriteOptions[Math.floor(bgRng.next() * bgSpriteOptions.length)];

    // Vary scale by depth: higher Y (further back) = smaller, lower Y (closer) = bigger
    const depthFactor = (bgObjY - (CANVAS_HEIGHT - 250)) / 200; // 0 (far) to 1 (close)
    const scale = 0.8 + depthFactor * 2.0; // Far: 0.8-1.3x, Close: 2.0-2.8x

    // Vary opacity by depth: far objects more transparent
    const opacity = 0.15 + depthFactor * 0.25; // Far: 0.15-0.25, Close: 0.35-0.40

    entities.push(createDecoration(
      `bg-${i}`,
      bgObjX,
      bgObjY,
      sprite,
      scale,
      opacity
    ));
  }

  // Burn the same rng calls the original background loops made, so the
  // gameplay loop starts from the exact same rng state as before bgRng existed.
  // Terrain loop: 2 calls per segment (segmentWidth + Y). Objects: 4 per item at ORIGINAL density.
  {
    let burnX = 0;
    while (burnX < CANVAS_WIDTH) {
      burnX += 40 + rng.next() * 60;
      rng.next();
    }
    const originalBgCount = levelWidth / 200; // Original density, not new doubled density
    for (let i = 0; i < originalBgCount; i++) {
      rng.next(); rng.next(); rng.next(); rng.next();
    }
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