import { isPlainObject } from '../utils/validation.js';

const dataUrl = new URL('../../../data/', import.meta.url);
const pageNamePattern = /^[a-z0-9-]+$/;

/** Seleciona um idioma suportado, priorizando a preferência recebida. */
export function resolveLocale(preferredLocale, supportedLocales, defaultLocale) {
  if (supportedLocales.includes(preferredLocale)) {
    return preferredLocale;
  }

  const language = preferredLocale?.split('-')[0];
  return supportedLocales.find((locale) => locale.split('-')[0] === language) ?? defaultLocale;
}

/** Lê o identificador de conteúdo da página atual; home é o fallback seguro. */
export function getCurrentPage(documentRef = document) {
  const page = documentRef.body?.dataset.page;
  return pageNamePattern.test(page) ? page : 'home';
}

/** Cria um contexto de tradução sem estado global. */
export function createI18n(config, loader, preferredLocale = getPreferredLocale()) {
  if (!loader || typeof loader.loadJson !== 'function') {
    throw new TypeError('[i18n] É necessário informar um loader com loadJson().');
  }

  const { available, default: defaultLocale } = config.locales;
  const locale = resolveLocale(preferredLocale, available, defaultLocale);

  async function loadPage(page) {
    const pageName = pageNamePattern.test(page) ? page : 'home';
    const fallback = await loadLocaleFiles(defaultLocale, pageName);
    const current = locale === defaultLocale ? fallback : await loadLocaleFiles(locale, pageName);

    return Object.freeze({
      global: current.global,
      locale,
      page: current.page,
      translate: (key, fallbackText = '') => translate(key, current, fallback, fallbackText),
    });
  }

  async function loadLocaleFiles(localeName, pageName) {
    const [global, page] = await Promise.all([
      loadTranslationFile(localeName, 'global'),
      loadTranslationFile(localeName, pageName),
    ]);

    return Object.freeze({ global, page });
  }

  async function loadTranslationFile(localeName, fileName) {
    const resource = new URL(`${localeName}/${fileName}.json`, dataUrl);

    try {
      const translation = await loader.loadJson(resource);

      if (!isPlainObject(translation)) {
        throw new TypeError('o arquivo deve conter um objeto JSON.');
      }

      return translation;
    } catch (error) {
      console.warn(`[i18n] Não foi possível carregar "${localeName}/${fileName}.json"; será usado o fallback disponível.`, error);
      return Object.freeze({});
    }
  }

  return Object.freeze({
    defaultLocale,
    loadPage,
    locale,
    supportedLocales: available,
  });
}

/** Aplica somente textos para elementos declarados com data-i18n. */
export function applyTranslations(translations, documentRef = document) {
  for (const element of documentRef.querySelectorAll('[data-i18n]')) {
    const text = translations.translate(element.dataset.i18n);

    if (text) {
      element.textContent = text;
    }
  }
}

function translate(key, current, fallback, fallbackText) {
  return getValue(current.page, key)
    ?? getValue(current.global, key)
    ?? getValue(fallback.page, key)
    ?? getValue(fallback.global, key)
    ?? fallbackText;
}

function getValue(source, key) {
  const value = key.split('.').reduce((entry, part) => {
    return isPlainObject(entry) ? entry[part] : undefined;
  }, source);

  return typeof value === 'string' ? value : undefined;
}

function getPreferredLocale(locationRef = typeof window === 'undefined' ? null : window.location) {
  const requestedLocale = locationRef ? new URL(locationRef.href).searchParams.get('lang') : null;
  return requestedLocale ?? (typeof navigator === 'undefined' ? null : navigator.language);
}
