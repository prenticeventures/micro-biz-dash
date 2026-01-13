import React, { useState, useEffect, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import GameBoyControls from './components/GameBoyControls';
import { GameStatus } from './types';
import { SPRITES, RESEARCH_SNIPPETS } from './constants';
import { RetroAudio } from './utils/retroAudio';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [health, setHealth] = useState<number>(3);
  const [message, setMessage] = useState<string>("");
  const [nextLevelDesc, setNextLevelDesc] = useState<string>("");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Touch control state
  const [touchLeftPressed, setTouchLeftPressed] = useState<boolean>(false);
  const [touchRightPressed, setTouchRightPressed] = useState<boolean>(false);
  const [touchJumpPressed, setTouchJumpPressed] = useState<boolean>(false);
  
  // Audio Manager Ref
  const audioRef = useRef<RetroAudio | null>(null);

  useEffect(() => {
    // Initialize Audio Manager once
    audioRef.current = new RetroAudio();
    return () => {
      audioRef.current?.stopBGM();
    }
  }, []);

  // Detect mobile device - simplified and more aggressive
  useEffect(() => {
    const checkMobile = () => {
      // Check user agent
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
      const isMobileUserAgent = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS|EdgiOS/i.test(userAgent);
      
      // Check for touch capability - primary indicator for mobile
      const hasTouch = 'ontouchstart' in window || 
                       (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || 
                       ((navigator as any).msMaxTouchPoints && (navigator as any).msMaxTouchPoints > 0);
      
      // Check screen size
      const isSmallScreen = window.innerWidth <= 1024;
      
      // Simplified: prioritize touch capability - if it has touch, it's mobile
      // Also check user agent as backup
      // Screen size is less important since modern phones can have large screens
      const isMobileDevice = hasTouch || isMobileUserAgent || isSmallScreen;
      
      // Debug logging
      console.log('Mobile Detection Debug:', {
        userAgent: userAgent.substring(0, 100),
        isMobileUserAgent,
        hasTouch,
        isSmallScreen,
        windowWidth: window.innerWidth,
        maxTouchPoints: navigator.maxTouchPoints,
        isMobileDevice,
        result: isMobileDevice ? 'MOBILE' : 'DESKTOP'
      });
      
      setIsMobile(isMobileDevice);
    };
    
    // Check immediately
    checkMobile();
    
    // Also check on load
    if (document.readyState === 'complete') {
      checkMobile();
    } else {
      window.addEventListener('load', checkMobile);
    }
    
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);
    
    return () => {
      window.removeEventListener('load', checkMobile);
      window.removeEventListener('resize', checkMobile);
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
    if (status === GameStatus.PLAYING) {
      audioRef.current?.startBGM();
    } else {
      audioRef.current?.stopBGM();
    }
    
    if (status === GameStatus.LEVEL_COMPLETE || status === GameStatus.VICTORY) {
        audioRef.current?.playWin();
    }
    if (status === GameStatus.GAME_OVER) {
        audioRef.current?.playDamage(); // Sad sound
    }
  }, [status]);

  const handleStart = () => {
    // Important: Resume AudioContext on user gesture
    audioRef.current?.init();
    setStatus(GameStatus.PLAYING);
    setMessage("");
  };

  const handleNextLevel = () => {
    setLevel(l => l + 1);
    setStatus(GameStatus.PLAYING);
  };

  const handleRestart = () => {
    setHealth(3);
    setStatus(GameStatus.PLAYING);
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

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center p-2 sm:p-4 overflow-hidden font-sans select-none touch-none">
      
      {/* Retro TV/GameBoy Container */}
      <div className={`relative ${isMobile ? 'bg-gray-300' : 'bg-gray-300'} ${isMobile ? 'p-2' : 'p-3 sm:p-6 md:p-8'} ${isMobile ? 'rounded-[1rem]' : 'rounded-[2rem] sm:rounded-[2.5rem]'} shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_-4px_4px_rgba(255,255,255,0.1),inset_0_4px_10px_rgba(0,0,0,0.5)] border-b-4 sm:border-b-8 border-r-4 sm:border-r-8 ${isMobile ? 'border-gray-400' : 'border-gray-400'} w-full ${isMobile ? 'max-w-full max-h-full h-full flex flex-col' : 'max-w-[min(900px,110vh)]'} flex flex-col shrink-0`}>
        
        {/* Screen Bezel - Takes exactly 2/3 of space on mobile */}
        <div className={`bg-black ${isMobile ? 'p-1.5' : 'p-2 sm:p-4'} ${isMobile ? 'rounded-xl' : 'rounded-[1.5rem] sm:rounded-[2rem]'} shadow-[inset_0_0_20px_rgba(0,0,0,1)] relative border-[2px] sm:border-[3px] border-neutral-700/50 ring-1 ring-white/5 ${isMobile ? 'flex-[2_1_0%] min-h-0' : 'flex-1 min-h-0'} flex flex-col`}>
           
           {/* The Screen Itself */}
           <div className={`relative ${isMobile ? 'w-full flex-1 min-h-0' : 'aspect-[4/3] w-full'} overflow-hidden ${isMobile ? 'rounded-md' : 'rounded-lg sm:rounded-xl'} shadow-inner bg-black flex flex-col mx-auto`}>
              
              {/* HUD */}
              <div className="bg-[#333] text-white p-2 border-b-2 sm:border-b-4 border-black font-mono text-[0.6rem] sm:text-sm flex justify-between items-center z-10 shrink-0 relative h-7 sm:h-10">
                <div className="flex gap-2 sm:gap-4 items-center">
                  <span className="text-yellow-400 font-bold whitespace-nowrap">💰 {score}</span>
                  <span className="text-blue-300 font-bold whitespace-nowrap">LVL {level}</span>
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
                  audioManager={audioRef.current}
                  touchLeftPressed={touchLeftPressed}
                  touchRightPressed={touchRightPressed}
                  touchJumpPressed={touchJumpPressed}
                />

                {/* Overlays */}
                {status === GameStatus.MENU && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-6 text-center z-30">
                    <h1 className="text-xl sm:text-4xl lg:text-5xl text-yellow-400 mb-4 animate-bounce drop-shadow-[4px_4px_0_#d00] font-['Press_Start_2P'] leading-tight">
                      MICRO-BIZ DASH
                    </h1>
                    <p className="text-[0.65rem] sm:text-sm text-gray-300 mb-6 max-w-md leading-relaxed font-mono px-4">
                      You are a Solopreneur in 2026.<br/>
                      Battle Red Tape, Inflation, and Burnout.<br/>
                      Secure funding and customers!
                    </p>
                    <button 
                      onClick={handleStart}
                      className="px-6 sm:px-8 py-2 sm:py-3 bg-red-600 hover:bg-red-500 text-white text-xs sm:text-base font-bold rounded border-b-4 border-red-800 active:border-0 active:translate-y-1 transition-all"
                    >
                      START GAME
                    </button>
                    <div className="mt-8 flex gap-4 text-[0.6rem] sm:text-xs opacity-80 font-mono">
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
                    <p className="text-sm sm:text-lg mb-6 font-mono">GAME OVER</p>
                    <button 
                      onClick={handleRestart}
                      className="px-6 py-3 bg-white text-black text-xs sm:text-base font-bold rounded hover:bg-gray-200 border-b-4 border-gray-400 active:border-0 active:translate-y-1"
                    >
                      TRY AGAIN ↺
                    </button>
                  </div>
                )}

                {status === GameStatus.VICTORY && (
                   <div className="absolute inset-0 bg-yellow-500/95 flex flex-col items-center justify-center text-white p-6 text-center z-30">
                   <h2 className="text-2xl sm:text-5xl text-white mb-4 drop-shadow-[2px_2px_0_#000] animate-pulse">IPO SUCCESS! 🏆</h2>
                   <p className="text-black font-bold mb-6 text-xs sm:text-base font-mono">You survived the 2026 Economy!</p>
                   <button 
                     onClick={handleRestart}
                     className="px-6 py-3 bg-black text-yellow-400 text-xs sm:text-base font-bold rounded border-b-4 border-gray-700 active:border-0 active:translate-y-1"
                   >
                     NEW VENTURE ↺
                   </button>
                 </div>
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
