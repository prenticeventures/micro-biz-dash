import React, { useState, useEffect, useRef, useCallback } from 'react';

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

type ButtonType = 'left' | 'right' | 'a';

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
  const callbacksRef = useRef({
    onLeftPress,
    onLeftRelease,
    onRightPress,
    onRightRelease,
    onAPress,
    onARelease
  });
  const activePointersRef = useRef<Map<number, ButtonType>>(new Map());
  const pressedStateRef = useRef<Record<ButtonType, boolean>>({
    left: false,
    right: false,
    a: false
  });

  useEffect(() => {
    callbacksRef.current = {
      onLeftPress,
      onLeftRelease,
      onRightPress,
      onRightRelease,
      onAPress,
      onARelease
    };
  }, [onLeftPress, onLeftRelease, onRightPress, onRightRelease, onAPress, onARelease]);

  const pressButton = useCallback((buttonType: ButtonType) => {
    if (pressedStateRef.current[buttonType]) return;
    pressedStateRef.current[buttonType] = true;

    if (buttonType === 'left') {
      setLeftPressed(true);
      callbacksRef.current.onLeftPress();
    } else if (buttonType === 'right') {
      setRightPressed(true);
      callbacksRef.current.onRightPress();
    } else {
      setAPressed(true);
      callbacksRef.current.onAPress();
    }
  }, []);

  const releaseButton = useCallback((buttonType: ButtonType) => {
    if (!pressedStateRef.current[buttonType]) return;
    pressedStateRef.current[buttonType] = false;

    if (buttonType === 'left') {
      setLeftPressed(false);
      callbacksRef.current.onLeftRelease();
    } else if (buttonType === 'right') {
      setRightPressed(false);
      callbacksRef.current.onRightRelease();
    } else {
      setAPressed(false);
      callbacksRef.current.onARelease();
    }
  }, []);

  const releaseAllButtons = useCallback(() => {
    releaseButton('left');
    releaseButton('right');
    releaseButton('a');
    activePointersRef.current.clear();
  }, [releaseButton]);

  useEffect(() => {
    const handleGlobalPointerEnd = (e: PointerEvent) => {
      const activeButton = activePointersRef.current.get(e.pointerId);
      if (!activeButton) return;
      activePointersRef.current.delete(e.pointerId);
      releaseButton(activeButton);
    };

    const handleWindowBlur = () => {
      releaseAllButtons();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        releaseAllButtons();
      }
    };

    window.addEventListener('pointerup', handleGlobalPointerEnd);
    window.addEventListener('pointercancel', handleGlobalPointerEnd);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerEnd);
      window.removeEventListener('pointercancel', handleGlobalPointerEnd);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseAllButtons();
    };
  }, [releaseButton, releaseAllButtons]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>, buttonType: ButtonType) => {
    e.preventDefault();
    e.stopPropagation();
    activePointersRef.current.set(e.pointerId, buttonType);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pressButton(buttonType);
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const activeButton = activePointersRef.current.get(e.pointerId);
    if (!activeButton) return;
    activePointersRef.current.delete(e.pointerId);
    releaseButton(activeButton);
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    }
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
          onPointerDown={(e) => handlePointerDown(e, 'left')}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-gray-700 rounded-l flex items-center justify-center transition-all touch-none ${
            leftPressed 
              ? 'shadow-[inset_0_-2px_0_rgba(0,0,0,0.5),inset_0_2px_0_rgba(255,255,255,0.1)] scale-95' 
              : 'shadow-[inset_0_-4px_0_rgba(0,0,0,0.5),inset_0_2px_0_rgba(255,255,255,0.2)]'
          }`}
          aria-label="Move Left"
        >
          <span className="text-2xl sm:text-3xl text-white">◀</span>
        </button>

        {/* Right Arrow Button - Larger for easier tapping */}
        <button
          onPointerDown={(e) => handlePointerDown(e, 'right')}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          className={`absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-gray-700 rounded-r flex items-center justify-center transition-all touch-none ${
            rightPressed 
              ? 'shadow-[inset_0_-2px_0_rgba(0,0,0,0.5),inset_0_2px_0_rgba(255,255,255,0.1)] scale-95' 
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
          onPointerDown={(e) => handlePointerDown(e, 'a')}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          className={`relative w-20 h-20 sm:w-24 sm:h-24 bg-red-600 rounded-full shadow-[inset_0_-6px_0_rgba(0,0,0,0.5),inset_0_3px_0_rgba(255,255,255,0.3),0_0_20px_rgba(220,38,38,0.4)] transition-all touch-none ${
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
              className="w-12 h-3 sm:w-14 sm:h-4 bg-black rounded shadow-[inset_0_-2px_0_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)] active:shadow-[inset_0_-1px_0_rgba(0,0,0,0.8)] active:translate-y-0.5 transition-all touch-none"
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
