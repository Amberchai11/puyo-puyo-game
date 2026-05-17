import type { Board, Cell, PuyoColor, Point } from './types';
import { BOARD_WIDTH, BOARD_HEIGHT } from './types';

export function createBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, (): Cell => ({ color: null, popping: false }))
  );
}

export function cloneBoard(board: Board): Board {
  return board.map(row => row.map(cell => ({ ...cell })));
}

export function isValidPosition(board: Board, x: number, y: number): boolean {
  if (x < 0 || x >= BOARD_WIDTH) return false;
  if (y >= BOARD_HEIGHT) return false;
  if (y < 0) return true; // above board is valid
  return board[y][x].color === null;
}

export function placePuyo(board: Board, x: number, y: number, color: PuyoColor): Board {
  if (y < 0 || y >= BOARD_HEIGHT || x < 0 || x >= BOARD_WIDTH) return board;
  const next = cloneBoard(board);
  next[y][x] = { color, popping: false };
  return next;
}

export function applyGravity(board: Board): { board: Board; moved: boolean } {
  const next = cloneBoard(board);
  let moved = false;
  for (let x = 0; x < BOARD_WIDTH; x++) {
    for (let y = BOARD_HEIGHT - 2; y >= 0; y--) {
      if (next[y][x].color !== null && next[y + 1][x].color === null) {
        let dropY = y;
        while (dropY + 1 < BOARD_HEIGHT && next[dropY + 1][x].color === null) {
          dropY++;
        }
        next[dropY][x] = { ...next[y][x] };
        next[y][x] = { color: null, popping: false };
        moved = true;
      }
    }
  }
  return { board: next, moved };
}

function floodFill(board: Board, x: number, y: number, color: PuyoColor, visited: boolean[][]): Point[] {
  if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT) return [];
  if (visited[y][x] || board[y][x].color !== color) return [];
  visited[y][x] = true;
  const group: Point[] = [{ x, y }];
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    group.push(...floodFill(board, x + dx, y + dy, color, visited));
  }
  return group;
}

export function findGroups(board: Board): Point[][] {
  const visited = Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(false));
  const groups: Point[][] = [];
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const color = board[y][x].color;
      if (color && color !== 'garbage' && !visited[y][x]) {
        const group = floodFill(board, x, y, color, visited);
        if (group.length >= 4) groups.push(group);
      }
    }
  }
  return groups;
}

export function findAdjacentGarbage(board: Board, poppedCells: Point[]): Point[] {
  const poppedSet = new Set(poppedCells.map(p => `${p.x},${p.y}`));
  const garbage = new Set<string>();
  for (const { x, y } of poppedCells) {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < BOARD_WIDTH && ny >= 0 && ny < BOARD_HEIGHT) {
        if (board[ny][nx].color === 'garbage' && !poppedSet.has(`${nx},${ny}`)) {
          garbage.add(`${nx},${ny}`);
        }
      }
    }
  }
  return Array.from(garbage).map(k => {
    const [gx, gy] = k.split(',').map(Number);
    return { x: gx, y: gy };
  });
}

export function markPopping(board: Board, cells: Point[]): Board {
  const next = cloneBoard(board);
  for (const { x, y } of cells) {
    next[y][x] = { ...next[y][x], popping: true };
  }
  return next;
}

export function clearPopping(board: Board): Board {
  const next = cloneBoard(board);
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (next[y][x].popping) next[y][x] = { color: null, popping: false };
    }
  }
  return next;
}
