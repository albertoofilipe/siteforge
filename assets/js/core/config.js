import { isNonEmptyString, isPlainObject, isStringArray } from '../utils/validation.js';

const configUrl = new URL('../../../data/config.json', import.meta.url);
const colorPattern = /^#[0-9a-f]{6}$/i;
const cssSizePattern = /^(?:0|[0-9]+(?:\.[0-9]+)?(?:px|rem|em|%))$/;

/** Carrega e valida as configurações essenciais do site. */
export async function loadConfig(loader, url = configUrl) {
  if (!loader || typeof loader.loadJson !== 'function') {
    throw new TypeError('[config] É necessário informar um loader com loadJson().');
  }

  const config = await loader.loadJson(url);
  return validateConfig(config);
}

/** Valida e congela a estrutura de data/config.json. */
export function validateConfig(config) {
  assertObject(config, 'raiz');

  const company = validateCompany(config.company);
  const assets = validateAssets(config.assets);
  const contacts = validateContacts(config.contacts);
  const social = validateUrlMap(config.social, 'social', false);
  const urls = validateUrlMap(config.urls, 'urls', true);
  const locales = validateLocales(config.locales);
  const theme = validateTheme(config.theme);
  const options = validateOptions(config.options);

  return Object.freeze({ assets, company, contacts, locales, options, social, theme, urls });
}

function validateCompany(company) {
  assertObject(company, 'company');
  assertText(company.name, 'company.name');
  assertText(company.description, 'company.description');

  return Object.freeze({ description: company.description.trim(), name: company.name.trim() });
}

function validateAssets(assets) {
  assertObject(assets, 'assets');
  assertObject(assets.logo, 'assets.logo');
  assertSafeUrl(assets.logo.src, 'assets.logo.src', true);
  assertText(assets.logo.alt, 'assets.logo.alt');
  assertSafeUrl(assets.favicon, 'assets.favicon', true);

  return Object.freeze({
    favicon: assets.favicon.trim(),
    logo: Object.freeze({ alt: assets.logo.alt.trim(), src: assets.logo.src.trim() }),
  });
}

function validateContacts(contacts) {
  assertObject(contacts, 'contacts');
  assertText(contacts.phone, 'contacts.phone');
  assertText(contacts.whatsapp, 'contacts.whatsapp');
  assertEmail(contacts.email, 'contacts.email');
  assertObject(contacts.address, 'contacts.address');
  assertText(contacts.address.line1, 'contacts.address.line1');
  assertText(contacts.address.city, 'contacts.address.city');
  assertText(contacts.address.country, 'contacts.address.country');

  return Object.freeze({
    address: Object.freeze({
      city: contacts.address.city.trim(),
      country: contacts.address.country.trim(),
      line1: contacts.address.line1.trim(),
    }),
    email: contacts.email.trim(),
    phone: contacts.phone.trim(),
    whatsapp: contacts.whatsapp.trim(),
  });
}

function validateUrlMap(value, field, allowRelative) {
  assertObject(value, field);

  for (const [name, url] of Object.entries(value)) {
    assertText(name, `${field} contém uma chave inválida`);
    assertSafeUrl(url, `${field}.${name}`, allowRelative);
  }

  if (field === 'urls' && !isWebUrl(value.website)) {
    throw new TypeError('[config] "urls.website" deve ser uma URL http(s) absoluta.');
  }

  return Object.freeze({ ...value });
}

function validateLocales(locales) {
  assertObject(locales, 'locales');
  assertText(locales.default, 'locales.default');

  if (!isStringArray(locales.available)) {
    throw new TypeError('[config] "locales.available" deve ser uma lista de textos não vazios.');
  }

  if (!locales.available.includes(locales.default)) {
    throw new RangeError('[config] "locales.default" deve existir em "locales.available".');
  }

  if (new Set(locales.available).size !== locales.available.length) {
    throw new RangeError('[config] "locales.available" não pode conter idiomas repetidos.');
  }

  return Object.freeze({
    available: Object.freeze([...locales.available]),
    default: locales.default.trim(),
  });
}

function validateTheme(theme) {
  assertObject(theme, 'theme');

  if (!['light', 'dark'].includes(theme.colorScheme)) {
    throw new TypeError('[config] "theme.colorScheme" deve ser "light" ou "dark".');
  }

  if (!colorPattern.test(theme.primaryColor) || !colorPattern.test(theme.primaryHoverColor)) {
    throw new TypeError('[config] As cores primárias devem usar hexadecimal de seis dígitos, como "#075985".');
  }

  if (!isNonEmptyString(theme.borderRadius) || !cssSizePattern.test(theme.borderRadius)) {
    throw new TypeError('[config] "theme.borderRadius" deve ser uma medida CSS simples, como "0.5rem".');
  }

  return Object.freeze({
    borderRadius: theme.borderRadius,
    colorScheme: theme.colorScheme,
    primaryColor: theme.primaryColor,
    primaryHoverColor: theme.primaryHoverColor,
  });
}

function validateOptions(options) {
  assertObject(options, 'options');

  for (const [name, value] of Object.entries(options)) {
    if (typeof value !== 'boolean') {
      throw new TypeError(`[config] "options.${name}" deve ser verdadeiro ou falso.`);
    }
  }

  return Object.freeze({ ...options });
}

function assertObject(value, field) {
  if (!isPlainObject(value)) {
    throw new TypeError(`[config] "${field}" deve ser um objeto JSON.`);
  }
}

function assertText(value, field) {
  if (!isNonEmptyString(value)) {
    throw new TypeError(`[config] "${field}" deve ser um texto não vazio.`);
  }
}

function assertEmail(value, field) {
  if (!isNonEmptyString(value) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new TypeError(`[config] "${field}" deve conter um e-mail válido.`);
  }
}

function assertSafeUrl(value, field, allowRelative) {
  if (!isNonEmptyString(value) || (allowRelative ? !isSafeUrl(value) : !isWebUrl(value))) {
    const expectation = allowRelative ? 'uma URL ou caminho relativo seguro' : 'uma URL http(s) absoluta';
    throw new TypeError(`[config] "${field}" deve conter ${expectation}.`);
  }
}

function isSafeUrl(value) {
  try {
    const url = new URL(value, 'https://template.local/');
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function isWebUrl(value) {
  return isSafeUrl(value) && /^https?:\/\//i.test(value);
}
