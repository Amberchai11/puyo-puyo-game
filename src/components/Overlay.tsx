import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  phase: string;
  score: number;
  onStart: () => void;
}

export function Overlay({ phase, score, onStart }: Props) {
  const visible = phase === 'idle' || phase === 'gameover';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center z-20 rounded-2xl"
          style={{ background: 'rgba(5, 7, 25, 0.88)', backdropFilter: 'blur(4px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {phase === 'gameover' && (
            <>
              <motion.h2
                className="text-4xl font-black text-red-400 mb-2 tracking-tight"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                GAME OVER
              </motion.h2>
              <motion.p
                className="text-indigo-200 text-lg mb-6 font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Score: {score.toLocaleString()}
              </motion.p>
            </>
          )}

          {phase === 'idle' && (
            <motion.h2
              className="text-5xl font-black mb-8 tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #818cf8, #c084fc, #f472b6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              PUYO PUYO
            </motion.h2>
          )}

          <motion.button
            className="px-8 py-3 rounded-full font-bold text-lg text-white cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 0 20px rgba(99,102,241,0.5)',
            }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(99,102,241,0.8)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            {phase === 'gameover' ? 'Play Again' : 'Start Game'}
          </motion.button>

          <motion.p
            className="mt-4 text-indigo-400/60 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Arrow keys · Z/X rotate · Space = hard drop
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
