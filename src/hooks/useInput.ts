import { useEffect, useRef } from 'react';

interface Controls {
  moveLeft: () => void;
  moveRight: () => void;
  moveDown: () => void;
  hardDrop: () => void;
  rotateCW: () => void;
  rotateCCW: () => void;
  start: () => void;
  reset: () => void;
  phase: string;
}

export function useInput(controls: Controls) {
  const { moveLeft, moveRight, moveDown, hardDrop, rotateCW, rotateCCW, start, reset, phase } = controls;
  const held = useRef<Record<string, ReturnType<typeof setTimeout> | undefined>>({});

  useEffect(() => {
    const DAS_DELAY = 150;
    const DAS_INTERVAL = 50;

    function handleKey(e: KeyboardEvent) {
      if (e.repeat) return;

      if ((phase === 'idle' || phase === 'gameover') && (e.code === 'Enter' || e.code === 'Space')) {
        start();
        return;
      }

      if (phase !== 'falling') return;

      const startRepeat = (fn: () => void) => {
        fn();
        const t = setTimeout(() => {
          const interval = setInterval(fn, DAS_INTERVAL);
          held.current[e.code] = interval;
        }, DAS_DELAY);
        held.current[e.code] = t;
      };

      switch (e.code) {
        case 'ArrowLeft': startRepeat(moveLeft); break;
        case 'ArrowRight': startRepeat(moveRight); break;
        case 'ArrowDown': startRepeat(moveDown); break;
        case 'ArrowUp':
        case 'Space': hardDrop(); break;
        case 'KeyZ': rotateCCW(); break;
        case 'KeyX':
        case 'KeyC': rotateCW(); break;
        case 'Escape': reset(); break;
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (held.current[e.code] != null) {
        clearTimeout(held.current[e.code]);
        clearInterval(held.current[e.code]);
        held.current[e.code] = undefined;
      }
    }

    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [phase, moveLeft, moveRight, moveDown, hardDrop, rotateCW, rotateCCW, start, reset]);
}
