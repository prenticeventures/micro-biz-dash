import React, { useState, useEffect } from 'react';

interface VictoryCelebrationProps {
  onRestart: () => void;
  score: number;
}

// Money particle for the rain effect
interface MoneyParticle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  speed: number;
}

// Confetti particle
interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  speedX: number;
  speedY: number;
  size: number;
}

// Celebration stage enum
enum CelebrationStage {
  PLAYER_JUMP = 0,      // Player jumping/celebrating
  CONFETTI = 1,         // Confetti appears
  TEAM_JOINS = 2,       // Team members appear
  MONEY_RAIN = 3,       // Money starts falling
  FINAL_MESSAGE = 4     // Final message with button
}

const VictoryCelebration: React.FC<VictoryCelebrationProps> = ({ onRestart, score }) => {
  const [stage, setStage] = useState<CelebrationStage>(CelebrationStage.PLAYER_JUMP);
  const [playerJumpY, setPlayerJumpY] = useState<number>(0);
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
  const [moneyParticles, setMoneyParticles] = useState<MoneyParticle[]>([]);
  const [teamMembers, setTeamMembers] = useState<number>(0);
  const [showButton, setShowButton] = useState<boolean>(false);

  // Stage progression timing - slower, more detailed sequence
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Stage 1: Player jump (2.5 seconds - longer celebration)
    timers.push(setTimeout(() => {
      setStage(CelebrationStage.CONFETTI);
    }, 2500));

    // Stage 2: Confetti appears (3 seconds after stage 1)
    timers.push(setTimeout(() => {
      setStage(CelebrationStage.TEAM_JOINS);
    }, 5500));

    // Stage 3: Team joins (3 seconds after stage 2)
    timers.push(setTimeout(() => {
      setStage(CelebrationStage.MONEY_RAIN);
    }, 8500));

    // Stage 4: Money rain (4 seconds after stage 3)
    timers.push(setTimeout(() => {
      setStage(CelebrationStage.FINAL_MESSAGE);
      setShowButton(true);
    }, 12500));

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Player jump animation - slower, more dramatic
  useEffect(() => {
    if (stage === CelebrationStage.PLAYER_JUMP) {
      const interval = setInterval(() => {
        setPlayerJumpY(prev => {
          // Slower, more dramatic bounce animation
          const time = Date.now() / 300; // Slower (was 200)
          return Math.abs(Math.sin(time)) * 40; // Higher jump (was 30)
        });
      }, 16);
      return () => clearInterval(interval);
    }
  }, [stage]);

  // Generate confetti - slower, stays visible longer
  useEffect(() => {
    if (stage >= CelebrationStage.CONFETTI) {
      const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
      const newConfetti: ConfettiParticle[] = [];
      
      for (let i = 0; i < 50; i++) {
        newConfetti.push({
          id: i,
          x: Math.random() * 100,
          y: -10 - Math.random() * 20,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          speedX: (Math.random() - 0.5) * 1, // Much slower horizontal (was 2)
          speedY: 0.5 + Math.random() * 1, // Much slower fall (was 2-3)
          size: 8 + Math.random() * 12
        });
      }
      
      setConfetti(newConfetti);
      
      // Animate confetti - much slower, stays visible longer
      const interval = setInterval(() => {
        setConfetti(prev => prev.map(c => ({
          ...c,
          y: c.y + c.speedY * 0.5, // Even slower fall
          x: c.x + c.speedX * 0.5, // Even slower horizontal movement
          rotation: c.rotation + 1.5, // Much slower rotation (was 3)
          speedY: c.speedY + 0.03 // Much slower gravity (was 0.08)
        })).filter(c => c.y < 120)); // Remove only when well off screen (was 110)
      }, 16);
      
      return () => clearInterval(interval);
    }
  }, [stage]);

  // Generate money rain - much slower, only dollar bills, limit accumulation
  useEffect(() => {
    if (stage >= CelebrationStage.MONEY_RAIN) {
      const generateMoney = () => {
        const newMoney: MoneyParticle[] = [];
        for (let i = 0; i < 10; i++) { // Fewer at once (was 15)
          newMoney.push({
            id: Date.now() + Math.random() * 1000 + i, // Better unique IDs
            x: Math.random() * 100,
            y: -5 - Math.random() * 10,
            rotation: Math.random() * 360,
            speed: 0.2 + Math.random() * 0.4 // Much slower speed (was 0.3-1, now 0.2-0.6)
          });
        }
        setMoneyParticles(prev => {
          // Limit total particles to prevent crowding (max 100)
          const combined = [...prev, ...newMoney];
          return combined.slice(-100); // Keep only last 100 particles
        });
      };

      // Initial burst
      generateMoney();
      
      // Continue generating money - less frequently
      const interval = setInterval(generateMoney, 800); // Slower generation (was 500)
      
      // Animate money falling - much slower
      const animateInterval = setInterval(() => {
        setMoneyParticles(prev => prev.map(m => ({
          ...m,
          y: m.y + m.speed,
          rotation: m.rotation + 1, // Much slower rotation (was 2)
          speed: m.speed + 0.01 // Much slower gravity (was 0.02)
        })).filter(m => m.y < 120)); // Remove when well off screen (was 110)
      }, 16);

      return () => {
        clearInterval(interval);
        clearInterval(animateInterval);
      };
    }
  }, [stage]);

  // Team members appear - slower, more dramatic
  useEffect(() => {
    if (stage >= CelebrationStage.TEAM_JOINS) {
      const interval = setInterval(() => {
        setTeamMembers(prev => {
          if (prev < 5) return prev + 1;
          return prev;
        });
      }, 500); // Slower appearance (was 300ms)
      return () => clearInterval(interval);
    }
  }, [stage]);

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-500 flex flex-col items-center justify-center text-white p-6 text-center z-30 overflow-hidden">
      
      {/* Money Rain Effect */}
      {stage >= CelebrationStage.MONEY_RAIN && (
        <div className="absolute inset-0 pointer-events-none">
          {moneyParticles.map(m => (
            <div
              key={m.id}
              className="absolute text-2xl sm:text-4xl"
              style={{
                left: `${m.x}%`,
                top: `${m.y}%`,
                transform: `rotate(${m.rotation}deg)`,
                opacity: m.y > 0 && m.y < 100 ? 1 : 0
              }}
            >
              💵
            </div>
          ))}
        </div>
      )}

      {/* Confetti */}
      {stage >= CelebrationStage.CONFETTI && (
        <div className="absolute inset-0 pointer-events-none">
          {confetti.map(c => (
            <div
              key={c.id}
              className="absolute"
              style={{
                left: `${c.x}%`,
                top: `${c.y}%`,
                width: `${c.size}px`,
                height: `${c.size}px`,
                backgroundColor: c.color,
                transform: `rotate(${c.rotation}deg)`,
                opacity: c.y > 0 && c.y < 100 ? 0.8 : 0
              }}
            />
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center pb-8 sm:pb-12">
        
        {/* Player Character - Always visible, bounces during jump stage, then stays still */}
        <div 
          className="text-6xl sm:text-8xl mb-4 transition-transform duration-100"
          style={{ 
            transform: stage === CelebrationStage.PLAYER_JUMP 
              ? `translateY(-${playerJumpY}px)` 
              : 'translateY(0px)' 
          }}
        >
          👱‍♀️
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-5xl text-white mb-4 drop-shadow-[4px_4px_0_#000] animate-pulse font-['Press_Start_2P']">
          IPO SUCCESS! 🏆
        </h2>

        {/* Team Members */}
        {stage >= CelebrationStage.TEAM_JOINS && (
          <div className="flex gap-2 sm:gap-4 mb-4">
            {Array.from({ length: teamMembers }).map((_, i) => (
              <div 
                key={i}
                className="text-3xl sm:text-5xl animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {['👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🔬'][i % 5]}
              </div>
            ))}
          </div>
        )}

        {/* Final Valuation - Shows during money rain, then gets replaced by button */}
        {stage >= CelebrationStage.MONEY_RAIN && stage < CelebrationStage.FINAL_MESSAGE && (
          <div className="bg-black/60 p-4 rounded-lg mb-4 backdrop-blur-sm border-2 border-white/30">
            <p className="text-green-300 font-bold mb-2 text-xs sm:text-sm uppercase tracking-wider">
              Final Valuation
            </p>
            <p className="text-3xl sm:text-5xl font-bold text-yellow-300 font-mono animate-pulse">
              $$$$$$$$$$
            </p>
          </div>
        )}

        {/* Message */}
        <p className="text-black font-bold mb-6 text-xs sm:text-base font-mono max-w-md">
          {stage < CelebrationStage.FINAL_MESSAGE 
            ? "You survived the 2026 Economy!" 
            : "You built an empire! From solopreneur to IPO success!"}
        </p>

        {/* NEW VENTURE Button - Replaces Final Valuation in final stage */}
        {showButton && (
          <div className="bg-black/60 p-4 rounded-lg mb-4 backdrop-blur-sm border-2 border-white/30">
            <button 
              onClick={onRestart}
              className="px-6 py-3 bg-black text-yellow-400 text-xs sm:text-base font-bold rounded border-b-4 border-gray-700 active:border-0 active:translate-y-1 transition-all animate-bounce hover:bg-gray-900 w-full"
              style={{ animationIterationCount: 3 }}
            >
              NEW VENTURE ↺
            </button>
          </div>
        )}
      </div>

      {/* Balloons (appear with confetti) */}
      {stage >= CelebrationStage.CONFETTI && (
        <div className="absolute top-10 left-10 sm:left-20 text-4xl sm:text-6xl animate-bounce" style={{ animationDelay: '0.5s' }}>
          🎈
        </div>
      )}
      {stage >= CelebrationStage.CONFETTI && (
        <div className="absolute top-20 right-10 sm:right-20 text-4xl sm:text-6xl animate-bounce" style={{ animationDelay: '1s' }}>
          🎈
        </div>
      )}
      {stage >= CelebrationStage.CONFETTI && (
        <div className="absolute bottom-20 left-1/4 text-4xl sm:text-6xl animate-bounce" style={{ animationDelay: '1.5s' }}>
          🎈
        </div>
      )}
    </div>
  );
};

export default VictoryCelebration;
