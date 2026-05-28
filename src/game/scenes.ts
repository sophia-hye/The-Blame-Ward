import type { Scene, Choice } from './types';

export const scenes: Scene[] = [
  {
    id: 'scene1',
    title: '장면 1. 겉으로만 평온한 병동 안내',
    bg: 'from-slate-900 via-slate-800 to-red-950/30',
    bgImage: 'nicu_entrance',
    dialogues: [
      { speaker: '나레이션', text: '중환자실 입구. 신생아 및 소아 중환자실(NICU/PICU). 첫 출근날, 차가운 형광등 불빛 아래 독고영 수간호사가 루리를 맞이한다.' },
      { speaker: '독고영', text: '안녕하세요. 저희는 신생아 및 소아 중환자실입니다. 저는 수간호사 독고영입니다. 반갑습니다, 이루리 선생.', emotion: 'happy' },
      { speaker: '이루리', text: '반갑습니다. 잘 부탁드립니다!', emotion: 'happy' },
      { speaker: '독고영', text: '병동 안내를 해드리죠. 우리 병동은 개방 병상과 차압 격리 병상으로 구성되어 있습니다. 개방 병상으로 함께 가 보시면…', emotion: 'normal' },
      { speaker: '나레이션', text: '(갑자기 멈춰 서며 눈을 가늘게 뜬다)' },
    ],
  },
  {
    id: 'scene2',
    title: '장면 2. "조용히 넘어가자" - 은폐의 유혹',
    bg: 'from-slate-900 via-gray-900 to-red-950/40',
    bgImage: 'nicu_opened',
    dialogues: [
      { speaker: '나레이션', text: '개방 병상 구석. 2년차 노심초 간호사가 사색이 되어 있다. 루리는 독고영 옆에서 이 광경을 목격한다.' },
      { speaker: '노심초', text: '(수액 라인을 조절하며 벌벌 떤다) 어떡해... 속도가 너무 빨랐어. 아기 발등이 부었잖아... 아무도 못 봤겠지?', emotion: 'afraid' },
      { speaker: '이루리', text: '(속마음) 어? 아기 발등이 너무 부어 있는데... 보고해야 하는 거 아닌가?', emotion: 'anxious' },
      { speaker: '유연해', text: '(다가와 노심초의 어깨를 치며 낮게 속삭인다) 심초 선생! 이거 뭐야? 수액 들어간 양이 왜 이래? 빨리 보고해!', emotion: 'worried' },
      { speaker: '노심초', text: '(유연해의 팔을 붙잡으며) 연해 선생님, 제발요! 이번에 또 걸리면 저 진짜 불려가게 돼요. 수간호사님 아시잖아요. 저번에 박 선생도 보고했다가 한 달 내내 탈탈 털리고 나갔잖아요. 그냥... 그냥 차트 고치고 조용히 넘어가면 안 될까요?', emotion: 'afraid' },
      { speaker: '독고영', text: '(성큼성큼 다가가며) 거기서 둘이 뭐 하는 거지? 노심초 선생, 환아 발등이 왜 이래! 너 지금 뭐 했어!', emotion: 'angry' },
      { speaker: '노심초', text: '(고개를 푹 숙인다) 죄송합니다... 제가 잠깐 확인을 놓쳐서...', emotion: 'depress' },
      { speaker: '독고영', text: '(주변이 다 들리게) 신생아한테 수액 속도가 얼마나 예민한데! 당장 뭘 잘못했는지 보고서 써와. 박 선생 나간 지 얼마나 됐다고 또 이런 사고를 쳐!', emotion: 'angry' },
      { speaker: '나레이션', text: '루리의 마음이 무겁다. 이 상황에서 신규 간호사인 당신은 어떻게 행동할 것인가?', isChoice: true },
    ],
  },
  {
    id: 'choice_feedback',
    title: '',
    bg: 'from-slate-900 to-slate-800',
    bgImage: '',
    dialogues: [],
  },
  {
    id: 'scene3',
    title: '장면 3. "바빠 죽겠는데 무슨..." - 효율이라는 이름의 도박',
    bg: 'from-slate-900 via-orange-950/30 to-red-950/40',
    bgImage: 'nice_closed',
    dialogues: [
      { speaker: '나레이션', text: '격리 병상 쪽으로 이동 중 응급 알람이 울린다. 5년차 유연해 간호사가 약을 준비 중이다.' },
      { speaker: '독고영', text: '응급 상황이군! 유연해 선생, 빨리 고위험 약물 준비해!', emotion: 'angry' },
      { speaker: '이루리', text: '(도움이 되고 싶어 다가간다) 유 선생님, 제가 이중 확인(Double Check) 도와드릴까요? 학교에서 고위험 약물은 꼭 두 명이...', emotion: 'normal' },
      { speaker: '나선배', text: '(옆에서 가로막으며) 루리 선생, 지금 상황 안 보여? 애 숨 넘어가는데 언제 둘이서 매뉴얼 읽고 앉아 있어? 유 선생, 대충 눈으로 보고 빨리 줘! 우리 다 지금까지 이렇게 해도 문제없었어.', emotion: 'angry' },
      { speaker: '유연해', text: '하지만 선배님, 용량이 헷갈리는데 한 번만 같이...', emotion: 'worried' },
      { speaker: '나선배', text: '(코웃음) 너까지 왜 이래? 공부만 하다 온 신규가 저러는 건 이해해도, 너까지 흐름 끊을 거야? 너 때문에 투약 늦어져서 애 잘못되면 네가 책임질 거야?', emotion: 'mocking' },
      { speaker: '나레이션', text: '(카메라가 벽을 비춘다. "환자 안전 제일" 포스터가 찢어진 채 방치되어 있고, 루리는 얼어붙는다.)' },
      { speaker: '독고영', text: '(다시 다가오며) 뭐야, 아직도 투약 안 됐어? 유연해 선생, 연차 쌓이더니 손이 느려진 거야? 나선배 선생 말대로 빨리빨리 안 움직여?', emotion: 'cold' },
    ],
  },
  {
    id: 'scene3_5',
    title: '장면 3.5. SNS 속의 비인간성',
    bg: 'from-slate-900 via-purple-950/30 to-red-950/40',
    bgImage: 'nicu_station1',
    dialogues: [
      { speaker: '나레이션', text: '스테이션 한구석. 8년차 안성공 간호사가 스마트폰을 만지며 낄낄거리고 있다. 독고영 수간호사가 잠시 전화를 받으러 간 사이, 루리는 그 옆에서 우연히 안성공의 화면을 보게 된다.' },
      { speaker: '나레이션', text: '(효과음: 저 멀리 격리실에서 자지러지게 우는 아기의 날카로운 울음소리)' },
      { speaker: '안성공', text: '(피곤에 찌든 눈으로 한숨을 내쉬며 스마트폰 카메라를 든다) 하... 쟤는 왜 저렇게 울어대냐. 기저귀도 갈아줬고 밥도 먹였는데... 진짜 진 빠지네.', emotion: 'annoy' },
      { speaker: '이루리', text: '(당황하며) 저... 선생님, 저 아기 너무 심하게 움직이는데요? 침대 난간 너머로 떨어질 것 같아요. 위험해 보여요!', emotion: 'anxious' },
      { speaker: '안성공', text: '(무심하게 화면을 터치하며) 아, 루리 선생님. 냅둬요. 저러다 지쳐서 자겠지. 나 지금 이 상황 SNS에 올리는 중이야. 공감 좀 받으려고.', emotion: 'sns' },
      { speaker: '시스템', text: '📱 SNS 화면 클로즈업\n[사진: 울어서 얼굴이 벌게진 아기 사진(뒷모습)]\n[텍스트: "오늘도 역대급 찍는 중... 인력은 없고 애는 울고... #간호사그램 #탈출하고싶다 #중환자실일기"]' },
      { speaker: '이루리', text: '(충격받은 표정으로) 선생님, 아기가 진짜로 아파서 우는 것일 수도 있잖아요! 이건 좀...', emotion: 'shock' },
      { speaker: '안성공', text: '(귀찮다는 듯 스마트폰을 주머니에 쑤셔 넣으며) 에이, 루리 선생님. 그냥 그만큼 힘들다는 뜻이야. 신규라 그런지 너무 진지하시네.', emotion: 'annoy' },
      { speaker: '나선배', text: '(지나가다 비웃으며 한마디 거듦) 맞아, 루리 선생님. 여기 있다 보면 미쳐버려요. 우리도 사람인데, 저런 애들 하루 종일 보고 있으면 진이 다 빠진다고.', emotion: 'scoffing' },
      { speaker: '나레이션', text: '(이때 독고영이 전화를 끊고 돌아온다.)' },
      { speaker: '독고영', text: '안성공 선생, 거기서 뭐 해? 루리 선생님 안내 안 하고. 자, 이제 격리 병상 안쪽으로 가보죠.', emotion: 'cold' },
    ],
  },
  {
    id: 'scene4',
    title: '장면 4. 도입부의 마무리',
    bg: 'from-slate-950 via-black to-red-950/60',
    bgImage: 'nicu_station2',
    dialogues: [
      { speaker: '나레이션', text: '독고영이 루리를 차갑게 응시한다.' },
      { speaker: '독고영', text: '보시다시피 우리 병동은 매우 바쁘고 엄격합니다. 개인의 실수는 곧 병동의 위기죠. 자, 이제 남은 구역 안내를 마저 하겠습니다. 따라오세요.', emotion: 'cold' },
      { speaker: '나레이션', text: '루리는 자책하는 노심초와 혼이 나고 있는 유연해를 번갈아 보며 상단의 게이지를 바라본다. 게이지가 더 떨어진다.' },
      { speaker: '시스템', text: '⚠️ 환자안전문화 지수: 위험 수준\n\n이 병동에는 변화가 필요합니다.\n\n당신은 이 병동의 "문화 구축자(Culture Builder)"가 될 수 있을까요?\n\n— Chapter 1 끝 —' },
    ],
  },
];

export const scoreChanges: Record<string, { delta: number; warning: string }> = {
  'scene1-3': { delta: -2, warning: '날카로운 시선 감지' },
  'scene2-5': { delta: -3, warning: '비난 문화 감지: 공개 질책' },
  'scene2-7': { delta: -2, warning: '심리적 안전감 붕괴' },
  'scene3-3': { delta: -3, warning: '안전 절차 무시: 이중 확인 거부' },
  'scene3-5': { delta: -2, warning: '책임 전가 발언 감지' },
  'scene3_5-4': { delta: -3, warning: '환자 존엄성 침해: SNS 게시' },
  'scene3_5-7': { delta: -2, warning: '비윤리적 태도 옹호' },
  'scene4-2': { delta: -3, warning: '엄격한 위계 강조' },
};

export const choices: Choice[] = [
  {
    label: '독고영 수간호사에게 즉시 사실대로 보고해야 한다고 말한다',
    type: 'blame',
    feedback: {
      title: '⚠️ 비난 중심의 접근입니다',
      category: '비난 문화 강화',
      explanation: '노심초 선생의 행동은 의도적이지 않은 "인간적 오류(Human Error)"에 해당합니다. 이런 상황에서 단순히 "보고해야 한다"고만 압박하면, 동료는 더 큰 처벌과 비난에 노출되어 다음 오류는 더 깊이 은폐될 가능성이 높습니다.',
      justCulture: 'Just Culture의 관점에서 인간적 오류는 "지원(Support)"의 대상이지, "제재(Sanction)"의 대상이 아닙니다. 보고는 필요하지만, 비난이 아닌 시스템 개선의 출발점으로 다뤄져야 합니다.',
      scoreDelta: -1,
    },
  },
  {
    label: '노심초 선생에게 다가가 "함께 보고하자"고 제안하며 시스템적 원인을 같이 살펴보자고 한다',
    type: 'just_culture',
    feedback: {
      title: '✨ 공정 문화에 부합하는 선택입니다',
      category: '인간적 오류 → 지원(Support)',
      explanation: '근접 오류(Near Miss)를 투명하게 보고하는 것은 환자안전의 핵심입니다. 하지만 그것을 "혼자 책임지는" 일이 아닌 "함께 분석할 일"로 재구성한 것이 핵심입니다.',
      justCulture: 'Just Culture에서 보고의 목적은 처벌이 아니라 "제2의 피해자"를 막기 위한 시스템 개선입니다. 동료에게 안전감을 제공하면서 동시에 책임 있는 행동을 유도한, 이상적인 접근입니다.',
      scoreDelta: +3,
    },
  },
  {
    label: '신규라서 끼어들 수 없다. 일단 못 본 척하고 따라간다',
    type: 'bystander',
    feedback: {
      title: '⚠️ 방관자 위치의 선택입니다',
      category: '침묵의 문화 동조',
      explanation: '두려움 때문에 침묵하는 것은 충분히 이해할 수 있는 반응입니다. 하지만 침묵은 비난 문화를 유지시키는 가장 강력한 힘입니다. 노심초 선생의 오류는 숨겨질 것이고, 시스템은 학습 기회를 잃습니다.',
      justCulture: 'Just Culture는 "처벌에 대한 두려움 없이 보고할 수 있는 환경"을 전제로 합니다. 신규 간호사 한 명의 침묵이 문화를 바꾸지는 못하지만, 작은 발화의 시작이 문화 변화의 첫걸음이 됩니다.',
      scoreDelta: -2,
    },
  },
  {
    label: '나중에 따로 노심초 선생에게 "괜찮으세요?" 하고 안부를 묻고, 함께 보고 방법을 찾는다',
    type: 'best',
    feedback: {
      title: '🌟 가장 이상적인 선택입니다',
      category: '심리적 안전감 + 시스템 개선',
      explanation: '동료를 "비난받을 사람"이 아닌 "지원받아야 할 동료"로 바라본 접근입니다. 공개된 자리에서의 비난을 피하면서도, 사적인 자리에서 정서적 지지와 함께 보고의 의미를 재구성하려는 노력은 환자안전문화의 정수입니다.',
      justCulture: 'Just Culture는 책임(Accountability)과 안전(Safety) 사이의 균형을 강조합니다. 동료의 심리적 안전감을 보장하면서 동시에 보고를 통한 시스템 학습으로 이어지는 — TPB(계획된 행동 이론)의 "주관적 규범"과 "행동 통제 인식"을 모두 긍정적으로 작동시키는 선택입니다.',
      scoreDelta: +5,
    },
  },
];
