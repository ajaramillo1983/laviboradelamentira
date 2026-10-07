const CACHE_NAME = 'lavibora-offline-v17';
const APP_FILES = ['./index.html', './logo.webp', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png', './favicon-64.png'];

const CONTROLS_STYLE = `<style id="compat-controls-v13">
.game-wrap { grid-template-rows: auto auto minmax(0, 1fr) auto !important; }
.game-header { grid-row: 1; }
.game-toolbar { grid-row: 2; align-self: center; display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; width: 100%; padding: 5px 8px; border: 1px solid var(--line); border-radius: 15px; background: linear-gradient(145deg, rgba(6,24,23,.90), rgba(1,7,7,.92)); box-shadow: 0 12px 30px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.04); }
.canvas-card { grid-row: 3; }
.game-controls { grid-row: 4; }
.game-controls .controls { grid-template-columns: repeat(3, 52px) !important; gap: 6px !important; touch-action: none; }
.game-controls .controls button:not(.empty) { width: 52px !important; min-width: 52px !important; height: 52px !important; min-height: 52px !important; padding: 0 !important; font-size: 24px !important; display: grid; place-items: center; touch-action: none !important; -webkit-user-select: none; user-select: none; }
.game-wrap:has(#startOverlay:not(.hidden)) .game-toolbar { display: none !important; }
@media (max-height: 500px) { .game-controls .controls { grid-template-columns: repeat(4, 52px) !important; } }
</style>`;

const CONTROLS_BOOTSTRAP = `<script id="compat-controls-events-v13">
(function () {
  var toolbar = document.querySelector('.game-toolbar');
  var canvasCard = document.querySelector('.canvas-card');
  var startOverlay = document.getElementById('startOverlay');
  if (toolbar && canvasCard && canvasCard.parentNode && toolbar.parentNode !== canvasCard.parentNode) {
    canvasCard.parentNode.insertBefore(toolbar, canvasCard);
  }
  function syncToolbarVisibility() {
    if (toolbar && startOverlay) toolbar.classList.toggle('hidden', !startOverlay.classList.contains('hidden'));
  }
  syncToolbarVisibility();
  if (startOverlay && window.MutationObserver) {
    new MutationObserver(syncToolbarVisibility).observe(startOverlay, { attributes: true, attributeFilter: ['class'] });
  }
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
    if (html.includes('compat-controls-v13')) return response;
    html = html.replace('</head>', CONTROLS_STYLE + '</head>');
    html = html.replace('</body>', CONTROLS_BOOTSTRAP + '</body>');
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
  const requestUrl = new URL(event.request.url);
  const logoUrl = new URL('./logo.webp', self.location.href);
  if (requestUrl.href === logoUrl.href) {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
    return;
  }
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
