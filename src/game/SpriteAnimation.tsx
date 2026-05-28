import { useEffect, useState } from 'react';

type SheetMeta = {
  frames: Record<string, { frame: { x: number; y: number; w: number; h: number } }>;
  meta: {
    image: string;
    size: { w: number; h: number };
    cell: number;
    frameCount: number;
  };
};

// 빌드 시점에 모든 walking_sideview.{png,json} 자산을 정적으로 import
const sheetImages = import.meta.glob<{ default: string }>(
  '../../assets/img/*/walking_sideview.png',
  { eager: true },
);
const sheetMetas = import.meta.glob<SheetMeta>(
  '../../assets/img/*/walking_sideview.json',
  { eager: true, import: 'default' },
);

type Props = {
  /** 캐릭터 폴더 이름 (예: 'LeeRu-ri') */
  character: string;
  /** 표시 높이 (px) — width는 정사각 셀 가정으로 동일 */
  size?: number;
  /** 초당 프레임 수 */
  fps?: number;
  /** 한 cycle 만 재생하고 마지막 프레임에서 멈춤 */
  playOnce?: boolean;
  /** 좌우 반전 (오른쪽→왼쪽 걷기) */
  flip?: boolean;
  /** 재생 완료 콜백 (playOnce 일 때) */
  onComplete?: () => void;
  className?: string;
};

function lookupSheet(character: string): { src: string; meta: SheetMeta } | null {
  const imgEntry = Object.entries(sheetImages).find(([k]) => k.includes(`/${character}/walking_sideview.png`));
  const metaEntry = Object.entries(sheetMetas).find(([k]) => k.includes(`/${character}/walking_sideview.json`));
  if (!imgEntry || !metaEntry) return null;
  return { src: imgEntry[1].default, meta: metaEntry[1] as SheetMeta };
}

/**
 * 단일 캐릭터 스프라이트시트(grid 형태, 균일 셀)를 프레임 인덱스로 애니메이션 재생.
 * 시트 PNG 한 장을 background-image 로 사용하고 background-position 만 매 프레임 갱신.
 */
export default function SpriteAnimation({
  character,
  size = 360,
  fps = 24,
  playOnce = false,
  flip = false,
  onComplete,
  className = '',
}: Props) {
  const sheet = lookupSheet(character);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!sheet) return;
    const total = sheet.meta.meta.frameCount;
    const interval = 1000 / fps;
    let stopped = false;
    let i = 0;
    const id = window.setInterval(() => {
      if (stopped) return;
      i += 1;
      if (playOnce && i >= total - 1) {
        setFrame(total - 1);
        stopped = true;
        window.clearInterval(id);
        onComplete?.();
        return;
      }
      setFrame(i % total);
    }, interval);
    return () => {
      stopped = true;
      window.clearInterval(id);
    };
    // character / fps / playOnce 변경 시 재시작
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character, fps, playOnce]);

  if (!sheet) {
    return (
      <div
        className={`flex items-center justify-center bg-stone-800/40 border border-stone-600 text-stone-400 text-xs ${className}`}
        style={{ width: size, height: size }}
      >
        sprite missing: {character}
      </div>
    );
  }

  const cell = sheet.meta.meta.cell;
  const frameKey = `frame_${frame}`;
  const frameInfo = sheet.meta.frames[frameKey] ?? sheet.meta.frames[Object.keys(sheet.meta.frames)[0]];
  // 표시 크기에 맞춰 시트 전체를 비율로 스케일
  const scale = size / cell;
  const totalW = sheet.meta.meta.size.w * scale;
  const totalH = sheet.meta.meta.size.h * scale;

  return (
    <div
      aria-label={`${character} walking animation`}
      className={`select-none ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${sheet.src})`,
        backgroundSize: `${totalW}px ${totalH}px`,
        backgroundPosition: `-${frameInfo.frame.x * scale}px -${frameInfo.frame.y * scale}px`,
        backgroundRepeat: 'no-repeat',
        transform: flip ? 'scaleX(-1)' : undefined,
        imageRendering: 'auto',
      }}
    />
  );
}
