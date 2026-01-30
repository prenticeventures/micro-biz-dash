import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import GameBoyControls from './components/GameBoyControls';
import VictoryCelebration from './components/VictoryCelebration';
import { AuthScreen } from './src/components/AuthScreen';
import { getCurrentUser, signOut } from './src/services/authService';
import { saveGameState, loadGameState, startNewGame, completeGameSession } from './src/services/gameStateService';
import { updateUserStats } from './src/services/statsService';
import { getLeaderboard, subscribeToLeaderboard } from './src/services/statsService';
import type { UserProfile } from './src/types/database';
import type { GameSession, LeaderboardEntry } from './src/types/database';
import { GameStatus } from './types';
import { SPRITES, RESEARCH_SNIPPETS } from './constants';
import { RetroAudio } from './utils/retroAudio';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [health, setHealth] = useState<number>(3);
  const [lives, setLives] = useState<number>(3); // Lives counter (separate from health)
  const [message, setMessage] = useState<string>("");
  const [nextLevelDesc, setNextLevelDesc] = useState<string>("");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Guest mode state - for playing level 1 without login
  const [showSignupPrompt, setShowSignupPrompt] = useState<boolean>(false);
  const [guestScore, setGuestScore] = useState<number>(0); // Store score from level 1 to save after signup
  
  // Backend integration state
  const [savedGame, setSavedGame] = useState<GameSession | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [hasCheckedSavedGame, setHasCheckedSavedGame] = useState(false);
  const gameStartTimeRef = useRef<number>(0);
  const lastSaveTimeRef = useRef<number>(0);
  
  // Touch control state
  const [touchLeftPressed, setTouchLeftPressed] = useState<boolean>(false);
  const [touchRightPressed, setTouchRightPressed] = useState<boolean>(false);
  const [touchJumpPressed, setTouchJumpPressed] = useState<boolean>(false);
  
  // Audio Manager Ref
  const audioRef = useRef<RetroAudio | null>(null);

  // Check authentication silently on mount (don't block the app)
  useEffect(() => {
    getCurrentUser().then(async (currentUser) => {
      setUser(currentUser);
      setIsCheckingAuth(false);
      
      // Load saved game and leaderboard if user is authenticated
      if (currentUser) {
        const saved = await loadGameState();
        setSavedGame(saved);
        setHasCheckedSavedGame(true);
        
        // Load leaderboard
        const leaderboardData = await getLeaderboard();
        setLeaderboard(leaderboardData);
        
        // Subscribe to leaderboard updates
        const unsubscribe = subscribeToLeaderboard((entries) => {
          setLeaderboard(entries);
        });
        
        return () => {
          unsubscribe();
        };
      } else {
        // Guest user - mark as checked so menu shows correctly
        setHasCheckedSavedGame(true);
      }
    });
  }, []);

  useEffect(() => {
    // Initialize Audio Manager once - guard against React Strict Mode double-initialization
    if (!audioRef.current) {
      audioRef.current = new RetroAudio();
      console.log('🎵 Audio Manager created');
    }
    return () => {
      console.log('🛑 Cleanup: Stopping BGM');
      audioRef.current?.stopBGM();
    }
  }, []);

  // Detect mobile device - prioritize user agent over touch capability
  // Many desktop browsers (especially Macs) falsely report touch capability
  useEffect(() => {
    let lastResult: boolean | null = null;
    
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
      
      // Mobile device patterns
      const isMobileUserAgent = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(userAgent);
      const hasMobileKeyword = /Mobile/i.test(userAgent);
      const hasMacKeyword = /Macintosh/i.test(userAgent);
      const hasWindowsDesktop = /Windows NT/i.test(userAgent);
      const hasLinuxDesktop = /Linux.*X11|X11.*Linux/i.test(userAgent);
      
      const isMobileBrowser = hasMobileKeyword && !hasWindowsDesktop && !hasLinuxDesktop;
      const isTablet = /iPad/i.test(userAgent) || 
                       (hasMacKeyword && navigator.maxTouchPoints > 1);
      
      const smallerDimension = Math.min(window.innerWidth, window.innerHeight);
      const isSmallScreen = smallerDimension <= 500 || window.innerWidth <= 768;
      
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;
      
      const isMobileDevice = isMobileUserAgent || 
                            isMobileBrowser || 
                            isTablet || 
                            (isSmallScreen && navigator.maxTouchPoints > 0 && !hasMacKeyword) ||
                            (isStandalone && navigator.maxTouchPoints > 0);
      
      // Only update state if value actually changed (prevents unnecessary re-renders)
      if (lastResult !== isMobileDevice) {
        lastResult = isMobileDevice;
        setIsMobile(isMobileDevice);
      }
    };
    
    // Check once on mount
    checkMobile();
    
    // Debounced resize handler to prevent spam
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 150);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', checkMobile);
    
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  useEffect(() => {
    // Sync mute state
    audioRef.current?.toggleMute(isMuted);
  }, [isMuted]);


  useEffect(() => {
    // Determine next level description for the completion screen
    const nextLvl = level + 1;
    if (nextLvl === 2) setNextLevelDesc(RESEARCH_SNIPPETS.LEVEL_2_DESC);
    else if (nextLvl === 3) setNextLevelDesc(RESEARCH_SNIPPETS.LEVEL_3_DESC);
    else if (nextLvl === 4) setNextLevelDesc(RESEARCH_SNIPPETS.LEVEL_4_DESC);
    else if (nextLvl === 5) setNextLevelDesc(RESEARCH_SNIPPETS.LEVEL_5_DESC);
    else setNextLevelDesc("Scale or Fail!");
  }, [level]);

  // Handle music state based on game status
  useEffect(() => {
    console.log('🎮 Game Status changed to:', status);
    // Stop music first to prevent double-starting
    audioRef.current?.stopBGM();
    
    if (status === GameStatus.PLAYING) {
      console.log('▶️ Starting BGM');
      // Small delay to ensure previous music is stopped
      const timer = setTimeout(() => {
        audioRef.current?.startBGM();
      }, 50);
      return () => clearTimeout(timer);
    }
    
    if (status === GameStatus.LEVEL_COMPLETE || status === GameStatus.VICTORY) {
        audioRef.current?.playWin();
    }
    if (status === GameStatus.GAME_OVER) {
        audioRef.current?.playDamage(); // Sad sound
    }
  }, [status]);

  // Handle victory separately to ensure it has access to current values
  useEffect(() => {
    if (status === GameStatus.VICTORY && user) {
      const handleVictoryAsync = async () => {
        // Complete the game session
        if (savedGame?.id) {
          await completeGameSession(savedGame.id);
        }
        
        // Update stats - game completed!
        const playtimeSeconds = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
        await updateUserStats(
          score,
          level,
          playtimeSeconds,
          score,
          true // game completed!
        );
        
        // Refresh leaderboard
        const leaderboardData = await getLeaderboard();
        setLeaderboard(leaderboardData);
      };
      
      handleVictoryAsync();
    }
  }, [status, user, score, level, savedGame]);

  // Auto-save game state periodically during gameplay
  useEffect(() => {
    if (status !== GameStatus.PLAYING || !user) return;
    
    const saveInterval = setInterval(() => {
      // Save every 10 seconds
      const now = Date.now();
      if (now - lastSaveTimeRef.current > 10000) {
        saveCurrentGameState();
      }
    }, 10000);
    
    return () => clearInterval(saveInterval);
  }, [status, user]);

  // Save game state when level completes or game over
  useEffect(() => {
    if (!user) return;
    
    if (status === GameStatus.LEVEL_COMPLETE || status === GameStatus.GAME_OVER) {
      saveCurrentGameState();
    }
  }, [status, user]);

  // Save game state helper
  const saveCurrentGameState = async (playerX: number = 50, playerY: number = 100) => {
    if (!user) return;
    
    try {
      const gameStateJson = JSON.stringify({
        level,
        score,
        health,
        playerX,
        playerY,
        timestamp: Date.now()
      });
      
      await saveGameState(
        level,
        score,
        health,
        playerX,
        playerY,
        gameStateJson
      );
      
      lastSaveTimeRef.current = Date.now();
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  };

  // Load saved game
  const handleResumeGame = async () => {
    if (!savedGame) return;
    
    try {
      setLevel(savedGame.level);
      setScore(savedGame.score);
      setHealth(savedGame.health);
      setLives(3); // Reset lives when resuming
      setStatus(GameStatus.PLAYING);
      setMessage("Game Resumed!");
      gameStartTimeRef.current = Date.now();
      
      // Pass player position to GameCanvas via a prop or state
      // For now, GameCanvas will use the saved position when level initializes
    } catch (error) {
      console.error('Failed to resume game:', error);
    }
  };

  // Start new game

  const handleStart = async () => {
    // Important: Resume AudioContext on user gesture
    audioRef.current?.init();
    
    // Start new game session in backend
    if (user) {
      await startNewGame();
      setSavedGame(null);
    }
    
    setLevel(1);
    setScore(0);
    setHealth(3);
    setLives(3); // Reset lives
    setStatus(GameStatus.PLAYING);
    setMessage("");
    gameStartTimeRef.current = Date.now();
  };

  const handleNextLevel = async () => {
    // If guest user completing level 1, show signup prompt instead
    if (!user && level === 1) {
      setGuestScore(score); // Save their score to restore after signup
      setShowSignupPrompt(true);
      return;
    }
    
    // Save game state before moving to next level
    if (user) {
      await saveCurrentGameState();
      
      // Update stats for completing this level
      const playtimeSeconds = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
      await updateUserStats(
        score,
        level,
        playtimeSeconds,
        score, // coins collected = score
        false // not game completed yet
      );
    }
    
    setLevel(l => l + 1);
    setHealth(3); // Reset health for new level
    setStatus(GameStatus.PLAYING);
    gameStartTimeRef.current = Date.now();
  };
  
  // Handle successful authentication from signup prompt
  const handleGuestAuthenticated = async (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    setShowSignupPrompt(false);
    
    // Save their level 1 score to the database
    try {
      await startNewGame();
      const playtimeSeconds = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
      await updateUserStats(
        guestScore,
        1, // level 1
        playtimeSeconds,
        guestScore,
        false
      );
    } catch (error) {
      console.error('Failed to save guest score:', error);
    }
    
    // Load leaderboard now that they're logged in
    const leaderboardData = await getLeaderboard();
    setLeaderboard(leaderboardData);
    
    // Subscribe to leaderboard updates
    subscribeToLeaderboard((entries) => {
      setLeaderboard(entries);
    });
    
    // Continue to level 2!
    setLevel(2);
    setHealth(3);
    setStatus(GameStatus.PLAYING);
    gameStartTimeRef.current = Date.now();
  };

  // Handle player death - use ref to prevent multiple calls
  const deathHandlingRef = useRef(false);
  
  const handleDeath = useCallback(() => {
    console.log('handleDeath called, current lives:', lives, 'deathHandlingRef:', deathHandlingRef.current);
    
    // Prevent multiple calls
    if (deathHandlingRef.current) {
      console.log('Death already being handled, ignoring');
      return;
    }
    deathHandlingRef.current = true;
    
    setLives((currentLives) => {
      const newLives = currentLives - 1;
      console.log('Setting new lives:', newLives, 'from', currentLives);
      
      if (newLives > 0) {
        // Still have lives - restart current level
        // Brief delay to ensure clean state reset and music stops
        setTimeout(() => {
          console.log('Restarting level, lives remaining:', newLives);
          setHealth(3);
          setStatus(GameStatus.PLAYING);
          setMessage(`Lives remaining: ${newLives}`);
          deathHandlingRef.current = false; // Reset flag after restart
        }, 300);
      } else {
        // No lives left - game over, restart from level 1
        console.log('No lives left, game over');
        setStatus(GameStatus.GAME_OVER);
        deathHandlingRef.current = false; // Reset flag
      }
      
      return newLives;
    });
  }, []);

  const handleRestart = async () => {
    // Save game over state
    if (user) {
      const playtimeSeconds = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
      await updateUserStats(
        score,
        level,
        playtimeSeconds,
        score,
        false
      );
    }
    
    // Reset everything - start from beginning
    setHealth(3);
    setLives(3);
    setScore(0);
    setLevel(1);
    setStatus(GameStatus.PLAYING);
    gameStartTimeRef.current = Date.now();
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const displayHealth = Math.max(0, Math.min(health, 3));

  const getGameOverText = () => {
    if (level === 1) return RESEARCH_SNIPPETS.DEATH_L1;
    if (level === 2) return RESEARCH_SNIPPETS.DEATH_L2;
    if (level === 3) return RESEARCH_SNIPPETS.DEATH_L3;
    if (level === 4) return RESEARCH_SNIPPETS.DEATH_L4;
    if (level === 5) return RESEARCH_SNIPPETS.DEATH_L5;
    return RESEARCH_SNIPPETS.DEFAULT_DEATH;
  };

  // Show loading screen only while checking auth (brief)
  if (isCheckingAuth) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-yellow-400 font-['Press_Start_2P']">Loading...</div>
      </div>
    );
  }

  // Show signup prompt when guest completes level 1
  if (showSignupPrompt) {
    return (
      <div className="min-h-[100dvh] w-screen bg-black overflow-y-auto py-4 px-4">
        <div className="bg-gray-800 border-4 border-yellow-400 rounded-lg p-4 sm:p-6 max-w-lg w-full mx-auto text-center">
          {/* Celebration Header - smaller on mobile */}
          <div className="mb-4">
            <h2 className="text-lg sm:text-2xl text-yellow-400 mb-1 font-['Press_Start_2P']">
              LEVEL 1 COMPLETE!
            </h2>
            <div className="text-2xl sm:text-4xl mb-1">🎉🚀🎉</div>
            <p className="text-green-400 font-bold text-sm sm:text-lg">Score: {guestScore} pts</p>
          </div>
          
          {/* Sign up prompt - more compact */}
          <div className="bg-black/50 p-3 rounded-lg mb-4 border border-gray-600">
            <p className="text-white text-xs sm:text-sm mb-1">
              Nice work, entrepreneur!
            </p>
            <p className="text-gray-300 text-[0.65rem] sm:text-xs">
              Create a free account to continue to Level 2 and save your progress!
            </p>
          </div>
          
          {/* Auth Screen embedded */}
          <AuthScreen 
            onAuthenticated={handleGuestAuthenticated}
            embedded={true}
          />
          
          {/* Option to restart as guest */}
          <button
            onClick={() => {
              setShowSignupPrompt(false);
              setLevel(1);
              setScore(0);
              setHealth(3);
              setLives(3);
              setStatus(GameStatus.MENU);
            }}
            className="mt-3 text-gray-400 hover:text-white text-xs underline"
          >
            No thanks, restart from Level 1
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'h-[100dvh]' : 'h-screen'} w-screen bg-black ${isMobile ? 'flex flex-col' : 'flex items-center justify-center'} ${isMobile ? '' : 'p-2 sm:p-4'} overflow-hidden font-sans select-none touch-none`}>
      
      {/* Retro TV/GameBoy Container */}
      <div className={`relative ${isMobile ? 'bg-gray-300' : 'bg-gray-300'} ${isMobile ? 'p-2' : 'p-3 sm:p-6 md:p-8'} ${isMobile ? 'rounded-[1rem]' : 'rounded-[2rem] sm:rounded-[2.5rem]'} shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_-4px_4px_rgba(255,255,255,0.1),inset_0_4px_10px_rgba(0,0,0,0.5)] border-b-4 sm:border-b-8 border-r-4 sm:border-r-8 ${isMobile ? 'border-gray-400' : 'border-gray-400'} w-full ${isMobile ? 'flex-1 flex flex-col min-h-0' : 'max-w-[min(900px,110vh)] flex flex-col shrink-0'}`}>
        
        {/* Screen Bezel - Takes exactly 2/3 of available space on mobile (accounting for container padding) */}
        <div className={`bg-black ${isMobile ? 'p-1.5' : 'p-2 sm:p-4'} ${isMobile ? 'rounded-xl' : 'rounded-[1.5rem] sm:rounded-[2rem]'} shadow-[inset_0_0_20px_rgba(0,0,0,1)] relative border-[2px] sm:border-[3px] border-neutral-700/50 ring-1 ring-white/5 ${isMobile ? 'flex-[2_1_0%] min-h-0' : 'flex-1 min-h-0'} flex flex-col`}>
           
           {/* The Screen Itself */}
           <div className={`relative ${isMobile ? 'w-full flex-1 min-h-0' : 'aspect-[4/3] w-full'} overflow-hidden ${isMobile ? 'rounded-md' : 'rounded-lg sm:rounded-xl'} shadow-inner bg-black flex flex-col mx-auto`}>
              
              {/* HUD */}
              <div className="bg-[#333] text-white p-2 border-b-2 sm:border-b-4 border-black font-mono text-[0.6rem] sm:text-sm flex justify-between items-center z-10 shrink-0 relative h-7 sm:h-10">
                <div className="flex gap-2 sm:gap-4 items-center">
                  <span className="text-yellow-400 font-bold whitespace-nowrap">💰 {score}</span>
                  <span className="text-blue-300 font-bold whitespace-nowrap">LVL {level}</span>
                  <span className="text-red-400 font-bold whitespace-nowrap">LIVES: {lives}</span>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 text-orange-400 font-bold tracking-widest uppercase hidden sm:block animate-pulse truncate max-w-[40%]">
                  {message || "MICRO-BIZ DASH"}
                </div>
                <div className="flex gap-1">
                  <span>{"❤️".repeat(displayHealth)}</span>
                  <span className="opacity-30">{"❤️".repeat(3 - displayHealth)}</span>
                </div>
              </div>
              
              {/* Mobile Message */}
              {message && (
                <div className="sm:hidden absolute top-10 left-0 right-0 text-center z-20 pointer-events-none">
                  <span className="bg-black/80 text-orange-400 px-3 py-1 rounded text-[0.6rem] font-bold animate-bounce inline-block mt-2 border border-orange-500/50">
                    {message}
                  </span>
                </div>
              )}

              {/* Game Viewport */}
              <div className="relative flex-1 w-full bg-black overflow-hidden flex items-center justify-center min-h-0">
                <GameCanvas 
                  status={status}
                  setStatus={setStatus}
                  level={level}
                  setLevel={setLevel}
                  onScoreUpdate={setScore}
                  onHealthUpdate={setHealth}
                  onMessage={setMessage}
                  onDeath={handleDeath}
                  audioManager={audioRef.current}
                  touchLeftPressed={touchLeftPressed}
                  touchRightPressed={touchRightPressed}
                  touchJumpPressed={touchJumpPressed}
                />

                {/* Overlays */}
                {status === GameStatus.MENU && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-4 sm:p-6 text-center z-30">
                    <h1 className="text-xl sm:text-4xl lg:text-5xl text-yellow-400 mb-3 sm:mb-4 animate-bounce drop-shadow-[4px_4px_0_#d00] font-['Press_Start_2P'] leading-tight">
                      MICRO-BIZ DASH
                    </h1>
                    <p className="text-[0.6rem] sm:text-sm text-gray-300 mb-4 sm:mb-6 max-w-md leading-relaxed font-mono px-3 sm:px-4">
                      You are a solopreneur.<br/>
                      Battle red tape, inflation, and burnout.<br/>
                      Secure funding and customers!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-center justify-center">
                      <button 
                        onClick={handleStart}
                        className="px-6 sm:px-8 py-2 sm:py-3 bg-red-600 hover:bg-red-500 text-white text-xs sm:text-base font-bold rounded border-b-4 border-red-800 active:border-0 active:translate-y-1 transition-all whitespace-nowrap"
                      >
                        {user ? 'START GAME' : 'PLAY LEVEL 1 FREE'}
                      </button>
                      {/* Resume button only for logged-in users with saved games */}
                      {user && hasCheckedSavedGame && savedGame && savedGame.level > 1 && (
                        <button 
                          onClick={handleResumeGame}
                          className="px-6 sm:px-8 py-2 sm:py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-base font-bold rounded border-b-4 border-blue-800 active:border-0 active:translate-y-1 transition-all whitespace-nowrap"
                        >
                          RESUME GAME
                        </button>
                      )}
                    </div>
                    {/* Guest mode notice */}
                    {!user && (
                      <div className="mt-3 sm:mt-4 text-[0.55rem] sm:text-xs text-gray-400 font-mono">
                        Sign up after Level 1 to save progress & compete!
                      </div>
                    )}
                    {/* Leaderboard only for logged-in users */}
                    {user && leaderboard.length > 0 && (
                      <div className="mt-4 sm:mt-8 bg-black/60 p-3 sm:p-4 rounded border-2 border-yellow-400/50 max-w-md">
                        <h3 className="text-yellow-400 font-bold text-[0.65rem] sm:text-sm mb-1.5 sm:mb-2 font-['Press_Start_2P']">LEADERBOARD</h3>
                        <div className="space-y-1 text-[0.6rem] sm:text-xs font-mono">
                          {leaderboard.map((entry) => (
                            <div key={entry.user_id} className="flex justify-between">
                              <span className={entry.user_id === user?.id ? 'text-yellow-400 font-bold' : ''}>
                                #{entry.rank} {entry.game_name}
                              </span>
                              <span className={entry.user_id === user?.id ? 'text-yellow-400 font-bold' : 'text-gray-300'}>
                                {entry.best_score} pts
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-4 sm:mt-8 flex gap-3 sm:gap-4 text-[0.55rem] sm:text-xs opacity-80 font-mono">
                      <span>Move: ⬅️ ➡️</span>
                      <span>Jump: SPACE / A</span>
                    </div>
                  </div>
                )}

                {status === GameStatus.LEVEL_COMPLETE && (
                  <div className="absolute inset-0 bg-[#4F90FF]/95 flex flex-col items-center justify-center text-white p-6 text-center z-30">
                    <h2 className="text-xl sm:text-4xl text-yellow-300 mb-4 drop-shadow-md">NICE QUARTER! 🚀</h2>
                    <div className="bg-black/40 p-4 rounded mb-6 backdrop-blur-sm border-2 border-white/20">
                      <p className="text-green-300 font-bold mb-2 text-[0.6rem] sm:text-xs uppercase tracking-wider">Next Challenge</p>
                      <p className="text-xs sm:text-base font-mono max-w-xs">{nextLevelDesc}</p>
                    </div>
                    <button 
                      onClick={handleNextLevel}
                      className="px-6 py-3 bg-green-600 hover:bg-green-500 text-xs sm:text-base font-bold rounded border-b-4 border-green-800 active:border-0 active:translate-y-1 shadow-lg"
                    >
                      NEXT LEVEL ➡️
                    </button>
                  </div>
                )}

                {status === GameStatus.GAME_OVER && (
                  <div className="absolute inset-0 bg-red-900/95 flex flex-col items-center justify-center text-white p-6 text-center z-30">
                    <h2 className="text-xl sm:text-4xl text-red-500 mb-4 drop-shadow-[2px_2px_0_#000]">
                      {getGameOverText()}
                    </h2>
                    <p className="text-sm sm:text-lg mb-2 font-mono font-bold">GAME OVER</p>
                    <p className="text-xs sm:text-sm mb-6 font-mono text-red-200">
                      You've used all 3 lives.<br/>
                      Starting over from Level 1...
                    </p>
                    <button 
                      onClick={handleRestart}
                      className="px-6 py-3 bg-white text-black text-xs sm:text-base font-bold rounded hover:bg-gray-200 border-b-4 border-gray-400 active:border-0 active:translate-y-1"
                    >
                      START OVER ↺
                    </button>
                  </div>
                )}

                {status === GameStatus.VICTORY && (
                  <VictoryCelebration 
                    onRestart={handleRestart}
                    score={score}
                  />
                )}
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10 pointer-events-none rounded-xl" />
           </div>
        </div>

        {/* TV Controls / Bottom Panel - Hidden on mobile, replaced by Game Boy controls */}
        {!isMobile && (
          <div className="mt-2 sm:mt-4 flex justify-between items-center px-2 sm:px-6">
              {/* Speakers */}
              <div className="flex gap-2 sm:gap-3">
                 <div className="space-y-1 sm:space-y-1.5 opacity-50">
                    <div className="w-8 sm:w-20 h-0.5 sm:h-1 bg-black rounded-full shadow-[0_1px_0_rgba(255,255,255,0.1)]"></div>
                    <div className="w-8 sm:w-20 h-0.5 sm:h-1 bg-black rounded-full shadow-[0_1px_0_rgba(255,255,255,0.1)]"></div>
                    <div className="w-8 sm:w-20 h-0.5 sm:h-1 bg-black rounded-full shadow-[0_1px_0_rgba(255,255,255,0.1)]"></div>
                 </div>
              </div>
              
              {/* Branding */}
              <div className="text-neutral-500 font-bold font-mono tracking-[0.1em] sm:tracking-[0.2em] text-[0.6rem] sm:text-lg drop-shadow-[0_1px_0_rgba(255,255,255,0.1)]">
                 SOLO-SYSTEM 64
              </div>

              {/* Controls: Volume & Power */}
              <div className="flex items-center gap-4 sm:gap-6">
                  
                  {/* Volume Toggle */}
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
                    className="group flex flex-col items-center gap-1 focus:outline-none"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-neutral-600 flex items-center justify-center shadow-inner transition-colors ${isMuted ? 'bg-neutral-700' : 'bg-green-900'}`}>
                      <span className="text-[10px] sm:text-xs">
                        {isMuted ? '🔇' : '🔊'}
                      </span>
                    </div>
                    <span className="text-neutral-600 text-[0.4rem] sm:text-[0.6rem] font-bold uppercase tracking-wider">Vol</span>
                  </button>

                  {/* Power */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 sm:w-4 sm:h-4 bg-red-600 rounded-full shadow-[0_0_10px_#f00] animate-pulse relative">
                      <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-20"></div>
                    </div>
                    <div className="text-neutral-600 text-[0.5rem] sm:text-xs font-bold uppercase tracking-wider">Power</div>
                  </div>
              </div>
          </div>
        )}

        {/* Game Boy Controls - Mobile Only - Takes exactly 1/3 of space */}
        {isMobile && (
          <div className="flex flex-col items-center justify-center shrink-0 flex-[1_1_0%] min-h-0 w-full">
            <GameBoyControls
              onLeftPress={() => setTouchLeftPressed(true)}
              onLeftRelease={() => setTouchLeftPressed(false)}
              onRightPress={() => setTouchRightPressed(true)}
              onRightRelease={() => setTouchRightPressed(false)}
              onAPress={() => setTouchJumpPressed(true)}
              onARelease={() => setTouchJumpPressed(false)}
              onMuteToggle={() => setIsMuted(!isMuted)}
              isMuted={isMuted}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
