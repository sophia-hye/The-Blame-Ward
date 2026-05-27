import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { History, FastForward, Play, Pause, Settings, Volume2, VolumeX, X } from 'lucide-react';
import type { GameSettings } from './settings';
import { sfx } from './sound';

export type BacklogEntry = {
  speaker: string;
  text: string;
  speakerColor?: string;
};

type Props = {
  settings: GameSettings;
  onUpdate: (patch: Partial<GameSettings>) => void;
  backlog: BacklogEntry[];
};

export default function GameMenu({ settings, onUpdate, backlog }: Props) {
  const [openPanel, setOpenPanel] = useState<'backlog' | 'settings' | null>(null);

  const iconBtn = 'w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-lg border border-white/15 bg-black/45 hover:bg-black/65 text-stone-200 hover:text-white backdrop-blur-sm transition-all hover:scale-105 hover:border-white/40';
  const activeBtn = 'border-amber-400/70 text-amber-200 bg-amber-900/40';

  const toggleSkip = () => {
    sfx.play('click');
    onUpdate({ skip: !settings.skip, autoPlay: false });
  };
  const toggleAuto = () => {
    sfx.play('click');
    onUpdate({ autoPlay: !settings.autoPlay, skip: false });
  };

  return (
    <>
      {/* 우상단 메뉴 바 */}
      <div className="absolute top-3 right-3 md:top-4 md:right-4 z-[45] flex items-center gap-2">
        <button
          title="자동 진행"
          onClick={(e) => { e.stopPropagation(); toggleAuto(); }}
          className={`${iconBtn} ${settings.autoPlay ? activeBtn : ''}`}
        >
          {settings.autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          title="스킵 (빠르게 읽기)"
          onClick={(e) => { e.stopPropagation(); toggleSkip(); }}
          className={`${iconBtn} ${settings.skip ? activeBtn : ''}`}
        >
          <FastForward className="w-4 h-4" />
        </button>
        <button
          title="이전 대사 (백로그)"
          onClick={(e) => { e.stopPropagation(); sfx.play('modal-open'); setOpenPanel('backlog'); }}
          className={iconBtn}
        >
          <History className="w-4 h-4" />
        </button>
        <button
          title={settings.muted ? '소리 켜기' : '소리 끄기'}
          onClick={(e) => { e.stopPropagation(); sfx.play('click'); onUpdate({ muted: !settings.muted }); }}
          className={iconBtn}
        >
          {settings.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <button
          title="설정"
          onClick={(e) => { e.stopPropagation(); sfx.play('modal-open'); setOpenPanel('settings'); }}
          className={iconBtn}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* 백로그 / 설정 패널 */}
      <AnimatePresence>
        {openPanel === 'backlog' && (
          <PanelOverlay onClose={() => setOpenPanel(null)} title="대사 백로그">
            {backlog.length === 0 ? (
              <div className="text-stone-400 text-sm">아직 진행된 대사가 없습니다.</div>
            ) : (
              <div className="space-y-3">
                {backlog.slice().reverse().map((b, i) => (
                  <div key={i} className="bg-slate-900/70 border-l-2 border-stone-600 rounded p-3">
                    <div className={`text-xs font-bold mb-1 ${b.speakerColor ?? 'text-stone-300'}`}>{b.speaker}</div>
                    <div className="text-stone-100 leading-relaxed text-sm whitespace-pre-line">{b.text}</div>
                  </div>
                ))}
              </div>
            )}
          </PanelOverlay>
        )}

        {openPanel === 'settings' && (
          <PanelOverlay onClose={() => setOpenPanel(null)} title="설정">
            <div className="space-y-6">
              <SliderRow
                label="텍스트 속도"
                value={mapTextSpeedReverse(settings.textSpeedMs)}
                onChange={v => onUpdate({ textSpeedMs: mapTextSpeed(v) })}
                hint={textSpeedLabel(settings.textSpeedMs)}
              />
              <SliderRow
                label="마스터 볼륨"
                value={settings.masterVolume * 100}
                onChange={v => onUpdate({ masterVolume: v / 100 })}
                hint={`${Math.round(settings.masterVolume * 100)}%`}
              />
              <SliderRow
                label="효과음 볼륨"
                value={settings.sfxVolume * 100}
                onChange={v => {
                  onUpdate({ sfxVolume: v / 100 });
                  if (v > 0) sfx.play('click');
                }}
                hint={`${Math.round(settings.sfxVolume * 100)}%`}
              />
              <div className="text-xs text-stone-500 pt-2 border-t border-white/10">
                ※ 설정은 브라우저에 자동 저장됩니다.
              </div>
            </div>
          </PanelOverlay>
        )}
      </AnimatePresence>
    </>
  );
}

function PanelOverlay({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[55] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={(e) => { e.stopPropagation(); onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        className="w-[min(92vw,720px)] max-h-[80vh] bg-slate-950/95 border border-white/15 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <h3 className="text-stone-100 font-semibold">{title}</h3>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-8 h-8 flex items-center justify-center rounded text-stone-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function SliderRow({ label, value, onChange, hint }: { label: string; value: number; onChange: (v: number) => void; hint: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-stone-200 text-sm font-semibold">{label}</span>
        <span className="text-stone-400 text-xs">{hint}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onClick={(e) => e.stopPropagation()}
        className="w-full accent-amber-400 cursor-pointer"
      />
    </div>
  );
}

// 슬라이더 0~100을 텍스트 속도 ms로 매핑 (높을수록 빠름)
function mapTextSpeed(slider: number): number {
  // 0 -> 60ms (느림), 100 -> 5ms (즉시)
  return Math.round(60 - (slider / 100) * 55);
}
function mapTextSpeedReverse(ms: number): number {
  return Math.max(0, Math.min(100, ((60 - ms) / 55) * 100));
}
function textSpeedLabel(ms: number): string {
  if (ms <= 8) return '매우 빠름';
  if (ms <= 18) return '빠름';
  if (ms <= 30) return '보통';
  if (ms <= 45) return '느림';
  return '매우 느림';
}
