const CACHE_NAME = 'lavibora-offline-v12';
const APP_FILES = ['./index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png', './favicon-64.png'];

const CONTROLS_STYLE = `<style id="compat-controls-v12">
.game-controls .controls { grid-template-columns: repeat(3, 52px) !important; gap: 6px !important; touch-action: none; }
.game-controls .controls button:not(.empty) { width: 52px !important; min-width: 52px !important; height: 52px !important; min-height: 52px !important; padding: 0 !important; font-size: 24px !important; display: grid; place-items: center; touch-action: none !important; -webkit-user-select: none; user-select: none; }
@media (max-height: 500px) { .game-controls .controls { grid-template-columns: repeat(4, 52px) !important; } }
</style>`;

const LEGACY_TOUCH_FALLBACK = `<script id="compat-controls-events-v12">
(function () {
  if ('PointerEvent' in window) return;
  document.querySelectorAll('[data-dir]').forEach(function (button) {
    function dispatchPointerDown() {
      var event;
      try {
        event = new Event('pointerdown', { bubbles: true, cancelable: true });
      } catch (error) {
        event = document.createEvent('Event');
        event.initEvent('pointerdown', true, true);
      }
      button.dispatchEvent(event);
    }
    button.addEventListener('touchstart', function (event) {
      if (event.cancelable) event.preventDefault();
      dispatchPointerDown();
    }, { passive: false });
    button.addEventListener('mousedown', function (event) {
      if (event.button !== 0) return;
      if (event.cancelable) event.preventDefault();
      dispatchPointerDown();
    });
  });
})();
</script>`;

function addControlsCompatibility(response) {
  if (!response || !response.ok || !response.headers.get('content-type') || !response.headers.get('content-type').includes('text/html')) return Promise.resolve(response);
  return response.text().then(html => {
    if (html.includes('compat-controls-v12')) return response;
    html = html.replace('</head>', CONTROLS_STYLE + '</head>');
    html = html.replace('</body>', LEGACY_TOUCH_FALLBACK + '</body>');
    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('content-encoding');
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  });
}

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('lavibora-offline-') && key !== CACHE_NAME).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});

self.addEventListener('fetch', event => {
  if (event.request.mode !== 'navigate' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request).then(response => addControlsCompatibility(response).then(enhanced => {
      if (enhanced.ok) {
        const copy = enhanced.clone();
        event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy)));
      }
      return enhanced;
    })).catch(async () => (await caches.match('./index.html')) || Response.error())
  );
});
