import { AnimatePresence, motion } from 'framer-motion';

export type FloatScore = { id: number; delta: number };

type Props = {
  flashColor: 'white' | 'red' | null;
  floatingScores: FloatScore[];
};

/**
 * 화면 위에 절대 위치로 깔리는 임팩트 효과 레이어:
 * - 플래시 (흰색/붉은색)
 * - 점수 변화 플로팅 텍스트
 */
export default function ImpactLayer({ flashColor, floatingScores }: Props) {
  return (
    <>
      {/* 플래시 오버레이 */}
      {flashColor && (
        <div
          key={`flash-${flashColor}-${Date.now()}`}
          className={`absolute inset-0 z-[60] pointer-events-none ${
            flashColor === 'white' ? 'flash-white bg-white' : 'flash-red bg-red-500'
          }`}
        />
      )}

      {/* 점수 변화 플로팅 */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[55] pointer-events-none">
        <AnimatePresence>
          {floatingScores.map(s => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute left-1/2 -translate-x-1/2 score-float text-3xl md:text-4xl font-extrabold whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] ${
                s.delta > 0 ? 'text-emerald-300' : 'text-red-400'
              }`}
              style={{ textShadow: '0 0 12px currentColor' }}
            >
              {s.delta > 0 ? `+${s.delta}` : s.delta}
              <span className="ml-1 text-base align-top">%</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
