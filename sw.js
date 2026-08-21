/* 한 번 열어두면 인터넷이 없어도 열립니다.
   먼저 저장해 둔 것을 보여주고, 뒤에서 새 판이 있는지 확인해 갈아둡니다. */
const CACHE = 'gongmun-v5';
const FILES = [
  './', 'index.html', 'app.html', 'manifest.webmanifest',
  'icon-192.png', 'icon-512.png', 'icon-maskable.png', 'apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req).then(hit => {
      const live = fetch(req).then(res => {
        if (res && res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
        return res;
      }).catch(() => hit);
      return hit || live;
    })
  );
});
