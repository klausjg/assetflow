/**
 * Asset Flow - Premium Mobile Launcher Service Worker
 *
 * PWA 설치 조건을 충족시키는 경량 런처용입니다.
 * 실제 자산 대시보드는 GAS 웹앱에서 최신 데이터를 읽으므로
 * 런처는 캐싱 없이 네트워크 요청을 그대로 통과시킵니다.
 */

const SW_VERSION = 'af-premium-launcher-v3';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  return;
});
