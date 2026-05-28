import { useEffect, useRef, useState } from 'react';
import SpriteAnimation from './SpriteAnimation';
import { resolveBackground } from './backgrounds';
import { sfx } from './sound';

type Props = {
  onFinish: () => void;
};

/**
 * 게임 진입 직전 짧은 인트로 컷씬.
 * 어두운 복도 배경에서 이루리가 좌측 바깥에서 등장해 우측으로 걸어들어가는 모습.
 * 약 4초 분량이고 클릭 시 스킵 가능.
 */
export default function IntroWalkScene({ onFinish }: Props) {
  const [phase, setPhase] = useState<'enter' | 'walking' | 'stopped' | 'fadeout'>('enter');

  // onFinish 는 부모에서 인라인 화살표 함수로 주입될 수 있으므로 ref 로 안정화한다.
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const startX = Math.round(vw * 0.6); // 우측 바깥

  if (typeof window !== 'undefined') {
    (window as unknown as { __introPhase?: string }).__introPhase = phase;
  }

  // 페이즈 타이밍 (누적 ms)
  //   enter:    0 ~ 500    (배경/자막 페이드인)
  //   walking:  500 ~ 6700 (6.2초 동안 우측 → 중앙 걷기)
  //   stopped:  6700 ~ 7700 (도착 후 1초 정지)
  //   fadeout:  7700 ~ 8700 (1초 페이드아웃)
  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase('walking'), 500);
    const t2 = window.setTimeout(() => setPhase('stopped'), 6700);
    const t3 = window.setTimeout(() => setPhase('fadeout'), 7700);
    const t4 = window.setTimeout(() => onFinishRef.current(), 8700);
    return () => {
      [t1, t2, t3, t4].forEach(window.clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 캐릭터 컨테이너 left 값 (px) — viewport 기준 절대 좌표
  // 시작: 우측 바깥, 끝: 화면 가로 중앙에서 캐릭터 폭 절반만큼 좌측 (가운데 정렬)
  const centerX = Math.round(vw / 2 - 240);
  const startLeft = Math.round(vw * 0.95);
  const walkerRef = useRef<HTMLDivElement>(null);

  // walking 페이즈 진입 시 setInterval (30fps) 로 left 직접 보간.
  // requestAnimationFrame 이 환경에 따라 발화 안 되는 케이스가 있어 setInterval 로 보장.
  useEffect(() => {
    if (phase !== 'walking') return;
    const node = walkerRef.current;
    if (!node) return;
    const t0 = performance.now();
    const duration = 6200;
    const id = window.setInterval(() => {
      const now = performance.now();
      const t = Math.min(1, (now - t0) / duration);
      const v = startLeft + (centerX - startLeft) * t;
      node.style.left = `${v}px`;
      if (t >= 1) window.clearInterval(id);
    }, 1000 / 30);
    return () => window.clearInterval(id);
  }, [phase, startLeft, centerX]);

  return (
    <div
      className="absolute inset-0 z-[80] bg-black overflow-hidden cursor-pointer transition-opacity duration-700"
      style={{ opacity: phase === 'fadeout' ? 0 : 1 }}
      onClick={() => {
        sfx.play('click');
        onFinish();
      }}
    >
      {/* NICU 입구 배경 일러스트 */}
      {(() => {
        const bgUrl = resolveBackground('nicu_entrance');
        return bgUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bgUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-black" />
        );
      })()}
      {/* 어둡게 깔리는 분위기 오버레이 */}
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* 바닥 라인 글로우 */}
      <div className="absolute left-0 right-0 bottom-[18%] h-[2px] bg-gradient-to-r from-transparent via-amber-200/30 to-transparent" />
      <div className="absolute left-0 right-0 bottom-[16%] h-12 bg-gradient-to-t from-amber-200/8 to-transparent blur-2xl" />

      {/* 자막 */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-[18%] text-center pointer-events-none subtitle-fade-1 transition-opacity duration-700"
        style={{ opacity: phase === 'fadeout' ? 0 : 1 }}
      >
        <div className="text-xs tracking-[0.4em] text-stone-400 mb-2">CHAPTER 1</div>
        <div className="text-2xl md:text-3xl font-light text-stone-100 italic">신규 간호사 이루리, 첫 출근</div>
      </div>

      {/* 걷는 이루리 — 우측 바깥에서 화면 중앙으로 이동
          컨테이너를 left-1/2 -ml-[240px] 로 중앙에 두면 캐릭터 중앙이 화면 정중앙. */}
      <div
        ref={walkerRef}
        data-walker="leeru"
        // 초기 left 만 React 가 set; walking 진입 후엔 requestAnimationFrame 으로 매 frame 직접 set.
        className="absolute bottom-[10%]"
        style={{ left: `${startLeft}px`, willChange: 'left' }}
      >
        <SpriteAnimation
          character="LeeRu-ri"
          size={480}
          // walking cycle 도 약간 느리게 — 발걸음이 더 명확히 보임
          fps={18}
          // 시트 원본이 왼쪽을 바라보고 걷는 모션이므로 우→좌 이동에는 반전 없음
          // 걷다가 멈추면 sprite 도 마지막 프레임에서 정지
          playOnce={phase === 'stopped' || phase === 'fadeout'}
        />
      </div>

      {/* 스킵 안내 */}
      <div className="absolute bottom-4 right-4 text-stone-500 text-xs animate-pulse pointer-events-none">
        클릭하여 건너뛰기 ▶
      </div>
    </div>
  );
}
