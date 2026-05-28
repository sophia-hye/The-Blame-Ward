import { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, Heart, MessageCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { characters, imgLeeRuRi } from './game/characters';
import { scenes, scoreChanges, choices } from './game/scenes';
import type { Choice } from './game/types';
import CharacterStage from './game/CharacterStage';
import Atmosphere from './game/Atmosphere';
import ImpactLayer, { type FloatScore } from './game/ImpactLayer';
import GameMenu, { type BacklogEntry } from './game/GameMenu';
import IntroWalkScene from './game/IntroWalkScene';
import { resolveBackground } from './game/backgrounds';
import { useGameSettings } from './game/settings';
import { sfx } from './game/sound';

export default function BlameWardGame() {
  const { settings, update: updateSettings } = useGameSettings();

  const [sceneIdx, setSceneIdx] = useState(0);
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [safetyScore, setSafetyScore] = useState(15);
  const [showChoice, setShowChoice] = useState(false);
  const [choiceResult, setChoiceResult] = useState<Choice | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showIntroWalk, setShowIntroWalk] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningText, setWarningText] = useState('');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [choiceReady, setChoiceReady] = useState(false);
  const [feedbackReady, setFeedbackReady] = useState(false);

  // 임팩트 효과 상태
  const [shake, setShake] = useState<'none' | 'small' | 'big'>('none');
  const [flashColor, setFlashColor] = useState<'white' | 'red' | null>(null);
  const [zoomImpact, setZoomImpact] = useState(false);
  const [floatingScores, setFloatingScores] = useState<FloatScore[]>([]);
  const [gaugePulse, setGaugePulse] = useState(false);
  const floatIdRef = useRef(0);

  // 대사 백로그
  const [backlog, setBacklog] = useState<BacklogEntry[]>([]);
  const lastLoggedRef = useRef<string>('');

  const currentScene = scenes[sceneIdx];
  const currentDialogue = currentScene?.dialogues[dialogueIdx];
  const speaker = currentDialogue?.speaker ?? '나레이션';
  const speakerInfo = characters[speaker] || characters['나레이션'];

  // ───────────────────────── 임팩트 트리거 헬퍼 ─────────────────────────
  const triggerShake = useCallback((mode: 'small' | 'big') => {
    setShake(mode);
    setTimeout(() => setShake('none'), mode === 'big' ? 520 : 320);
  }, []);
  const triggerFlash = useCallback((color: 'white' | 'red') => {
    setFlashColor(color);
    setTimeout(() => setFlashColor(null), 720);
  }, []);
  const triggerZoom = useCallback(() => {
    setZoomImpact(true);
    setTimeout(() => setZoomImpact(false), 700);
  }, []);
  const triggerGaugePulse = useCallback(() => {
    setGaugePulse(true);
    setTimeout(() => setGaugePulse(false), 700);
  }, []);
  const spawnFloatingScore = useCallback((delta: number) => {
    const id = ++floatIdRef.current;
    setFloatingScores(prev => [...prev, { id, delta }]);
    setTimeout(() => setFloatingScores(prev => prev.filter(s => s.id !== id)), 1700);
  }, []);

  // ───────────────────────── typewriter ─────────────────────────
  useEffect(() => {
    // 시작 화면이나 인트로 컷씬 중에는 typewriter 를 돌리지 않는다.
    // 그러지 않으면 25ms 마다 부모 re-render 가 일어나 인트로의 CSS transition 이 깨진다.
    if (!gameStarted || showIntroWalk) return;
    if (!currentDialogue || showChoice || showFeedback) return;
    setIsTyping(true);
    setDisplayedText('');
    const text = currentDialogue.text;
    const speedMs = settings.skip ? 2 : settings.textSpeedMs;
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        // 타이핑 SFX (영문/숫자/한글 character마다 가볍게)
        if (i % 2 === 0 && !settings.skip) sfx.play('type');
        i++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, speedMs);
    return () => clearInterval(interval);
  }, [gameStarted, showIntroWalk, sceneIdx, dialogueIdx, showChoice, showFeedback, settings.textSpeedMs, settings.skip]);

  // ───────────────────────── 백로그 누적 ─────────────────────────
  useEffect(() => {
    if (!currentDialogue) return;
    if (showChoice || showFeedback) return;
    const key = `${sceneIdx}:${dialogueIdx}`;
    if (lastLoggedRef.current === key) return;
    lastLoggedRef.current = key;
    const info = characters[currentDialogue.speaker];
    setBacklog(prev => [
      ...prev,
      { speaker: currentDialogue.speaker, text: currentDialogue.text, speakerColor: info?.color },
    ]);
  }, [sceneIdx, dialogueIdx, currentDialogue, showChoice, showFeedback]);

  // ───────────────────────── 자동 점수 변화 ─────────────────────────
  useEffect(() => {
    const key = `${currentScene?.id}-${dialogueIdx}`;
    const change = scoreChanges[key];
    if (change && !showChoice && !showFeedback) {
      const timer = setTimeout(() => {
        setSafetyScore(prev => Math.max(0, prev + change.delta));
        setWarningText(change.warning);
        setShowWarning(true);
        spawnFloatingScore(change.delta);
        triggerGaugePulse();
        // 큰 음수 변화엔 셰이크 + 붉은 플래시 + 경고음 + 줌
        if (change.delta <= -3) {
          triggerShake('big');
          triggerFlash('red');
          triggerZoom();
          sfx.play('score-warning');
          sfx.play('score-down');
        } else if (change.delta < 0) {
          triggerShake('small');
          sfx.play('score-down');
        } else if (change.delta > 0) {
          sfx.play('score-up');
        }
        setTimeout(() => setShowWarning(false), 2500);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [sceneIdx, dialogueIdx, currentScene?.id, showChoice, showFeedback, spawnFloatingScore, triggerShake, triggerFlash, triggerZoom, triggerGaugePulse]);

  // ───────────────────────── isChoice 자동 모달 ─────────────────────────
  useEffect(() => {
    if (!currentDialogue?.isChoice) return;
    if (isTyping || showChoice || showFeedback) return;
    const t = setTimeout(() => {
      setShowChoice(true);
      sfx.play('modal-open');
    }, 800);
    return () => clearTimeout(t);
  }, [currentDialogue, isTyping, showChoice, showFeedback]);

  // ───────────────────────── 모달 cooldown ─────────────────────────
  useEffect(() => {
    if (!showChoice) { setChoiceReady(false); return; }
    setChoiceReady(false);
    const t = setTimeout(() => setChoiceReady(true), 350);
    return () => clearTimeout(t);
  }, [showChoice]);

  useEffect(() => {
    if (!showFeedback) { setFeedbackReady(false); return; }
    setFeedbackReady(false);
    const t = setTimeout(() => setFeedbackReady(true), 350);
    return () => clearTimeout(t);
  }, [showFeedback]);

  // ───────────────────────── 오토 플레이 ─────────────────────────
  useEffect(() => {
    if (!gameStarted) return;
    if (!settings.autoPlay) return;
    if (showChoice || showFeedback) return;
    if (isTyping) return;
    if (currentDialogue?.isChoice) return;
    const wait = Math.max(800, Math.min(3500, (currentDialogue?.text?.length ?? 30) * 45));
    const t = setTimeout(() => handleNext(), wait);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.autoPlay, gameStarted, isTyping, showChoice, showFeedback, sceneIdx, dialogueIdx, currentDialogue]);

  // ───────────────────────── 진행 로직 ─────────────────────────
  const handleNext = () => {
    if (isTyping) {
      setDisplayedText(currentDialogue!.text);
      setIsTyping(false);
      return;
    }
    if (currentDialogue?.isChoice) {
      setShowChoice(true);
      sfx.play('modal-open');
      return;
    }
    sfx.play('click');
    if (dialogueIdx < currentScene.dialogues.length - 1) {
      setDialogueIdx(dialogueIdx + 1);
    } else if (sceneIdx < scenes.length - 1) {
      sfx.play('scene-transition');
      if (sceneIdx + 1 === 2) {
        setSceneIdx(3);
      } else {
        setSceneIdx(sceneIdx + 1);
      }
      setDialogueIdx(0);
    }
  };

  const handleChoice = (choice: Choice) => {
    setChoiceResult(choice);
    setShowChoice(false);
    setShowFeedback(true);
    setSafetyScore(prev => Math.max(0, Math.min(100, prev + choice.feedback.scoreDelta)));
    spawnFloatingScore(choice.feedback.scoreDelta);
    triggerGaugePulse();
    if (choice.type === 'best' || choice.type === 'just_culture') {
      sfx.play('choice-best');
      triggerFlash('white');
    } else {
      sfx.play('choice-bad');
      triggerShake('small');
    }
  };

  const handleFeedbackContinue = () => {
    sfx.play('click');
    setShowFeedback(false);
    setSceneIdx(3);
    setDialogueIdx(0);
  };

  const handleRestart = () => {
    sfx.play('click');
    setSceneIdx(0);
    setDialogueIdx(0);
    setSafetyScore(15);
    setShowChoice(false);
    setShowFeedback(false);
    setChoiceResult(null);
    setGameStarted(false);
    setImgErrors({});
    setBacklog([]);
    lastLoggedRef.current = '';
  };

  const handleImgError = (s: string) => {
    setImgErrors(prev => ({ ...prev, [s]: true }));
  };

  // ───────────────────────── 시작 화면 (시네마틱) ─────────────────────────
  if (!gameStarted) {
    return (
      <div className="min-h-screen h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/40 flex items-center justify-center p-6 font-sans relative">
        <Atmosphere safetyScore={15} />
        <div className="max-w-2xl w-full text-center space-y-8 relative z-10">
          <div className="space-y-3">
            <div className="subtitle-fade-1 inline-block px-4 py-1 border border-red-700/50 rounded-full text-red-300 text-xs tracking-widest">
              EDUCATIONAL SIMULATION · CHAPTER 1
            </div>
            <h1 className="title-reveal text-5xl md:text-6xl font-bold text-white tracking-tight">Culture Transformation</h1>
            <h2 className="subtitle-fade-1 text-3xl font-light text-red-300 italic">: The Blame Ward</h2>
          </div>

          <div className="subtitle-fade-2 flex justify-center">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-blue-500 bg-blue-600 shadow-2xl shadow-blue-900/50">
              {!imgErrors['이루리'] ? (
                <img src={imgLeeRuRi} alt="이루리" className="w-full h-full object-cover" onError={() => handleImgError('이루리')} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">루</div>
              )}
            </div>
          </div>

          <p className="subtitle-fade-2 text-stone-300 leading-relaxed">
            당신은 신생아 및 소아 중환자실(NICU/PICU)에 새로 발령받은 신규 간호사<br/>
            <span className="text-blue-300 font-semibold text-xl">이루리</span>입니다.
          </p>

          <div className="subtitle-fade-3 bg-slate-900/60 border border-slate-700 rounded-lg p-6 text-left space-y-3 backdrop-blur">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
              <div>
                <div className="text-red-300 font-semibold text-sm">현재 병동의 상태</div>
                <div className="text-stone-400 text-sm mt-1">환자안전문화 지수: <span className="text-red-400 font-bold">15%</span> (위험)</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-pink-400 mt-1 flex-shrink-0" />
              <div>
                <div className="text-pink-300 font-semibold text-sm">당신의 임무</div>
                <div className="text-stone-400 text-sm mt-1">비난 문화(Blame Culture)를 공정 문화(Just Culture)로 변화시키는 "문화 구축자"가 되는 것</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <div className="text-blue-300 font-semibold text-sm">학습 이론 기반</div>
                <div className="text-stone-400 text-sm mt-1">IVN Model · Just Culture · Theory of Planned Behavior</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => { sfx.play('choice-select'); setShowIntroWalk(true); }}
            className="subtitle-fade-4 px-8 py-3 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white rounded-lg shadow-lg shadow-red-900/50 transition-all hover:scale-105 font-semibold tracking-wide"
          >
            병동에 입장하기 →
          </button>

          <p className="subtitle-fade-4 text-stone-500 text-xs">※ 본 프로그램은 환자안전문화 교육 연구 목적의 시뮬레이션입니다.</p>
        </div>

        {/* 인트로 워킹 컷씬 */}
        {showIntroWalk && (
          <IntroWalkScene
            onFinish={() => {
              setShowIntroWalk(false);
              setGameStarted(true);
            }}
          />
        )}
      </div>
    );
  }

  // ───────────────────────── 게임 화면 ─────────────────────────
  const getScoreColor = () => {
    if (safetyScore < 10) return 'text-red-500';
    if (safetyScore < 30) return 'text-red-400';
    if (safetyScore < 50) return 'text-orange-400';
    if (safetyScore < 70) return 'text-yellow-400';
    return 'text-emerald-400';
  };
  const getScoreBg = () => {
    if (safetyScore < 30) return 'from-red-600 to-red-500';
    if (safetyScore < 60) return 'from-orange-500 to-yellow-500';
    return 'from-emerald-500 to-green-400';
  };

  const sceneCharacters = [...new Set(
    currentScene.dialogues
      .map(d => d.speaker)
      .filter(s => s !== '나레이션' && s !== '시스템'),
  )];

  const isCenterMessage = speaker === '나레이션' || speaker === '시스템';
  const showBubbleOnCharacter = !isCenterMessage && !showChoice && !showFeedback;

  const shakeClass = shake === 'big' ? 'shake-big' : shake === 'small' ? 'shake-small' : '';
  const zoomClass = zoomImpact ? 'zoom-impact' : '';

  return (
    <div
      className={`min-h-screen h-screen overflow-hidden bg-gradient-to-br ${currentScene.bg} font-sans relative ${shakeClass} ${zoomClass}`}
      onClick={(e) => {
        if (e.target instanceof Element && e.target.closest('button')) return;
        if (e.target instanceof Element && e.target.closest('input')) return;
        if (!showChoice && !showFeedback) handleNext();
      }}
    >
      {/* 시나리오 배경 일러스트 */}
      {(() => {
        const bgUrl = resolveBackground(currentScene.bgImage);
        return bgUrl ? (
          <div
            key={`bg-${currentScene.id}`}
            className="absolute inset-0 pointer-events-none bg-cover bg-center transition-opacity duration-700 emotion-fade-in"
            style={{ backgroundImage: `url(${bgUrl})` }}
          />
        ) : null;
      })()}
      {/* 어둡게 깔리는 분위기 오버레이 (캐릭터 가시성 확보) */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>

      {/* 시네마틱 배경 레이어 */}
      <Atmosphere safetyScore={safetyScore} />

      {/* 무대 바닥 비네팅 */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none z-[5]"></div>

      {/* 상단 UI: 환자안전문화 지수 */}
      <div className="relative z-30 px-4 md:px-6 pt-3 pb-2 border-b border-red-900/40 backdrop-blur-sm bg-black/55">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <AlertTriangle className={`w-5 h-5 ${getScoreColor()} ${safetyScore < 20 ? 'animate-pulse' : ''}`} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-stone-400 tracking-widest">환자안전문화 지수 · PATIENT SAFETY CULTURE INDEX</span>
                <span className={`text-lg font-bold ${getScoreColor()} ${safetyScore < 20 ? 'animate-pulse' : ''}`}>{safetyScore}%</span>
              </div>
              <div className={`h-2 bg-stone-900 rounded-full overflow-hidden border border-stone-700 ${gaugePulse ? 'gauge-pulse' : ''}`}>
                <div
                  className={`h-full bg-gradient-to-r ${getScoreBg()} transition-all duration-1000 ease-out`}
                  style={{ width: `${safetyScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 장면 제목 */}
        <div className="max-w-5xl mx-auto mt-2">
          <div className="text-[10px] text-stone-500 tracking-widest">
            CHAPTER 1 · {currentScene.id.toUpperCase().replace('_', '.')}
          </div>
          <h2 className="text-sm md:text-base text-stone-200 font-semibold">{currentScene.title}</h2>
        </div>

        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-40"
          >
            <div className="bg-red-900/95 border border-red-500 rounded-lg px-4 py-2 text-red-200 text-sm flex items-center gap-2 shadow-lg shadow-red-900/50">
              <AlertTriangle className="w-4 h-4" />
              {warningText}
            </div>
          </motion.div>
        )}
      </div>

      {/* 메뉴 (백로그/스킵/오토/볼륨/설정) */}
      <GameMenu settings={settings} onUpdate={updateSettings} backlog={backlog} />

      {/* 캐릭터 무대 */}
      <CharacterStage
        sceneCharacters={sceneCharacters}
        activeSpeaker={isCenterMessage ? '' : speaker}
        activeEmotion={isCenterMessage ? undefined : currentDialogue?.emotion}
        displayedText={displayedText}
        isTyping={isTyping}
        showBubble={showBubbleOnCharacter}
        onImgError={handleImgError}
        imgErrors={imgErrors}
      />

      {/* 나레이션 / 시스템 메시지 (중앙 정렬) */}
      <AnimatePresence>
        {isCenterMessage && !showChoice && !showFeedback && currentDialogue && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key={`narration-${sceneIdx}-${dialogueIdx}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="w-[min(92vw,780px)] pointer-events-auto"
            >
              <div className={`${speakerInfo.bg} backdrop-blur-md border-l-4 ${speakerInfo.border} rounded-lg p-6 md:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.7)] ring-1 ring-white/5`}>
                {speaker === '시스템' && (
                  <div className={`text-xs font-bold ${speakerInfo.color} mb-2 tracking-widest`}>⚠️ 시스템 알림</div>
                )}
                <div className={`text-base md:text-lg leading-relaxed whitespace-pre-line ${
                  speaker === '나레이션' ? 'text-stone-200 italic text-center' : 'text-yellow-100 font-mono'
                }`}>
                  {displayedText}
                  {isTyping && <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse align-middle"></span>}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 클릭 힌트 (하단 중앙) */}
      {!showChoice && !showFeedback && !isTyping && !settings.autoPlay && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 text-stone-400/80 text-xs animate-pulse">
          {settings.skip ? '스킵 진행 중...' : '화면을 클릭하여 계속 ▶'}
        </div>
      )}
      {settings.autoPlay && !showChoice && !showFeedback && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 text-amber-300/80 text-xs">
          AUTO PLAY
        </div>
      )}

      {/* 임팩트 레이어 (플래시 + 플로팅 점수) */}
      <ImpactLayer flashColor={flashColor} floatingScores={floatingScores} />

      {/* 선택지 모달 */}
      <AnimatePresence>
        {showChoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-3xl w-full space-y-3"
            >
              <div className="bg-blue-950/85 border-2 border-blue-500 rounded-lg p-4 flex items-center gap-4 shadow-[0_24px_64px_rgba(0,0,0,0.7)]">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-400 bg-blue-600 flex-shrink-0">
                  {!imgErrors['이루리'] ? (
                    <img src={imgLeeRuRi} alt="이루리" className="w-full h-full object-cover" onError={() => handleImgError('이루리')} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white">루</div>
                  )}
                </div>
                <div>
                  <div className="text-blue-300 text-sm font-semibold mb-1">💭 이루리의 선택</div>
                  <div className="text-stone-100">신규 간호사인 당신, 어떻게 행동하시겠습니까?</div>
                </div>
              </div>
              {choices.map((choice, i) => (
                <motion.button
                  key={i}
                  whileHover={{ x: 4 }}
                  disabled={!choiceReady}
                  onMouseEnter={() => choiceReady && sfx.play('choice-hover')}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!choiceReady) return;
                    handleChoice(choice);
                  }}
                  className="w-full text-left bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-lg p-4 transition-colors group backdrop-blur disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-700 group-hover:bg-blue-600 flex items-center justify-center text-stone-200 text-sm flex-shrink-0 transition-colors">
                      {i + 1}
                    </div>
                    <div className="text-stone-100 group-hover:text-white leading-relaxed">{choice.label}</div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 피드백 모달 */}
      <AnimatePresence>
        {showFeedback && choiceResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className={`max-w-3xl w-full rounded-lg p-6 border-2 backdrop-blur shadow-2xl my-8 ${
                choiceResult.type === 'best' ? 'bg-emerald-950/90 border-emerald-500' :
                choiceResult.type === 'just_culture' ? 'bg-blue-950/90 border-blue-500' :
                choiceResult.type === 'bystander' ? 'bg-orange-950/90 border-orange-500' :
                'bg-red-950/90 border-red-500'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs text-stone-400 tracking-widest mb-1">JUST CULTURE FEEDBACK</div>
                  <h3 className="text-2xl font-bold text-white">{choiceResult.feedback.title}</h3>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${choiceResult.feedback.scoreDelta > 0 ? 'bg-emerald-600 text-white' : 'bg-red-700 text-white'}`}>
                  {choiceResult.feedback.scoreDelta > 0 ? '+' : ''}{choiceResult.feedback.scoreDelta}%
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-black/30 rounded p-3 border border-white/10">
                  <div className="text-xs text-stone-400 mb-1">분류</div>
                  <div className="text-stone-100 font-semibold">{choiceResult.feedback.category}</div>
                </div>
                <div>
                  <div className="text-xs text-stone-400 mb-2 tracking-widest">📋 상황 분석</div>
                  <div className="text-stone-200 leading-relaxed">{choiceResult.feedback.explanation}</div>
                </div>
                <div className="bg-black/20 rounded p-4 border-l-2 border-yellow-500/50">
                  <div className="text-xs text-yellow-300 mb-2 tracking-widest">⚖️ JUST CULTURE 관점</div>
                  <div className="text-stone-200 leading-relaxed text-sm">{choiceResult.feedback.justCulture}</div>
                </div>
              </div>

              <button
                disabled={!feedbackReady}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!feedbackReady) return;
                  handleFeedbackContinue();
                }}
                className="mt-6 w-full px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                계속 진행하기 →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 게임 종료 */}
      {sceneIdx === scenes.length - 1 && dialogueIdx === currentScene.dialogues.length - 1 && !isTyping && !showFeedback && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 text-center space-y-3">
          <button
            onClick={(e) => { e.stopPropagation(); handleRestart(); }}
            className="px-6 py-2 bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-100 rounded-lg transition-all"
          >
            처음부터 다시 시작
          </button>
          <div className="text-xs text-stone-400">다음 챕터에서는 Just Culture 기반의 변화를 만들어갑니다</div>
        </div>
      )}
    </div>
  );
}
