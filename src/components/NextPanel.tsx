import type { PuyoColor } from '../engine/types';
import { PuyoCell } from './PuyoCell';

interface Props {
  label: string;
  colors: [PuyoColor, PuyoColor];
  size?: number;
}

export function NextPanel({ label, colors, size = 36 }: Props) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-bold tracking-widest text-indigo-300/70 uppercase">{label}</span>
      <div
        className="flex flex-col items-center gap-1 rounded-xl p-3"
        style={{
          background: 'rgba(10, 12, 35, 0.8)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
        }}
      >
        <PuyoCell color={colors[0]} size={size} />
        <PuyoCell color={colors[1]} size={size} />
      </div>
    </div>
  );
}
