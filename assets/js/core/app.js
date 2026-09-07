import { createCache } from './cache.js';
import { createComponentLoader } from '../components/component-loader.js';
import { initHome } from '../features/home.js';
import { loadConfig } from './config.js';
import { applyTranslations, createI18n, getCurrentPage } from './i18n.js';
import { createResourceLoader } from './loader.js';
import { applyDocumentMetadata, applyTheme, setDocumentLanguage } from '../utils/dom.js';
import { initLanguageSelector } from '../components/language-selector.js';

/** Coordena a inicialização e retorna o contexto local da aplicação. */
export async function initApp() {
  try {
    const cache = createCache();
    const loader = createResourceLoader({ cache });
    const config = await loadConfig(loader);
    const i18n = createI18n(config, loader);
    const page = getCurrentPage();
    const componentLoader = createComponentLoader({ loader });
    const [translations] = await Promise.all([
      i18n.loadPage(page),
      componentLoader.load(document),
    ]);

    setDocumentLanguage(i18n.locale);
    applyDocumentMetadata({
      description: translations.translate('seo.description', config.company.description),
      locale: i18n.locale,
      siteName: config.company.name,
      siteUrl: config.urls.website,
      title: translations.translate('seo.title', config.company.name),
    });
    applyTheme(config.theme);
    applyTranslations(translations);

    if (page === 'home') {
      initHome(translations);
    }

    if (config.options.showLanguageSelector) {
      const selector = document.querySelector('[data-language-selector]');
      initLanguageSelector(selector, {
        currentLocale: i18n.locale,
        label: translations.translate('common.language'),
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
