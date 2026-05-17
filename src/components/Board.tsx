import { BOARD_WIDTH, VISIBLE_HEIGHT } from '../engine/types';
import type { PuyoColor, GameState } from '../engine/types';
import { getSubPosition, getGhostPosition } from '../engine/piece';
import { PuyoCell } from './PuyoCell';

const CELL_SIZE = 48;

interface Props {
  gameState: GameState;
}

export function Board({ gameState }: Props) {
  const { board, current, phase } = gameState;

  // Build overlay: current piece and ghost
  const overlay: Record<string, { color: PuyoColor; ghost?: boolean; popping?: boolean }> = {};

  if (current && phase === 'falling') {
    const ghost = getGhostPosition(board, current);
    const ghostSub = getSubPosition(ghost);
    const mainSub = getSubPosition(current);

    // Ghost (only show if it's meaningfully below)
    const ghostMainY = ghost.pos.y;
    const ghostSubY = ghostSub.y;
    if (ghostMainY > current.pos.y || ghostSubY > mainSub.y) {
      overlay[`${ghost.pos.x},${ghostMainY}`] = { color: current.main, ghost: true };
      overlay[`${ghostSub.x},${ghostSubY}`] = { color: current.sub, ghost: true };
    }

    // Active piece
    overlay[`${current.pos.x},${current.pos.y}`] = { color: current.main };
    overlay[`${mainSub.x},${mainSub.y}`] = { color: current.sub };
  }

  // Row 0 (y=0 in board) is the hidden top row; VISIBLE_HEIGHT starts from y=1
  const startRow = 1;

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        width: CELL_SIZE * BOARD_WIDTH,
        height: CELL_SIZE * VISIBLE_HEIGHT,
        background: 'rgba(10, 12, 35, 0.95)',
        boxShadow: '0 0 40px rgba(99, 102, 241, 0.3), inset 0 0 60px rgba(0,0,0,0.5)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
      }}
    >
      {/* Grid lines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)
        `,
        backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
      }} />

      {/* Cells */}
      {Array.from({ length: VISIBLE_HEIGHT }, (_, visRow) => {
        const boardRow = visRow + startRow;
        return Array.from({ length: BOARD_WIDTH }, (_, col) => {
          const key = `${col},${boardRow}`;
          const cell = board[boardRow]?.[col];
          const over = overlay[key];
          const color = over?.color ?? cell?.color ?? null;
          const popping = cell?.popping ?? false;
          const ghost = over?.ghost ?? false;

          return (
            <div
              key={key}
              className="absolute flex items-center justify-center"
              style={{
                left: col * CELL_SIZE + 4,
                top: visRow * CELL_SIZE + 4,
                width: CELL_SIZE - 8,
                height: CELL_SIZE - 8,
              }}
            >
              <PuyoCell color={color} popping={popping} ghost={ghost} size={CELL_SIZE - 10} />
            </div>
          );
        });
      })}
    </div>
  );
}
