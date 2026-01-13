import React, { useState } from 'react';

interface GameBoyControlsProps {
  onLeftPress: () => void;
  onLeftRelease: () => void;
  onRightPress: () => void;
  onRightRelease: () => void;
  onAPress: () => void;
  onARelease: () => void;
  onMuteToggle?: () => void;
  isMuted?: boolean;
}

const GameBoyControls: React.FC<GameBoyControlsProps> = ({
  onLeftPress,
  onLeftRelease,
  onRightPress,
  onRightRelease,
  onAPress,
  onARelease,
  onMuteToggle,
  isMuted = false,
}) => {
  const [leftPressed, setLeftPressed] = useState(false);
  const [rightPressed, setRightPressed] = useState(false);
  const [aPressed, setAPressed] = useState(false);

  // Handle touch events to prevent default scrolling and handle press/release
  const handleTouchStart = (e: React.TouchEvent, callback: () => void, setPressed: (val: boolean) => void) => {
    e.preventDefault();
    setPressed(true);
    callback();
  };

  const handleTouchEnd = (e: React.TouchEvent, callback: () => void, setPressed: (val: boolean) => void) => {
    e.preventDefault();
    setPressed(false);
    callback();
  };

  return (
    <div className="flex items-center justify-between w-full px-4 sm:px-6">
      {/* D-Pad (Cross-shaped with left/right only) - Positioned on the left */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center flex-shrink-0">
        {/* D-Pad Base - Cross shape (background) */}
        <div 
          className="absolute inset-0 bg-gray-700"
          style={{
            clipPath: 'polygon(30% 0%, 70% 0%, 70% 30%, 100% 30%, 100% 70%, 70% 70%, 70% 100%, 30% 100%, 30% 70%, 0% 70%, 0% 30%, 30% 30%)',
            borderRadius: '0.5rem',
            boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.2)'
          }}
        />
        
        {/* Left Arrow Button - Larger for easier tapping */}
        <button
          onTouchStart={(e) => handleTouchStart(e, onLeftPress, setLeftPressed)}
          onTouchEnd={(e) => handleTouchEnd(e, onLeftRelease, setLeftPressed)}
          onMouseDown={() => { setLeftPressed(true); onLeftPress(); }}
          onMouseUp={() => { setLeftPressed(false); onLeftRelease(); }}
          onMouseLeave={() => { setLeftPressed(false); onLeftRelease(); }}
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-gray-700 rounded-l flex items-center justify-center transition-all touch-manipulation ${
            leftPressed 
              ? 'shadow-[inset_0_-2px_0_rgba(0,0,0,0.5),inset_0_2px_0_rgba(255,255,255,0.1)] translate-y-0.5' 
              : 'shadow-[inset_0_-4px_0_rgba(0,0,0,0.5),inset_0_2px_0_rgba(255,255,255,0.2)]'
          }`}
          aria-label="Move Left"
        >
          <span className="text-2xl sm:text-3xl text-white">◀</span>
        </button>

        {/* Right Arrow Button - Larger for easier tapping */}
        <button
          onTouchStart={(e) => handleTouchStart(e, onRightPress, setRightPressed)}
          onTouchEnd={(e) => handleTouchEnd(e, onRightRelease, setRightPressed)}
          onMouseDown={() => { setRightPressed(true); onRightPress(); }}
          onMouseUp={() => { setRightPressed(false); onRightRelease(); }}
          onMouseLeave={() => { setRightPressed(false); onRightRelease(); }}
          className={`absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-gray-700 rounded-r flex items-center justify-center transition-all touch-manipulation ${
            rightPressed 
              ? 'shadow-[inset_0_-2px_0_rgba(0,0,0,0.5),inset_0_2px_0_rgba(255,255,255,0.1)] translate-y-0.5' 
              : 'shadow-[inset_0_-4px_0_rgba(0,0,0,0.5),inset_0_2px_0_rgba(255,255,255,0.2)]'
          }`}
          aria-label="Move Right"
        >
          <span className="text-2xl sm:text-3xl text-white">▶</span>
        </button>
      </div>

      {/* A Button (Red, positioned on the right) with Mute button underneath */}
      <div className="relative flex-shrink-0 flex flex-col items-center">
        <button
          onTouchStart={(e) => handleTouchStart(e, onAPress, setAPressed)}
          onTouchEnd={(e) => handleTouchEnd(e, onARelease, setAPressed)}
          onMouseDown={() => { setAPressed(true); onAPress(); }}
          onMouseUp={() => { setAPressed(false); onARelease(); }}
          onMouseLeave={() => { setAPressed(false); onARelease(); }}
          className={`relative w-20 h-20 sm:w-24 sm:h-24 bg-red-600 rounded-full shadow-[inset_0_-6px_0_rgba(0,0,0,0.5),inset_0_3px_0_rgba(255,255,255,0.3),0_0_20px_rgba(220,38,38,0.4)] transition-all touch-manipulation ${
            aPressed 
              ? 'shadow-[inset_0_-3px_0_rgba(0,0,0,0.5),inset_0_3px_0_rgba(255,255,255,0.2)] translate-y-1' 
              : ''
          }`}
          aria-label="Jump (A Button)"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-2xl sm:text-3xl tracking-wider">A</span>
          </div>
        </button>
        
        {/* Mute Button (Start/Select style) - positioned below A button */}
        {onMuteToggle && (
          <div className="mt-1 flex flex-col items-center gap-0.5">
            <button
              onClick={onMuteToggle}
              onTouchStart={(e) => e.preventDefault()}
              className="w-12 h-3 sm:w-14 sm:h-4 bg-black rounded shadow-[inset_0_-2px_0_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)] active:shadow-[inset_0_-1px_0_rgba(0,0,0,0.8)] active:translate-y-0.5 transition-all touch-manipulation"
              title={isMuted ? "Unmute" : "Mute"}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
            </button>
            <span className="text-gray-600 text-[0.5rem] sm:text-[0.6rem] font-mono uppercase tracking-wider">
              mute
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoyControls;
