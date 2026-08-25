import { createCache } from './cache.js';
import { createComponentLoader } from '../components/component-loader.js';
import { loadConfig } from './config.js';
import { applyTranslations, createI18n, getCurrentPage } from './i18n.js';
import { createResourceLoader } from './loader.js';
import { applyTheme, setDocumentLanguage, setDocumentTitle } from '../utils/dom.js';
import { initLanguageSelector } from '../components/language-selector.js';

/** Coordena a inicialização e retorna o contexto local da aplicação. */
export async function initApp() {
  try {
    const cache = createCache();
    const loader = createResourceLoader({ cache });
    const config = await loadConfig(loader);
    const i18n = createI18n(config, loader);
    const page = getCurrentPage();
    const translations = await i18n.loadPage(page);
    const componentLoader = createComponentLoader({ loader });

    setDocumentLanguage(i18n.locale);
    setDocumentTitle(config.company.name);
    applyTheme(config.theme);
    await componentLoader.load(document);
    applyTranslations(translations);

    if (config.options.showLanguageSelector) {
      const selector = document.querySelector('[data-language-selector]');
      initLanguageSelector(selector, {
        currentLocale: i18n.locale,
        label: translations.translate('common.language', 'Idioma'),
        locales: i18n.supportedLocales,
        onChange: changeLocale,
      });
    }

    return Object.freeze({ cache, componentLoader, config, i18n, loader, page, translations });
  } catch (error) {
    console.error('[app] Falha ao carregar a configuração inicial.', error);
    throw error;
  }
}

function changeLocale(locale) {
  const url = new URL(window.location.href);
  url.searchParams.set('lang', locale);
  window.location.assign(url);
}
