import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { characters, resolveCharacterImage } from './characters';
import type { CharacterInfo, Emotion } from './types';

type Props = {
  sceneCharacters: string[];
  activeSpeaker: string;
  activeEmotion?: Emotion;
  displayedText: string;
  isTyping: boolean;
  showBubble: boolean;
  onImgError: (speaker: string) => void;
  imgErrors: Record<string, boolean>;
};

export default function CharacterStage({
  sceneCharacters,
  activeSpeaker,
  activeEmotion,
  displayedText,
  isTyping,
  showBubble,
  onImgError,
  imgErrors,
}: Props) {
  const leftChars = sceneCharacters.filter(s => characters[s]?.side === 'left');
  const rightChars = sceneCharacters.filter(s => characters[s]?.side === 'right');

  return (
    <div className="absolute inset-x-0 bottom-24 top-28 pointer-events-none z-10 flex items-end justify-between px-2 md:px-6">
      {/* 좌측 라인 */}
      <div className="flex items-end gap-0 md:gap-2 h-full max-w-[60%]">
        <AnimatePresence>
          {leftChars.map(name => (
            <CharacterFigure
              key={name}
              name={name}
              isActive={name === activeSpeaker}
              emotion={name === activeSpeaker ? activeEmotion : undefined}
              side="left"
              displayedText={displayedText}
              isTyping={isTyping}
              showBubble={showBubble && name === activeSpeaker}
              onImgError={onImgError}
              imgError={!!imgErrors[name]}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* 우측 라인 */}
      <div className="flex items-end gap-0 md:gap-2 h-full max-w-[40%] justify-end">
        <AnimatePresence>
          {rightChars.map(name => (
            <CharacterFigure
              key={name}
              name={name}
              isActive={name === activeSpeaker}
              emotion={name === activeSpeaker ? activeEmotion : undefined}
              side="right"
              displayedText={displayedText}
              isTyping={isTyping}
              showBubble={showBubble && name === activeSpeaker}
              onImgError={onImgError}
              imgError={!!imgErrors[name]}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CharacterFigure({
  name,
  isActive,
  emotion,
  side,
  displayedText,
  isTyping,
  showBubble,
  onImgError,
  imgError,
}: {
  name: string;
  isActive: boolean;
  emotion?: Emotion;
  side: 'left' | 'right';
  displayedText: string;
  isTyping: boolean;
  showBubble: boolean;
  onImgError: (speaker: string) => void;
  imgError: boolean;
}) {
  const info = characters[name];
  // 화자일 때는 emotion 이미지, 비화자는 normal 이미지로 표시
  const targetImage = info
    ? (isActive
        ? resolveCharacterImage(name, emotion)
        : resolveCharacterImage(name))
    : null;
  const { currentImage, prevImage } = useCrossfadeImage(targetImage);
  if (!info) return null;

  const enterClass = side === 'left' ? 'char-enter-left' : 'char-enter-right';

  return (
    <div
      className={`relative flex-shrink min-w-0 h-full flex items-end ${enterClass}`}
      style={{ zIndex: isActive ? 20 : 5 }}
    >
      <div
        className="relative h-full flex items-end transition-[filter] duration-300"
        style={{ filter: isActive ? 'brightness(1)' : 'brightness(0.45)' }}
      >
        {currentImage && !imgError ? (
          <div className={`relative h-[60vh] md:h-[72vh] flex items-end ${isActive ? 'char-active' : 'char-idle'}`}>
            {/* 화자 발치 글로우 (캐릭터 뒤) */}
            {isActive && (
              <div
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-4 rounded-full blur-xl ${info.avatarBg} opacity-50 pointer-events-none`}
              ></div>
            )}
            {/* 크로스페이드: prev 이미지가 fade-out 되는 동안 새 currentImage 가 fade-in.
                두 이미지를 동일 좌표에 absolute stack 으로 두어 부드럽게 교차 */}
            <div className={`relative h-full ${isActive && isTyping ? 'char-talking' : ''}`}>
              {prevImage && prevImage !== currentImage && (
                <img
                  key={`prev-${prevImage}`}
                  src={prevImage}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-auto object-contain object-bottom select-none char-stand emotion-fade-out pointer-events-none"
                  draggable={false}
                />
              )}
              <img
                key={`cur-${currentImage}`}
                src={currentImage}
                alt={name}
                onError={() => onImgError(name)}
                className="h-full w-auto object-contain object-bottom select-none char-stand emotion-fade-in"
                draggable={false}
              />
            </div>
          </div>
        ) : (
          <div className={`h-[60vh] md:h-[72vh] aspect-[3/4] ${info.avatarBg} rounded-2xl flex items-center justify-center text-white text-6xl font-bold border-2 ${info.border}`}>
            {info.initial}
          </div>
        )}
      </div>

      {/* 이름표 (하단) */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 bottom-2 px-3 py-1 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all
          ${isActive ? `${info.bubbleBg} ${info.color} border border-current shadow-lg` : 'bg-black/60 text-stone-500 border border-stone-700'}`}
      >
        {name}
        {isActive && info.role && (
          <span className="ml-2 text-stone-300/80 font-normal text-[10px] md:text-xs">{info.role}</span>
        )}
      </div>

      {/* 말풍선 (화자에게만, 머리 옆쪽 상단) */}
      <AnimatePresence>
        {showBubble && (
          <SpeechBubble
            key="bubble"
            info={info}
            side={side}
            text={displayedText}
            isTyping={isTyping}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * 이미지 src가 바뀌면 이전 src를 약 0.5초간 보관하여 크로스페이드를 가능하게 한다.
 * 이전 src를 위해 두 개의 <img>를 동시에 렌더링해 자연스러운 표정 전환을 만든다.
 */
function useCrossfadeImage(nextImage: string | null): { currentImage: string | null; prevImage: string | null } {
  const [currentImage, setCurrentImage] = useState<string | null>(nextImage);
  const [prevImage, setPrevImage] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (nextImage === currentImage) return;
    if (currentImage) setPrevImage(currentImage);
    setCurrentImage(nextImage);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setPrevImage(null);
      timerRef.current = null;
    }, 500);
    // cleanup에서 타이머를 비우지 않는다. 다음 effect run으로 시퀀스가 이어져도
    // setPrevImage(null) 콜백이 그대로 실행되어야 prev 이미지가 정상 제거됨.
  }, [nextImage, currentImage]);

  // 언마운트 시에만 안전하게 정리
  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  return { currentImage, prevImage };
}

function SpeechBubble({
  info,
  side,
  text,
  isTyping,
}: {
  info: CharacterInfo;
  side: 'left' | 'right';
  text: string;
  isTyping: boolean;
}) {
  // 좌측 캐릭터의 말풍선은 머리 우상단(캐릭터 위로 살짝 겹침),
  // 우측 캐릭터의 말풍선은 머리 좌상단
  const positionClass = side === 'left'
    ? 'left-[38%] md:left-[40%]'
    : 'right-[38%] md:right-[40%]';

  return (
    <div
      className={`absolute top-[4%] md:top-[5%] ${positionClass} pointer-events-auto z-30`}
      style={{ width: 'min(680px, 56vw)' }}
    >
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -5 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full"
    >
      <div className={`relative ${info.bubbleBg} backdrop-blur-md border-2 ${info.border} rounded-2xl px-5 py-4 shadow-2xl shadow-black/60`}>
        {/* 말풍선 꼬리 */}
        {side === 'left' ? (
          <div
            className="absolute top-6 -left-3 w-0 h-0"
            style={{
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderRight: '12px solid rgb(2 6 23 / 0.95)',
            }}
          />
        ) : (
          <div
            className="absolute top-6 -right-3 w-0 h-0"
            style={{
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderLeft: '12px solid rgb(2 6 23 / 0.95)',
            }}
          />
        )}
        <div className="text-sm md:text-base leading-relaxed whitespace-pre-line text-stone-100 break-keep">
          {text}
          {isTyping && <span className="inline-block w-1.5 h-4 bg-current ml-1 animate-pulse align-middle"></span>}
        </div>
      </div>
    </motion.div>
    </div>
  );
}
