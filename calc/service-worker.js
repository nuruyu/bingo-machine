// キャッシュのバージョン名。ファイルを更新した際は、このバージョン名を変更すると新しいファイルがキャッシュされます。
const CACHE_NAME = 'calculation-quiz-v2';

// オフラインで利用可能にしたいファイルの一覧
const urlsToCache = [
  './',             // ルート (index.htmlとして解釈されることが多い)
  './index.html',   // ゲーム本体
  './manifest.json',// アプリ情報
  // 以下のアイコンファイル名は、ご自身のファイル名に合わせて変更してください
  './icon-192x192.png',
  './icon-512x512.png'
];

// 1. インストールイベント: Service Workerが最初に登録されたときに実行されます
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install Event: Caching static assets.');
  // インストールが完了するまで待機
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // オフラインで必要なファイルをすべてキャッシュに追加
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. フェッチイベント: ページがリソースを要求するたびに実行されます
self.addEventListener('fetch', (event) => {
  // すべてのネットワークリクエストを傍受し、処理を制御
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // A. キャッシュ内に一致するものがあれば、それを返す (オフライン動作の実現)
        if (response) {
          console.log('[Service Worker] Fetching from cache:', event.request.url);
          return response;
        }
        
        // B. キャッシュになければ、通常通りネットワークにリクエスト
        console.log('[Service Worker] Fetching from network:', event.request.url);
        return fetch(event.request);
      })
  );
});

// 3. アクティベートイベント: 古いキャッシュをクリーンアップします
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  console.log('[Service Worker] Activate Event: Cleaning up old caches.');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 古いキャッシュ（ホワイトリストに含まれないもの）を削除
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});