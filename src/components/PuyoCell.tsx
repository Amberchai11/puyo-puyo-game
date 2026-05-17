import { motion, AnimatePresence } from 'framer-motion';
import type { PuyoColor } from '../engine/types';

const COLOR_MAP: Record<NonNullable<PuyoColor>, string> = {
  red: 'from-red-400 to-red-600',
  green: 'from-green-400 to-green-600',
  blue: 'from-blue-400 to-blue-600',
  yellow: 'from-yellow-300 to-yellow-500',
  purple: 'from-purple-400 to-purple-600',
  garbage: 'from-gray-300 to-gray-500',
};

const GLOW_MAP: Record<NonNullable<PuyoColor>, string> = {
  red: 'shadow-red-500/80',
  green: 'shadow-green-500/80',
  blue: 'shadow-blue-500/80',
  yellow: 'shadow-yellow-400/80',
  purple: 'shadow-purple-500/80',
  garbage: 'shadow-gray-400/80',
};

interface Props {
  color: PuyoColor;
  popping?: boolean;
  ghost?: boolean;
  size?: number;
}

export function PuyoCell({ color, popping, ghost, size = 48 }: Props) {
  if (!color) return <div style={{ width: size, height: size }} />;

  const gradient = COLOR_MAP[color];
  const glow = GLOW_MAP[color];

  return (
    <AnimatePresence>
      <motion.div
        key={color}
        className={`rounded-full bg-gradient-to-br ${gradient} shadow-lg ${glow} relative overflow-hidden select-none`}
        style={{
          width: size,
          height: size,
          opacity: ghost ? 0.3 : 1,
          border: ghost ? '2px dashed rgba(255,255,255,0.4)' : undefined,
        }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={
          popping
            ? { scale: [1, 1.4, 0], opacity: [1, 1, 0] }
            : { scale: 1, opacity: ghost ? 0.3 : 1 }
        }
        transition={popping ? { duration: 0.4, ease: 'easeOut' } : { duration: 0.12, ease: 'backOut' }}
      >
        {/* Shine */}
        {!ghost && (
          <div className="absolute top-1 left-1.5 w-2 h-2 bg-white/50 rounded-full blur-[1px]" />
        )}
        {/* Eyes for non-garbage */}
        {!ghost && color !== 'garbage' && (
          <div className="absolute inset-0 flex items-center justify-center gap-1 mt-2">
            <div className="w-1.5 h-1.5 bg-black/70 rounded-full" />
            <div className="w-1.5 h-1.5 bg-black/70 rounded-full" />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
