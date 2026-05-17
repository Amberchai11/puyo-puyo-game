import { useGame } from './hooks/useGame';
import { useInput } from './hooks/useInput';
import { Board } from './components/Board';
import { NextPanel } from './components/NextPanel';
import { ScorePanel } from './components/ScorePanel';
import { Overlay } from './components/Overlay';

export default function App() {
  const game = useGame();
  const { state, start, reset } = game;

  useInput({
    moveLeft: game.moveLeft,
    moveRight: game.moveRight,
    moveDown: game.moveDown,
    hardDrop: game.hardDrop,
    rotateCW: game.rotateCW,
    rotateCCW: game.rotateCCW,
    start,
    reset,
    phase: state.phase,
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at center, #0f0f2e 0%, #060614 70%)',
      }}
    >
      <div className="relative flex items-start gap-4">
        {/* Left panel */}
        <div className="flex flex-col gap-4 pt-2">
          <ScorePanel
            score={state.score}
            level={state.level}
            chains={state.chains}
            maxChains={state.maxChains}
            chainCount={state.chainCount}
          />
        </div>

        {/* Game board */}
        <div className="relative">
          <Board gameState={state} />
          <Overlay phase={state.phase} score={state.score} onStart={start} />
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4 pt-2">
          <NextPanel label="Next" colors={state.next} size={40} />
          <NextPanel label="After" colors={state.nextNext} size={30} />

          <button
            onClick={reset}
            className="mt-4 px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase text-indigo-300/60 hover:text-indigo-300 transition-colors cursor-pointer"
            style={{ border: '1px solid rgba(99,102,241,0.2)' }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
