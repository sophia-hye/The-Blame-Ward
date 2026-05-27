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
  if (!info) return null;

  // 화자일 때는 emotion 이미지, 비화자는 normal 이미지로 표시
  const currentImage = isActive
    ? resolveCharacterImage(name, emotion)
    : resolveCharacterImage(name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative flex-shrink min-w-0 h-full flex items-end"
      style={{ zIndex: isActive ? 20 : 5 }}
    >
      <div
        className="relative h-full flex items-end transition-[transform,filter] duration-300"
        style={{
          filter: isActive ? 'brightness(1)' : 'brightness(0.45)',
          transform: isActive ? 'translateY(-6px)' : 'translateY(0)',
        }}
      >
        {currentImage && !imgError ? (
          <div className="relative h-[60vh] md:h-[72vh] flex items-end">
            {/* 화자 발치 글로우 (캐릭터 뒤) */}
            {isActive && (
              <div
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-4 rounded-full blur-xl ${info.avatarBg} opacity-50 pointer-events-none`}
              ></div>
            )}
            {/* key={currentImage}로 감정 전환 시 새 img 인스턴스 마운트 + CSS opacity fade */}
            <img
              key={currentImage}
              src={currentImage}
              alt={name}
              onError={() => onImgError(name)}
              className="h-full w-auto object-contain object-bottom select-none char-stand relative animate-emotionIn"
              draggable={false}
            />
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
    </motion.div>
  );
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
