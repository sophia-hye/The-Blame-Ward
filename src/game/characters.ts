import type { CharacterInfo, Emotion } from './types';

// 폴더 구조 ../../assets/img/<folder>/<emotion>.png 를 모두 빌드 시 import
const imageModules = import.meta.glob<{ default: string }>(
  '../../assets/img/*/*.png',
  { eager: true },
);

function emotionsFor(folder: string): Partial<Record<Emotion, string>> {
  const result: Partial<Record<Emotion, string>> = {};
  for (const [path, mod] of Object.entries(imageModules)) {
    const m = path.match(new RegExp(`/${folder}/([^/]+)\\.png$`));
    if (m) {
      const key = m[1] as Emotion;
      result[key] = mod.default;
    }
  }
  return result;
}

const dokgoYoung = emotionsFor('DokgoYoung');
const leeRuRi = emotionsFor('LeeRu-ri');
const noSimCho = emotionsFor('NoSim-cho');
const yooYeonHae = emotionsFor('YooYeon-hae');
const naSunBae = emotionsFor('NaSun-bae');
const anSeongGong = emotionsFor('AnSeoung-gong'); // 폴더명에 사용자가 만든 철자 유지
const choiEomJi = emotionsFor('ChoiEom-ji');
const guSeHan = emotionsFor('GuSe-han');
const anJeonI = emotionsFor('An-jeon-i');

// 시작 화면 미리보기 등에서 사용할 이루리 기본 이미지
export const imgLeeRuRi = leeRuRi.normal ?? leeRuRi.happy ?? '';

// 힌트 요정 '공정히'의 이미지는 An-jeon-i.png를 사용
export const characters: Record<string, CharacterInfo> = {
  '독고영': {
    color: 'text-red-200', bg: 'bg-red-950/80', border: 'border-red-500',
    bubbleBg: 'bg-red-950/95',
    role: '수간호사',
    img: dokgoYoung.normal ?? null,
    emotions: dokgoYoung,
    defaultEmotion: 'normal',
    initial: '독', avatarBg: 'bg-red-700', side: 'left',
  },
  '이루리': {
    color: 'text-blue-200', bg: 'bg-blue-950/80', border: 'border-blue-400',
    bubbleBg: 'bg-blue-950/95',
    role: '신규 간호사 (나)',
    img: leeRuRi.normal ?? null,
    emotions: leeRuRi,
    defaultEmotion: 'normal',
    initial: '루', avatarBg: 'bg-blue-600', side: 'right',
  },
  '노심초': {
    color: 'text-gray-200', bg: 'bg-gray-800/80', border: 'border-gray-400',
    bubbleBg: 'bg-gray-800/95',
    role: '2년차',
    img: noSimCho.normal ?? null,
    emotions: noSimCho,
    defaultEmotion: 'normal',
    initial: '심', avatarBg: 'bg-gray-600', side: 'left',
  },
  '유연해': {
    color: 'text-emerald-200', bg: 'bg-emerald-950/80', border: 'border-emerald-500',
    bubbleBg: 'bg-emerald-950/95',
    role: '5년차',
    img: yooYeonHae.normal ?? null,
    emotions: yooYeonHae,
    defaultEmotion: 'normal',
    initial: '연', avatarBg: 'bg-emerald-700', side: 'left',
  },
  '나선배': {
    color: 'text-orange-200', bg: 'bg-orange-950/80', border: 'border-orange-500',
    bubbleBg: 'bg-orange-950/95',
    role: '15년차',
    img: naSunBae.normal ?? null,
    emotions: naSunBae,
    defaultEmotion: 'normal',
    initial: '선', avatarBg: 'bg-orange-700', side: 'left',
  },
  '안성공': {
    color: 'text-purple-200', bg: 'bg-purple-950/80', border: 'border-purple-500',
    bubbleBg: 'bg-purple-950/95',
    role: '8년차',
    img: anSeongGong.normal ?? null,
    emotions: anSeongGong,
    defaultEmotion: 'normal',
    initial: '성', avatarBg: 'bg-purple-700', side: 'left',
  },
  '최엄지': {
    color: 'text-pink-200', bg: 'bg-pink-950/80', border: 'border-pink-500',
    bubbleBg: 'bg-pink-950/95',
    role: '책임 간호사',
    img: choiEomJi.normal ?? null,
    emotions: choiEomJi,
    defaultEmotion: 'normal',
    initial: '엄', avatarBg: 'bg-pink-700', side: 'left',
  },
  '구세한': {
    color: 'text-cyan-200', bg: 'bg-cyan-950/80', border: 'border-cyan-500',
    bubbleBg: 'bg-cyan-950/95',
    role: '10년차 안전관리자',
    img: guSeHan.normal ?? null,
    emotions: guSeHan,
    defaultEmotion: 'normal',
    initial: '세', avatarBg: 'bg-cyan-700', side: 'left',
  },
  '공정히': {
    color: 'text-yellow-100', bg: 'bg-yellow-950/80', border: 'border-yellow-400',
    bubbleBg: 'bg-yellow-950/95',
    role: '힌트 요정',
    img: anJeonI.normal ?? anJeonI.smile ?? null,
    emotions: anJeonI,
    defaultEmotion: 'normal',
    initial: '✨', avatarBg: 'bg-yellow-600', side: 'right',
  },
  '시스템': {
    color: 'text-yellow-200', bg: 'bg-yellow-950/80', border: 'border-yellow-500',
    bubbleBg: 'bg-yellow-950/95',
    role: '환자안전문화 알림',
    img: null,
    initial: '⚠️', avatarBg: 'bg-yellow-700', side: 'center',
  },
  '나레이션': {
    color: 'text-stone-300', bg: 'bg-stone-900/80', border: 'border-stone-600',
    bubbleBg: 'bg-stone-900/95',
    role: '',
    img: null,
    initial: '', avatarBg: 'bg-stone-700', side: 'center',
  },
};

/**
 * 화자가 특정 감정으로 말할 때 사용할 이미지를 반환.
 * - dialogue.emotion에 맞는 이미지가 있으면 그걸 사용
 * - 없으면 캐릭터의 defaultEmotion → normal → 첫 번째 사용 가능 이미지 → 단일 img 순으로 fallback
 */
export function resolveCharacterImage(
  speaker: string,
  emotion?: Emotion,
): string | null {
  const info = characters[speaker];
  if (!info) return null;
  if (!info.emotions) return info.img;

  const tryKeys: (Emotion | undefined)[] = [
    emotion,
    info.defaultEmotion,
    'normal',
  ];
  for (const k of tryKeys) {
    if (k && info.emotions[k]) return info.emotions[k]!;
  }
  const first = Object.values(info.emotions)[0];
  return first ?? info.img;
}
