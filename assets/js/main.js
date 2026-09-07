import { initApp } from './core/app.js';
import { getErrorMessage } from './utils/helpers.js';

async function start() {
  try {
    await initApp();
  } catch (error) {
    console.error(`[main] A aplicação não pôde ser iniciada: ${getErrorMessage(error)}`, error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}

registerServiceWorker();

/** Registra o cache estático apenas em contextos seguros, sem atrasar a página. */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    return;
  }

  window.addEventListener('load', () => {
    const serviceWorkerUrl = new URL('../../sw.js', import.meta.url);

    navigator.serviceWorker.register(serviceWorkerUrl).catch((error) => {
      console.warn('[pwa] O Service Worker não pôde ser registrado.', error);
    });
  }, { once: true });
}
