// Web Audio API 기반 게임 SFX 생성기
// 별도 음원 파일 없이 합성으로 타이핑/클릭/점수/경고/모달음을 만든다.

export type SfxName =
  | 'type'
  | 'click'
  | 'choice-hover'
  | 'choice-select'
  | 'score-up'
  | 'score-down'
  | 'score-warning'
  | 'modal-open'
  | 'scene-transition'
  | 'choice-best'
  | 'choice-bad';

type SfxOptions = {
  masterVolume?: number;
  sfxVolume?: number;
};

class SfxEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterVolume = 0.7;
  private sfxVolume = 0.6;
  private muted = false;
  private lastPlayedAt: Record<string, number> = {};

  ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.applyVolumes();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  setVolumes(opts: SfxOptions) {
    if (opts.masterVolume !== undefined) this.masterVolume = clamp01(opts.masterVolume);
    if (opts.sfxVolume !== undefined) this.sfxVolume = clamp01(opts.sfxVolume);
    this.applyVolumes();
  }

  setMuted(m: boolean) {
    this.muted = m;
    this.applyVolumes();
  }

  private applyVolumes() {
    if (!this.master || !this.sfxGain) return;
    this.master.gain.value = this.muted ? 0 : this.masterVolume;
    this.sfxGain.gain.value = this.sfxVolume;
  }

  private blip(opts: {
    freq: number;
    durMs: number;
    type?: OscillatorType;
    sweepTo?: number;
    attackMs?: number;
    releaseMs?: number;
    gain?: number;
  }) {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const { freq, durMs, type = 'sine', sweepTo, attackMs = 4, releaseMs = 60, gain = 0.25 } = opts;
    const t0 = ctx.currentTime;
    const t1 = t0 + (attackMs / 1000);
    const t2 = t0 + (durMs / 1000);
    const t3 = t2 + (releaseMs / 1000);

    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (sweepTo !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(20, sweepTo), t2);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t1);
    g.gain.setValueAtTime(gain, t2);
    g.gain.exponentialRampToValueAtTime(0.0001, t3);

    osc.connect(g).connect(this.sfxGain);
    osc.start(t0);
    osc.stop(t3 + 0.02);
  }

  private noise(opts: { durMs: number; gain?: number; lowpass?: number }) {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const { durMs, gain = 0.15, lowpass = 4000 } = opts;
    const dur = durMs / 1000;
    const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(filter).connect(g).connect(this.sfxGain);
    src.start();
  }

  play(name: SfxName) {
    // 같은 sfx 너무 자주 호출되지 않도록 throttle
    const now = performance.now();
    const last = this.lastPlayedAt[name] ?? 0;
    const throttle = name === 'type' ? 35 : 60;
    if (now - last < throttle) return;
    this.lastPlayedAt[name] = now;

    switch (name) {
      case 'type':
        this.blip({ freq: 1800 + Math.random() * 200, durMs: 12, type: 'square', attackMs: 1, releaseMs: 14, gain: 0.05 });
        break;
      case 'click':
        this.blip({ freq: 600, durMs: 30, type: 'triangle', sweepTo: 320, attackMs: 2, releaseMs: 50, gain: 0.18 });
        break;
      case 'choice-hover':
        this.blip({ freq: 900, durMs: 40, type: 'sine', attackMs: 4, releaseMs: 80, gain: 0.08 });
        break;
      case 'choice-select':
        this.blip({ freq: 520, durMs: 120, type: 'triangle', sweepTo: 780, attackMs: 4, releaseMs: 140, gain: 0.22 });
        this.blip({ freq: 780, durMs: 160, type: 'sine', sweepTo: 1040, attackMs: 30, releaseMs: 200, gain: 0.16 });
        break;
      case 'score-up':
        this.blip({ freq: 520, durMs: 110, type: 'triangle', sweepTo: 880, attackMs: 4, releaseMs: 160, gain: 0.22 });
        break;
      case 'score-down':
        this.blip({ freq: 320, durMs: 140, type: 'sawtooth', sweepTo: 140, attackMs: 4, releaseMs: 180, gain: 0.22 });
        break;
      case 'score-warning':
        this.blip({ freq: 380, durMs: 70, type: 'square', attackMs: 4, releaseMs: 80, gain: 0.18 });
        setTimeout(() => this.blip({ freq: 320, durMs: 70, type: 'square', attackMs: 4, releaseMs: 80, gain: 0.18 }), 90);
        break;
      case 'modal-open':
        this.noise({ durMs: 220, gain: 0.06, lowpass: 1200 });
        this.blip({ freq: 220, durMs: 180, type: 'sine', sweepTo: 440, attackMs: 10, releaseMs: 220, gain: 0.16 });
        break;
      case 'scene-transition':
        this.noise({ durMs: 480, gain: 0.05, lowpass: 800 });
        break;
      case 'choice-best':
        this.blip({ freq: 520, durMs: 120, type: 'sine', sweepTo: 780, attackMs: 4, releaseMs: 160, gain: 0.22 });
        setTimeout(() => this.blip({ freq: 780, durMs: 140, type: 'sine', sweepTo: 1040, attackMs: 4, releaseMs: 180, gain: 0.2 }), 110);
        setTimeout(() => this.blip({ freq: 1040, durMs: 200, type: 'sine', attackMs: 4, releaseMs: 280, gain: 0.18 }), 240);
        break;
      case 'choice-bad':
        this.blip({ freq: 220, durMs: 220, type: 'sawtooth', sweepTo: 110, attackMs: 4, releaseMs: 300, gain: 0.22 });
        this.noise({ durMs: 180, gain: 0.05, lowpass: 600 });
        break;
    }
  }
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export const sfx = new SfxEngine();
