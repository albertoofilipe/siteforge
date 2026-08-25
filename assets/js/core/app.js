import { createCache } from './cache.js';
import { loadConfig } from './config.js';
import { createI18n } from './i18n.js';
import { createResourceLoader } from './loader.js';
import { applyTheme, setDocumentLanguage, setDocumentTitle } from '../utils/dom.js';

/** Coordena a inicialização e retorna o contexto local da aplicação. */
export async function initApp() {
  try {
    const cache = createCache();
    const loader = createResourceLoader({ cache });
    const config = await loadConfig(loader);
    const i18n = createI18n(config);

    setDocumentLanguage(i18n.locale);
    setDocumentTitle(config.company.name);
    applyTheme(config.theme);

    return Object.freeze({ cache, config, i18n, loader });
  } catch (error) {
    console.error('[app] Falha ao carregar a configuração inicial.', error);
    throw error;
  }
}
