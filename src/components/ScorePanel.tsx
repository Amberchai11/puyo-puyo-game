import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  score: number;
  level: number;
  chains: number;
  maxChains: number;
  chainCount: number;
}

function Stat({ label, value, flash }: { label: string; value: number | string; flash?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs font-bold tracking-widest text-indigo-300/60 uppercase mb-0.5">{label}</span>
      <motion.span
        key={String(value)}
        className="text-2xl font-black tabular-nums"
        style={{ color: flash ? '#fde68a' : '#ffffff' }}
        initial={flash ? { scale: 1.4, color: '#fde68a' } : false}
        animate={{ scale: 1, color: flash ? '#fde68a' : '#ffffff' }}
        transition={{ duration: 0.35 }}
      >
        {value}
      </motion.span>
    </div>
  );
}

export function ScorePanel({ score, level, chains, maxChains, chainCount }: Props) {
  const prevLevel = useRef(level);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    if (level > prevLevel.current) {
      setShowLevelUp(true);
      const id = setTimeout(() => setShowLevelUp(false), 1500);
      prevLevel.current = level;
      return () => clearTimeout(id);
    }
    prevLevel.current = level;
  }, [level]);

  return (
    <div className="flex flex-col gap-4 min-w-[110px]">
      {/* Score */}
      <div
        className="rounded-xl p-3 flex flex-col items-center"
        style={{ background: 'rgba(10,12,35,0.8)', border: '1px solid rgba(99,102,241,0.2)' }}
      >
        <span className="text-xs font-bold tracking-widest text-indigo-300/60 uppercase mb-1">Score</span>
        <motion.span
          key={score}
          className="text-3xl font-black text-white tabular-nums"
          initial={{ scale: 1.3, color: '#a5f3fc' }}
          animate={{ scale: 1, color: '#ffffff' }}
          transition={{ duration: 0.3 }}
        >
          {score.toLocaleString()}
        </motion.span>
      </div>

      {/* Stats */}
      <div
        className="rounded-xl p-3 flex flex-col gap-3 items-center"
        style={{ background: 'rgba(10,12,35,0.8)', border: '1px solid rgba(99,102,241,0.2)' }}
      >
        <Stat label="Level" value={level} flash={showLevelUp} />
        <Stat label="Chains" value={chains} />
        <Stat label="Best" value={`${maxChains}x`} />
      </div>

      {/* Level up flash */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            key={`lv-${level}`}
            className="rounded-xl p-2 flex flex-col items-center"
            style={{
              background: 'rgba(251,191,36,0.2)',
              border: '1px solid rgba(251,191,36,0.5)',
            }}
            initial={{ opacity: 0, scale: 0.7, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <span className="text-yellow-300 text-xs font-bold tracking-widest uppercase">Level Up!</span>
            <span className="text-white text-3xl font-black">Lv.{level}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chain flash */}
      <AnimatePresence>
        {chainCount > 1 && (
          <motion.div
            key={chainCount}
            className="rounded-xl p-2 flex flex-col items-center"
            style={{
              background: 'rgba(99,102,241,0.25)',
              border: '1px solid rgba(99,102,241,0.5)',
            }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.25 }}
          >
            <span className="text-indigo-300 text-xs font-bold tracking-widest uppercase">Chain!</span>
            <span className="text-white text-4xl font-black">{chainCount}x</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
