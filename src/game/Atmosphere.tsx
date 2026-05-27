import { useMemo } from 'react';

type Props = {
  /** 0~100. 낮을수록 비상등이 더 진해진다. */
  safetyScore: number;
};

/**
 * 시네마틱 배경 레이어들:
 * - 형광등 깜빡임 (병원 분위기)
 * - 안전 지수가 낮을 때 떠오르는 붉은 비상등 펄스
 * - 부유 먼지 파티클
 * - 비네팅
 */
export default function Atmosphere({ safetyScore }: Props) {
  const dust = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 20,
    duration: 18 + Math.random() * 22,
    size: 1 + Math.random() * 3,
    opacity: 0.3 + Math.random() * 0.45,
  })), []);

  const dangerLevel = Math.max(0, Math.min(1, (30 - safetyScore) / 30));

  return (
    <div className="absolute inset-0 pointer-events-none z-[3] overflow-hidden">
      {/* 형광등 */}
      <div className="fluorescent absolute inset-0" />

      {/* 안전 지수 낮을 때 붉은 비상등 */}
      {dangerLevel > 0 && (
        <div
          className="emergency-red absolute inset-0"
          style={{ opacity: dangerLevel }}
        />
      )}

      {/* 부유 먼지 */}
      {dust.map(d => (
        <span
          key={d.id}
          className="dust-particle"
          style={{
            left: `${d.left}%`,
            bottom: `-${Math.random() * 20}px`,
            width: d.size,
            height: d.size,
            opacity: d.opacity,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}

      {/* 비네팅 */}
      <div className="vignette absolute inset-0" />
    </div>
  );
}
