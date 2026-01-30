import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  GRAVITY, 
  JUMP_FORCE, 
  MOVE_SPEED, 
  FRICTION,
  SPRITES,
  COLORS,
  MAX_HEALTH,
  RESEARCH_SNIPPETS
} from '../constants';
import { 
  Entity, 
  EntityType, 
  GameStatus, 
  Player, 
  LevelData,
  Vector
} from '../types';
import { generateLevel } from '../utils/levelGenerator';
import { RetroAudio } from '../utils/retroAudio';

interface GameCanvasProps {
  status: GameStatus;
  setStatus: (s: GameStatus) => void;
  level: number;
  setLevel: (l: number) => void;
  onScoreUpdate: (score: number) => void;
  onHealthUpdate: (health: number) => void;
  onMessage: (msg: string) => void;
  onDeath?: () => void; // Callback when player dies
  audioManager: RetroAudio | null;
  // Touch control state (synced with keysRef)
  touchLeftPressed?: boolean;
  touchRightPressed?: boolean;
  touchJumpPressed?: boolean;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  status, 
  setStatus, 
  level, 
  setLevel,
  onScoreUpdate,
  onHealthUpdate,
  onMessage,
  onDeath,
  audioManager,
  touchLeftPressed = false,
  touchRightPressed = false,
  touchJumpPressed = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Game State Refs
  const playerRef = useRef<Player>({
    id: 'player',
    type: EntityType.PLAYER,
    pos: { x: 50, y: 100 },
    size: { width: 30, height: 45 }, 
    vel: { x: 0, y: 0 },
    color: COLORS.PROFIT_GREEN,
    label: SPRITES.PLAYER_HEAD,
    isGrounded: false,
    isInvincible: false,
    invincibleTimer: 0,
    health: MAX_HEALTH,
    capital: 0,
    direction: 1
  });
  
  const entitiesRef = useRef<Entity[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const cameraXRef = useRef<number>(0);
  const levelDataRef = useRef<LevelData | null>(null);
  const touchJumpHandledRef = useRef<boolean>(false);
  const deathHandledRef = useRef<boolean>(false); // Prevent multiple death calls

  // Initialize Level
  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      const data = generateLevel(level);
      levelDataRef.current = data;
      entitiesRef.current = data.entities;
      
      // Reset Player Position 
      playerRef.current.pos = { x: 50, y: 100 };
      playerRef.current.vel = { x: 0, y: 0 };
      playerRef.current.health = MAX_HEALTH;
      playerRef.current.isDead = false;
      cameraXRef.current = 0;
      touchJumpHandledRef.current = false;
      deathHandledRef.current = false; // Reset death flag when level starts
      
      onHealthUpdate(MAX_HEALTH);
    }
  }, [level, status, onHealthUpdate]); 

  // Input Handling - Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field (like signup form)
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      
      keysRef.current[e.code] = true;
      if (e.code === 'Space' && status === GameStatus.PLAYING) {
        if (playerRef.current.isGrounded) {
          playerRef.current.vel.y = JUMP_FORCE;
          playerRef.current.isGrounded = false;
          audioManager?.playJump();
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [status, audioManager]);

  // Input Handling - Touch Controls (handle jump on press)
  useEffect(() => {
    // Handle jump action when touch jump button is first pressed (not while held)
    if (touchJumpPressed && !touchJumpHandledRef.current && status === GameStatus.PLAYING) {
      if (playerRef.current.isGrounded) {
        playerRef.current.vel.y = JUMP_FORCE;
        playerRef.current.isGrounded = false;
        audioManager?.playJump();
      }
      touchJumpHandledRef.current = true;
    } else if (!touchJumpPressed) {
      // Reset when button is released
      touchJumpHandledRef.current = false;
    }
  }, [touchJumpPressed, status, audioManager]);

  // Physics & Logic
  const update = useCallback(() => {
    // Check status first - if not playing, don't update
    if (status !== GameStatus.PLAYING || !levelDataRef.current) return;
    
    // Also check death flag - if death already handled, don't continue
    if (deathHandledRef.current) return;

    const player = playerRef.current;
    
    // Gravity
    player.vel.y += GRAVITY;

    // Movement (keyboard or touch)
    if (keysRef.current['ArrowRight'] || keysRef.current['KeyD'] || touchRightPressed) {
      player.vel.x = MOVE_SPEED;
      player.direction = 1;
    } else if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA'] || touchLeftPressed) {
      player.vel.x = -MOVE_SPEED;
      player.direction = -1;
    } else {
      player.vel.x *= FRICTION;
    }

    // X Movement
    player.pos.x += player.vel.x;
    
    // X Collision
    entitiesRef.current.forEach(entity => {
      if (entity.type === EntityType.PLATFORM) {
        if (checkCollision(player, entity)) {
          if (player.vel.x > 0) player.pos.x = entity.pos.x - player.size.width;
          else if (player.vel.x < 0) player.pos.x = entity.pos.x + entity.size.width;
          player.vel.x = 0;
        }
      }
    });

    // Y Movement
    player.pos.y += player.vel.y;
    player.isGrounded = false;

    // Y Collision
    entitiesRef.current.forEach(entity => {
      if (entity.type === EntityType.PLATFORM) {
        if (checkCollision(player, entity)) {
          if (player.vel.y > 0 && player.pos.y < entity.pos.y + entity.size.height) {
            player.pos.y = entity.pos.y - player.size.height;
            player.vel.y = 0;
            player.isGrounded = true;
          } else if (player.vel.y < 0) {
            player.pos.y = entity.pos.y + entity.size.height;
            player.vel.y = 0;
          }
        }
      }
    });

    // Death (Falling) - counts as a death
    if (player.pos.y > CANVAS_HEIGHT && !deathHandledRef.current) {
      deathHandledRef.current = true; // Prevent multiple calls
      // Stop the game immediately
      setStatus(GameStatus.MENU);
      // Call death handler synchronously to ensure it executes
      if (onDeath) {
        try {
          onDeath();
        } catch (error) {
          console.error('Error in onDeath callback:', error);
          // Fallback to game over if callback fails
          setStatus(GameStatus.GAME_OVER);
        }
      } else {
        handleDamage(100); // Fallback if onDeath not provided
      }
      return; // Exit update immediately
    }

    // Entities
    entitiesRef.current.forEach(entity => {
      if (entity.type === EntityType.DECORATION) return;

      // Enemy Logic
      if (entity.type.startsWith('ENEMY_')) {
        // Patrol logic
        if (entity.patrolStart !== undefined && entity.patrolEnd !== undefined) {
           entity.pos.x += entity.vel.x;
           if (entity.pos.x > entity.patrolEnd || entity.pos.x < entity.patrolStart) {
             entity.vel.x *= -1;
           }
        }
        
        // Specific enemy behaviors
        if (entity.type === EntityType.ENEMY_SHADOW_IT) {
          entity.pos.y += Math.sin(Date.now() / 200) * 1.5; // Bobbing
        } else if (entity.type === EntityType.ENEMY_CHURN) {
           // Churn Vortex pulls slightly
           // Just a visual shake for now
           entity.pos.x += (Math.random() - 0.5) * 2;
        }

        if (!entity.isDead && checkCollision(player, entity)) {
           if (player.isInvincible) {
             entity.isDead = true;
             audioManager?.playCollect(); // Invincible kill sound
             onMessage(RESEARCH_SNIPPETS.AI_WIN);
           } else if (player.vel.y > 0 && player.pos.y < entity.pos.y) {
             entity.isDead = true;
             player.vel.y = JUMP_FORCE / 1.5;
             addCapital(100);
             audioManager?.playCollect(); // Kill sound
             onMessage("Problem Solved!");
           } else {
             handleDamage(1);
           }
        }
      } else if (!entity.isDead && checkCollision(player, entity)) {
        // Collectible Logic
        if (entity.type === EntityType.COLLECTIBLE_FUNDING) {
          entity.isDead = true;
          addCapital(1000);
          audioManager?.playCollect();
          onMessage(RESEARCH_SNIPPETS.MSG_FUNDING);
        } else if (entity.type === EntityType.COLLECTIBLE_DISTRIBUTION) {
          entity.isDead = true;
          addCapital(800);
          audioManager?.playCollect();
          onMessage(RESEARCH_SNIPPETS.MSG_DISTRIBUTION);
        } else if (entity.type === EntityType.COLLECTIBLE_TECH) {
          entity.isDead = true;
          addCapital(500); 
          audioManager?.playCollect();
          onMessage(RESEARCH_SNIPPETS.MSG_TECH);
        } else if (entity.type === EntityType.COLLECTIBLE_FINANCE) {
          entity.isDead = true;
          addCapital(1200);
          audioManager?.playCollect();
          onMessage(RESEARCH_SNIPPETS.MSG_FINANCE);
        } else if (entity.type === EntityType.COLLECTIBLE_RETENTION) {
          entity.isDead = true;
          addCapital(1500);
          audioManager?.playCollect();
          onMessage(RESEARCH_SNIPPETS.MSG_RETENTION);
        } else if (entity.type === EntityType.POWERUP_AI) {
          entity.isDead = true;
          activateInvincibility();
          audioManager?.playCollect();
          onMessage(RESEARCH_SNIPPETS.AI_WIN);
        } else if (entity.type === EntityType.POWERUP_REST) {
          entity.isDead = true;
          healPlayer();
          audioManager?.playCollect();
          onMessage("Restored! 🛌");
        } else if (entity.type === EntityType.GOAL) {
          handleLevelComplete();
        }
      }
    });

    entitiesRef.current = entitiesRef.current.filter(e => !e.isDead);

    if (player.isInvincible) {
      player.invincibleTimer--;
      if (player.invincibleTimer <= 0) player.isInvincible = false;
    }

    const targetCamX = player.pos.x - CANVAS_WIDTH / 3;
    cameraXRef.current = Math.max(0, Math.min(targetCamX, levelDataRef.current.width - CANVAS_WIDTH));

  }, [status, levelDataRef, audioManager, touchLeftPressed, touchRightPressed]);

  // --- Drawing Helpers ---

  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    // Sky Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    let colors = COLORS.SKY_LEVEL_1;
    if (level === 2) colors = COLORS.SKY_LEVEL_2;
    if (level === 3) colors = COLORS.SKY_LEVEL_3;
    if (level === 4) colors = COLORS.SKY_LEVEL_4;
    if (level === 5) colors = COLORS.SKY_LEVEL_5;
    
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(1, colors[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Matrix Rain Effect for Level 3
    if (level === 3) {
      ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
      ctx.font = '10px monospace';
      for(let i=0; i<20; i++) {
        ctx.fillText(Math.random() > 0.5 ? '1' : '0', Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT);
      }
    }

    // Static Terrain (Mountains/Cityscape)
    if (levelDataRef.current?.backgroundTerrain) {
      let tColor = 'rgba(34, 139, 34, 0.6)';
      if (level === 2) tColor = 'rgba(255, 140, 0, 0.3)'; // Orange haze
      if (level === 3) tColor = 'rgba(0, 50, 0, 0.8)';
      if (level === 4) tColor = 'rgba(100, 110, 120, 0.8)'; // Gray structures
      if (level === 5) tColor = 'rgba(50, 0, 0, 0.8)'; // Dark mountains
      
      ctx.fillStyle = tColor;
      ctx.beginPath();
      levelDataRef.current.backgroundTerrain.forEach((pt, i) => {
        // Simple Parallax
        const px = pt.x - (cameraXRef.current * 0.2); 
        if (i === 0) ctx.moveTo(px, pt.y);
        else ctx.lineTo(px, pt.y);
      });
      ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.lineTo(0, CANVAS_HEIGHT);
      ctx.fill();
    }
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, p: Player) => {
    if (p.isInvincible && Math.floor(Date.now() / 100) % 2 === 0) return;

    const { x, y } = p.pos;
    const { width, height } = p.size;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    ctx.save();
    ctx.translate(centerX, centerY);
    if (p.direction === -1) ctx.scale(-1, 1);

    const isMoving = Math.abs(p.vel.x) > 0.1;
    const animOffset = isMoving ? Math.sin(Date.now() / 100) * 0.3 : 0; 

    // 1. Back Leg
    ctx.save();
    ctx.translate(-4, 15);
    ctx.rotate(-animOffset);
    ctx.fillStyle = '#000'; 
    ctx.beginPath();
    ctx.roundRect(-3, 0, 6, 14, 3);
    ctx.fill();
    ctx.restore();

    // 2. Body (Dress/Shirt)
    ctx.fillStyle = COLORS.PLAYER_SUIT;
    ctx.beginPath();
    ctx.moveTo(-10, -5); 
    ctx.lineTo(10, -5);  
    ctx.lineTo(12, 16);  
    ctx.lineTo(-12, 16); 
    ctx.closePath();
    ctx.fill();

    // 3. Back Arm
    ctx.save();
    ctx.translate(8, -2);
    ctx.rotate(-animOffset * 2); 
    ctx.fillStyle = COLORS.PLAYER_SKIN;
    ctx.beginPath();
    ctx.roundRect(-3, 0, 6, 12, 3);
    ctx.fill();
    ctx.restore();

    // 4. Head
    ctx.font = '24px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(SPRITES.PLAYER_HEAD, 0, -2); 

    // 5. Front Leg
    ctx.save();
    ctx.translate(4, 15);
    ctx.rotate(animOffset);
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.roundRect(-3, 0, 6, 14, 3);
    ctx.fill();
    ctx.restore();
    
    // 6. Front Arm
    ctx.save();
    ctx.translate(-8, -2);
    ctx.rotate(animOffset * 2);
    ctx.fillStyle = COLORS.PLAYER_SKIN;
    ctx.beginPath();
    ctx.roundRect(-3, 0, 6, 12, 3);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  };

  const drawEntity = (ctx: CanvasRenderingContext2D, entity: Entity) => {
    if (entity.type === EntityType.PLATFORM) {
      // Dirt/Base
      ctx.fillStyle = entity.color;
      ctx.fillRect(entity.pos.x, entity.pos.y, entity.size.width, entity.size.height);
      
      // Top Layer logic
      let topColor = COLORS.PLATFORM_GRASS;
      if (level === 2) topColor = '#aaa'; 
      if (level === 3) topColor = '#003300';
      if (level === 4) topColor = '#fff'; // Marble top
      if (level === 5) topColor = '#800000'; // Magma top
      
      ctx.fillStyle = topColor;
      ctx.fillRect(entity.pos.x, entity.pos.y, entity.size.width, 8);
      
      // Border
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 2;
      ctx.strokeRect(entity.pos.x, entity.pos.y, entity.size.width, entity.size.height);
    } else if (entity.type === EntityType.DECORATION) {
      ctx.globalAlpha = entity.opacity || 1;
      ctx.font = `${30 * (entity.scale || 1)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(entity.label || '', entity.pos.x, entity.pos.y);
      ctx.globalAlpha = 1;
    } else {
      // Other Entities
      const size = entity.size.height;
      
      ctx.font = `${size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      ctx.save();
      const centerX = entity.pos.x + entity.size.width / 2;
      const centerY = entity.pos.y + entity.size.height / 2;
      
      ctx.translate(centerX, centerY);
      
      if (entity.vel.x < 0) ctx.scale(-1, 1);
      
      ctx.fillText(entity.label || '?', 0, 0);
      ctx.restore();
    }
  };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !levelDataRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawBackground(ctx);

    ctx.save();
    ctx.translate(-cameraXRef.current, 0);

    const decorations = entitiesRef.current.filter(e => e.type === EntityType.DECORATION);
    const platforms = entitiesRef.current.filter(e => e.type === EntityType.PLATFORM);
    const others = entitiesRef.current.filter(e => e.type !== EntityType.DECORATION && e.type !== EntityType.PLATFORM);

    decorations.forEach(e => drawEntity(ctx, e));
    platforms.forEach(e => drawEntity(ctx, e));
    others.forEach(e => drawEntity(ctx, e));

    drawPlayer(ctx, playerRef.current);

    ctx.restore();
  }, [level]); 

  const tick = useCallback(() => {
    update();
    render();
    requestRef.current = requestAnimationFrame(tick);
  }, [update, render]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(tick);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [tick]);

  // Helpers
  const handleDamage = (amount: number) => {
    if (playerRef.current.isInvincible || deathHandledRef.current) return;
    playerRef.current.health -= amount;
    onHealthUpdate(playerRef.current.health);
    if (playerRef.current.health <= 0) {
      // Health depleted - this counts as a death
      deathHandledRef.current = true; // Prevent multiple calls
      // Immediately stop the game loop
      setStatus(GameStatus.MENU);
      audioManager?.playDamage();
      if (onDeath) {
        try {
          onDeath(); // Use death handler instead of directly setting GAME_OVER
        } catch (error) {
          console.error('Error in onDeath callback:', error);
          setStatus(GameStatus.GAME_OVER); // Fallback
        }
      } else {
        setStatus(GameStatus.GAME_OVER); // Fallback
      }
    } else {
      // Just took damage, not dead yet
      playerRef.current.vel.y = JUMP_FORCE / 2;
      playerRef.current.vel.x = -10;
      playerRef.current.isInvincible = true;
      playerRef.current.invincibleTimer = 60;
      audioManager?.playDamage();
      onMessage(RESEARCH_SNIPPETS.BURNOUT);
    }
  };

  const addCapital = (amount: number) => {
    playerRef.current.capital += amount;
    onScoreUpdate(playerRef.current.capital);
  };

  const activateInvincibility = () => {
    playerRef.current.isInvincible = true;
    playerRef.current.invincibleTimer = 300;
  };

  const healPlayer = () => {
    playerRef.current.health = Math.min(playerRef.current.health + 1, MAX_HEALTH);
    onHealthUpdate(playerRef.current.health);
  };

  const handleLevelComplete = () => {
    if (level === 5) setStatus(GameStatus.VICTORY); // Max Level 5
    else setStatus(GameStatus.LEVEL_COMPLETE);
  };

  const checkCollision = (r1: Entity, r2: Entity) => {
    return (
      r1.pos.x < r2.pos.x + r2.size.width &&
      r1.pos.x + r1.size.width > r2.pos.x &&
      r1.pos.y < r2.pos.y + r2.size.height &&
      r1.pos.y + r1.size.height > r2.pos.y
    );
  };

  return (
    <canvas 
      ref={canvasRef} 
      width={CANVAS_WIDTH} 
      height={CANVAS_HEIGHT} 
      className="block bg-black shadow-2xl pixelated outline-none"
      style={{
        width: '100%',
        height: '100%', 
        objectFit: 'contain'
      }}
    />
  );
};

export default GameCanvas;