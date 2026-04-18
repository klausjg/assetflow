/**
 * Asset Flow - Minimal Service Worker
 * 
 * 이 SW는 오직 PWA 자동 설치 프롬프트(beforeinstallprompt) 조건을
 * 충족시키기 위해 존재합니다. 실제 캐싱은 하지 않고, 모든 요청을
 * 네트워크로 그대로 전달합니다.
 * 
 * 이유: Asset Flow 본체는 GAS 웹앱이므로 캐싱이 오히려 문제가 됩니다.
 */

const SW_VERSION = 'af-launcher-v1';

self.addEventListener('install', (event) => {
  // 즉시 활성화
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // 모든 탭에 대한 제어권 즉시 확보
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // 네트워크 요청을 그대로 통과 (캐싱 없음)
  // fetch 핸들러 존재 자체가 PWA installability 조건 중 하나
  return;
});
