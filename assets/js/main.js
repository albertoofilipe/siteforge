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
