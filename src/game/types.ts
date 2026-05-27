// 캐릭터 감정 키 (assets/img/<character>/<emotion>.png 의 emotion 부분)
export type Emotion =
  | 'normal'
  | 'happy'
  | 'angry'
  | 'cold'
  | 'afraid'
  | 'anxious'
  | 'depress'
  | 'annoy'
  | 'sns'
  | 'tired'
  | 'mindless'
  // Chapter 1 정밀 매핑용
  | 'mocking'
  | 'scoffing'
  | 'worried'
  | 'crying'
  | 'relived' // 폴더 파일명 그대로 유지 (사용자가 만든 그대로)
  // 다음 챕터 변화 서사용
  | 'surprised'
  | 'thoughtful'
  | 'confident'
  | 'determined'
  | 'shock'
  | 'reflective'
  | 'changed'
  // 안전이(공정히) 힌트 요정 표정
  | 'pointing'
  | 'serious'
  | 'smile'
  | 'wink';

export type CharacterInfo = {
  color: string;
  bg: string;
  border: string;
  bubbleBg: string;
  role: string;
  // 폴더가 없는 캐릭터(예: 안전이)는 img 단일 이미지만 사용
  img: string | null;
  // 폴더 구조가 있는 캐릭터는 emotions 맵에 모든 감정 이미지가 들어감
  emotions?: Partial<Record<Emotion, string>>;
  // 기본 감정 (emotions가 있을 때 dialogue.emotion이 없으면 이걸 사용)
  defaultEmotion?: Emotion;
  initial: string;
  avatarBg: string;
  side: 'left' | 'right' | 'center';
};

export type Dialogue = {
  speaker: string;
  text: string;
  isChoice?: boolean;
  // 화자의 감정 — 지정 시 해당 이미지로 표시, 미지정 시 캐릭터의 defaultEmotion 사용
  emotion?: Emotion;
};

export type Scene = {
  id: string;
  title: string;
  bg: string;
  bgImage: string;
  dialogues: Dialogue[];
};

export type ChoiceFeedback = {
  title: string;
  category: string;
  explanation: string;
  justCulture: string;
  scoreDelta: number;
};

export type Choice = {
  label: string;
  type: 'blame' | 'just_culture' | 'bystander' | 'best';
  feedback: ChoiceFeedback;
};
