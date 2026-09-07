const CACHE_NAME = 'siteforge-shell-v1';
const HOME_URL = new URL('./index.html', self.location).href;
const SCOPE_PATH = new URL('./', self.location).pathname;
const SHELL_URLS = [
  './',
  './index.html',
  './assets/css/variables.css',
  './assets/css/reset.css',
  './assets/css/base.css',
  './assets/css/layout.css',
  './assets/css/components.css',
  './assets/css/utilities.css',
  './assets/css/responsive.css',
  './assets/js/main.js',
  './assets/js/core/app.js',
  './assets/js/core/cache.js',
  './assets/js/core/config.js',
  './assets/js/core/i18n.js',
  './assets/js/core/loader.js',
  './assets/js/utils/dom.js',
  './assets/js/utils/helpers.js',
  './assets/js/utils/validation.js',
  './assets/js/components/component-loader.js',
  './assets/js/components/language-selector.js',
  './assets/js/features/home.js',
  './components/header.html',
  './components/navbar.html',
  './components/footer.html',
  './data/config.json',
  './data/pt-BR/global.json',
  './data/pt-BR/home.json',
  './data/en/global.json',
  './data/en/home.json',
  './public/favicon.svg',
  './public/manifest.json',
];
const SHELL_URL_SET = new Set(SHELL_URLS.map((url) => new URL(url, self.location).href));

self.addEventListener('install', (event) => {
  event.waitUntil(precacheShell());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(removePreviousCaches());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (SHELL_URL_SET.has(request.url)) {
    event.respondWith(cacheFirstShellAsset(request));
  }
});

async function precacheShell() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(SHELL_URLS.map((url) => {
    return cacheValidResponse(cache, new Request(new URL(url, self.location), { cache: 'reload' }));
  }));
}

async function removePreviousCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames
    .filter((cacheName) => cacheName.startsWith('siteforge-') && cacheName !== CACHE_NAME)
    .map((cacheName) => caches.delete(cacheName)));
  await self.clients.claim();
}

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);

    if (response.ok && isHomeNavigation(request.url)) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(HOME_URL, response.clone());
    }

    return response;
  } catch {
    return (await caches.match(HOME_URL)) ?? Response.error();
  }
}

async function cacheFirstShellAsset(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await fetch(request);

  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }

  return response;
}

async function cacheValidResponse(cache, request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      await cache.put(request, response);
    }
  } catch {
    // A falha de um recurso não impede a instalação nem a navegação online.
  }
}

function isHomeNavigation(url) {
  const { pathname } = new URL(url);
  return pathname === SCOPE_PATH || pathname.endsWith('/index.html');
}
