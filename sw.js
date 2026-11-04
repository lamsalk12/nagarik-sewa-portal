/* Citizen Services Portal — service worker
   App shell and self-hosted scripts: cache-first. Google Fonts: stale-while-revalidate.
   Only successful (200) responses are cached. Nothing else leaves the network path. */
const VERSION = 'nsp-v13';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png',
  './map/nepal-map.json', './vendor/react.production.min.js', './vendor/react-dom.production.min.js', './vendor/nepali-date-converter.umd.js'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const cacheable = res => res && res.ok && (res.type === 'basic' || res.type === 'cors');

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => {
      if (cacheable(res)) { const copy = res.clone(); caches.open(VERSION).then(c => c.put('./index.html', copy)); }
      return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }

  if (url.origin === location.origin) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (cacheable(res)) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    })));
    return;
  }

  if (FONT_HOSTS.includes(url.hostname)) {
    e.respondWith(caches.open(VERSION).then(c => c.match(req).then(hit => {
      const net = fetch(req).then(res => { if (cacheable(res)) c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })));
  }
});
