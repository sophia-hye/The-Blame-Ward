import { useEffect, useState } from 'react';
import { sfx } from './sound';

export type GameSettings = {
  textSpeedMs: number; // typewriter per-char delay (ms)
  masterVolume: number; // 0~1
  sfxVolume: number; // 0~1
  muted: boolean;
  autoPlay: boolean;
  skip: boolean;
};

const STORAGE_KEY = 'blame-ward.settings.v1';

const DEFAULTS: GameSettings = {
  textSpeedMs: 25,
  masterVolume: 0.7,
  sfxVolume: 0.6,
  muted: false,
  autoPlay: false,
  skip: false,
};

function load(): GameSettings {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed, autoPlay: false, skip: false };
  } catch {
    return DEFAULTS;
  }
}

function save(s: GameSettings) {
  if (typeof window === 'undefined') return;
  try {
    const { autoPlay, skip, ...persisted } = s;
    void autoPlay;
    void skip;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch {
    // ignore
  }
}

export function useGameSettings() {
  const [settings, setSettings] = useState<GameSettings>(() => load());

  useEffect(() => {
    sfx.setVolumes({ masterVolume: settings.masterVolume, sfxVolume: settings.sfxVolume });
    sfx.setMuted(settings.muted);
    save(settings);
  }, [settings.masterVolume, settings.sfxVolume, settings.muted, settings.textSpeedMs]);

  const update = (patch: Partial<GameSettings>) => setSettings(prev => ({ ...prev, ...patch }));

  return { settings, update };
}
