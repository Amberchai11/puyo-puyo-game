export type PuyoColor = 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'garbage' | null;

export interface Cell {
  color: PuyoColor;
  popping: boolean;
}

export type Board = Cell[][];

export interface Point {
  x: number;
  y: number;
}

export interface PuyoPair {
  main: PuyoColor;
  sub: PuyoColor;
  pos: Point;
  rotation: 0 | 1 | 2 | 3; // 0=up, 1=right, 2=down, 3=left
}

export interface GameState {
  board: Board;
  current: PuyoPair | null;
  next: [PuyoColor, PuyoColor];
  nextNext: [PuyoColor, PuyoColor];
  score: number;
  level: number;
  chains: number;
  maxChains: number;
  linesCleared: number;
  phase: 'idle' | 'falling' | 'locking' | 'popping' | 'dropping' | 'gameover';
  popCells: Point[];
  chainCount: number;
}

export const BOARD_WIDTH = 6;
export const BOARD_HEIGHT = 13;
export const VISIBLE_HEIGHT = 12;
export const COLORS: PuyoColor[] = ['red', 'green', 'blue', 'yellow', 'purple'];
