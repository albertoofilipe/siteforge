import { isNonEmptyString, isStringArray } from '../utils/validation.js';

const configUrl = new URL('../../../data/config.json', import.meta.url);

/** Carrega e valida as configurações essenciais do site. */
export async function loadConfig(loader, url = configUrl) {
  if (!loader || typeof loader.loadJson !== 'function') {
    throw new TypeError('[config] É necessário informar um loader com loadJson().');
  }

  const config = await loader.loadJson(url);
  return validateConfig(config);
}

/** Valida a estrutura mínima esperada em data/config.json. */
export function validateConfig(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new TypeError('[config] O arquivo deve conter um objeto JSON.');
  }

  const { defaultLocale, siteName, supportedLocales } = config;

  if (!isNonEmptyString(siteName)) {
    throw new TypeError('[config] "siteName" deve ser um texto não vazio.');
  }

  if (!isNonEmptyString(defaultLocale)) {
    throw new TypeError('[config] "defaultLocale" deve ser um texto não vazio.');
  }

  if (!isStringArray(supportedLocales)) {
    throw new TypeError('[config] "supportedLocales" deve ser uma lista de textos não vazios.');
  }

  if (!supportedLocales.includes(defaultLocale)) {
    throw new RangeError('[config] "defaultLocale" deve existir em "supportedLocales".');
  }

  if (new Set(supportedLocales).size !== supportedLocales.length) {
    throw new RangeError('[config] "supportedLocales" não pode conter idiomas repetidos.');
  }

  return Object.freeze({
    defaultLocale,
    siteName: siteName.trim(),
    supportedLocales: Object.freeze([...supportedLocales]),
  });
}
