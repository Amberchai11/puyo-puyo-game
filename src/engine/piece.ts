import type { PuyoPair, PuyoColor, Board, Point } from './types';
import { COLORS } from './types';
import { isValidPosition } from './board';

export function randomColor(): PuyoColor {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function createPair(main?: PuyoColor, sub?: PuyoColor): PuyoPair {
  return {
    main: main ?? randomColor(),
    sub: sub ?? randomColor(),
    pos: { x: 2, y: 1 },
    rotation: 0,
  };
}

export function getSubPosition(pair: PuyoPair): Point {
  const { x, y } = pair.pos;
  switch (pair.rotation) {
    case 0: return { x, y: y - 1 };
    case 1: return { x: x + 1, y };
    case 2: return { x, y: y + 1 };
    case 3: return { x: x - 1, y };
  }
}

function canPlace(board: Board, pair: PuyoPair): boolean {
  const main = pair.pos;
  const sub = getSubPosition(pair);
  return isValidPosition(board, main.x, main.y) && isValidPosition(board, sub.x, sub.y);
}

export function movePair(board: Board, pair: PuyoPair, dx: number, dy: number): PuyoPair | null {
  const moved: PuyoPair = { ...pair, pos: { x: pair.pos.x + dx, y: pair.pos.y + dy } };
  return canPlace(board, moved) ? moved : null;
}

export function rotatePair(board: Board, pair: PuyoPair, dir: 1 | -1): PuyoPair {
  const newRot = ((pair.rotation + dir + 4) % 4) as 0 | 1 | 2 | 3;
  let rotated: PuyoPair = { ...pair, rotation: newRot };

  if (canPlace(board, rotated)) return rotated;

  // Wall kick attempts
  for (const dx of [-1, 1, -2, 2]) {
    const kicked: PuyoPair = { ...rotated, pos: { x: rotated.pos.x + dx, y: rotated.pos.y } };
    if (canPlace(board, kicked)) return kicked;
  }

  return pair; // rotation failed
}

export function dropPair(board: Board, pair: PuyoPair): PuyoPair {
  let current = pair;
  let next = movePair(board, current, 0, 1);
  while (next) {
    current = next;
    next = movePair(board, current, 0, 1);
  }
  return current;
}

export function getGhostPosition(board: Board, pair: PuyoPair): PuyoPair {
  return dropPair(board, pair);
}
