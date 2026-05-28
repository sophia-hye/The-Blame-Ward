// 빌드 시점에 assets/img/bg/*.png 모두 import
const bgModules = import.meta.glob<{ default: string }>(
  '../../assets/img/bg/*.png',
  { eager: true },
);

const bgMap: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  for (const [path, mod] of Object.entries(bgModules)) {
    const name = path.split('/').pop()?.replace(/\.png$/, '');
    if (name) out[name] = mod.default;
  }
  return out;
})();

/**
 * 배경 키(파일명에서 확장자 제외)를 받아 번들된 URL을 반환.
 * 없는 키는 null.
 */
export function resolveBackground(key: string | null | undefined): string | null {
  if (!key) return null;
  return bgMap[key] ?? null;
}

export const availableBackgrounds = Object.keys(bgMap);
