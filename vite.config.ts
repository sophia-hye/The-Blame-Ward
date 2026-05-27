import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// dev 서버에서는 루트(/)에서 동작.
// 빌드 시에는 GitHub Pages 의 프로젝트 사이트 경로(/The-Blame-Ward/)로 배포된다.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/The-Blame-Ward/' : '/',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0, // 큰 캐릭터 PNG는 항상 별도 파일로 (data URI 변환 방지)
  },
}));
