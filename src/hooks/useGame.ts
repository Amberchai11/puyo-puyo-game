import { useReducer, useEffect, useRef, useCallback } from 'react';
import type { GameState } from '../engine/types';
import {
  createBoard, applyGravity, findGroups,
  findAdjacentGarbage, markPopping, clearPopping, placePuyo
} from '../engine/board';
import {
  createPair, movePair, rotatePair, dropPair, getSubPosition, randomColor
} from '../engine/piece';
import { calculateScore } from '../engine/scoring';

type Action =
  | { type: 'START' }
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'MOVE_DOWN' }
  | { type: 'HARD_DROP' }
  | { type: 'ROTATE_CW' }
  | { type: 'ROTATE_CCW' }
  | { type: 'TICK' }
  | { type: 'POP_TICK' }
  | { type: 'CLEAR_TICK' }
  | { type: 'GRAVITY_TICK' }
  | { type: 'RESET' };

function initialState(): GameState {
  return {
    board: createBoard(),
    current: null,
    next: [randomColor()!, randomColor()!],
    nextNext: [randomColor()!, randomColor()!],
    score: 0,
    level: 1,
    chains: 0,
    maxChains: 0,
    linesCleared: 0,
    phase: 'idle',
    popCells: [],
    chainCount: 0,
  };
}

function spawnPiece(state: GameState): GameState {
  const pair = createPair(state.next[0], state.next[1]);
  const sub = getSubPosition(pair);

  // Check game over
  if (
    (state.board[pair.pos.y]?.[pair.pos.x]?.color !== null) ||
    (sub.y >= 0 && state.board[sub.y]?.[sub.x]?.color !== null)
  ) {
    return { ...state, phase: 'gameover' };
  }

  return {
    ...state,
    current: pair,
    next: state.nextNext,
    nextNext: [randomColor()!, randomColor()!],
    phase: 'falling',
  };
}

function lockPiece(state: GameState): GameState {
  if (!state.current) return state;
  const { current } = state;
  const sub = getSubPosition(current);
  let board = placePuyo(state.board, current.pos.x, current.pos.y, current.main);
  board = placePuyo(board, sub.x, sub.y, current.sub);
  return { ...state, board, current: null, phase: 'dropping', chainCount: 0 };
}

function checkChains(state: GameState): GameState {
  const groups = findGroups(state.board);
  if (groups.length === 0) {
    return spawnPiece({ ...state, phase: 'idle' });
  }
  const allPopped = groups.flat();
  const garbage = findAdjacentGarbage(state.board, allPopped);
  const popCells = [...allPopped, ...garbage];
  const board = markPopping(state.board, popCells);

  const chainCount = state.chainCount + 1;
  const colorSet = new Set(allPopped.map(p => state.board[p.y][p.x].color));
  const groupSizes = groups.map(g => g.length);
  const points = calculateScore(chainCount, groupSizes, colorSet.size);

  const newChains = state.chains + 1;
  const newLevel = Math.min(15, Math.floor(newChains / 5) + 1);

  return {
    ...state,
    board,
    popCells,
    chainCount,
    score: state.score + points,
    chains: newChains,
    level: newLevel,
    linesCleared: state.linesCleared + allPopped.length,
    maxChains: Math.max(state.maxChains, chainCount),
    phase: 'popping',
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'RESET':
    case 'START': {
      const s = initialState();
      return spawnPiece({ ...s, phase: 'idle' });
    }

    case 'MOVE_LEFT': {
      if (!state.current || state.phase !== 'falling') return state;
      const moved = movePair(state.board, state.current, -1, 0);
      return moved ? { ...state, current: moved } : state;
    }

    case 'MOVE_RIGHT': {
      if (!state.current || state.phase !== 'falling') return state;
      const moved = movePair(state.board, state.current, 1, 0);
      return moved ? { ...state, current: moved } : state;
    }

    case 'MOVE_DOWN': {
      if (!state.current || state.phase !== 'falling') return state;
      const moved = movePair(state.board, state.current, 0, 1);
      if (moved) return { ...state, current: moved };
      return lockPiece(state);
    }

    case 'HARD_DROP': {
      if (!state.current || state.phase !== 'falling') return state;
      const dropped = dropPair(state.board, state.current);
      return lockPiece({ ...state, current: dropped });
    }

    case 'ROTATE_CW': {
      if (!state.current || state.phase !== 'falling') return state;
      return { ...state, current: rotatePair(state.board, state.current, 1) };
    }

    case 'ROTATE_CCW': {
      if (!state.current || state.phase !== 'falling') return state;
      return { ...state, current: rotatePair(state.board, state.current, -1) };
    }

    case 'TICK': {
      if (state.phase !== 'falling' || !state.current) return state;
      const moved = movePair(state.board, state.current, 0, 1);
      if (moved) return { ...state, current: moved };
      return lockPiece(state);
    }

    case 'GRAVITY_TICK': {
      if (state.phase !== 'dropping') return state;
      const { board, moved } = applyGravity(state.board);
      if (moved) return { ...state, board };
      return checkChains({ ...state, board });
    }

    case 'POP_TICK': {
      // Transition: clear popping cells
      if (state.phase !== 'popping') return state;
      const board = clearPopping(state.board);
      return { ...state, board, phase: 'dropping', popCells: [] };
    }

    case 'CLEAR_TICK': {
      // After gravity settles, check chains again
      return checkChains(state);
    }

    default:
      return state;
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const phaseRef = useRef(state.phase);
  phaseRef.current = state.phase;

  const dropInterval = Math.max(100, 800 - (state.level - 1) * 60);

  // Gravity tick
  useEffect(() => {
    if (state.phase !== 'falling') return;
    const id = setInterval(() => dispatch({ type: 'TICK' }), dropInterval);
    return () => clearInterval(id);
  }, [state.phase, dropInterval]);

  // Pop animation then clear
  useEffect(() => {
    if (state.phase !== 'popping') return;
    const id = setTimeout(() => dispatch({ type: 'POP_TICK' }), 500);
    return () => clearTimeout(id);
  }, [state.phase, state.chainCount]);

  // After clear, apply gravity
  useEffect(() => {
    if (state.phase !== 'dropping') return;
    const id = setInterval(() => dispatch({ type: 'GRAVITY_TICK' }), 60);
    return () => clearInterval(id);
  }, [state.phase, state.chainCount]);

  const moveLeft = useCallback(() => dispatch({ type: 'MOVE_LEFT' }), []);
  const moveRight = useCallback(() => dispatch({ type: 'MOVE_RIGHT' }), []);
  const moveDown = useCallback(() => dispatch({ type: 'MOVE_DOWN' }), []);
  const hardDrop = useCallback(() => dispatch({ type: 'HARD_DROP' }), []);
  const rotateCW = useCallback(() => dispatch({ type: 'ROTATE_CW' }), []);
  const rotateCCW = useCallback(() => dispatch({ type: 'ROTATE_CCW' }), []);
  const start = useCallback(() => dispatch({ type: 'START' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return { state, moveLeft, moveRight, moveDown, hardDrop, rotateCW, rotateCCW, start, reset };
}
