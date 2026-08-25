/** Seleciona um idioma suportado, priorizando a preferência do navegador. */
export function resolveLocale(preferredLocale, supportedLocales, defaultLocale) {
  if (supportedLocales.includes(preferredLocale)) {
    return preferredLocale;
  }

  const language = preferredLocale?.split('-')[0];
  return supportedLocales.find((locale) => locale.split('-')[0] === language) ?? defaultLocale;
}

/** Prepara o contexto de idioma; traduções serão carregadas futuramente. */
export function createI18n(config, preferredLocale = typeof navigator === 'undefined' ? null : navigator.language) {
  const locale = resolveLocale(
    preferredLocale,
    config.supportedLocales,
    config.defaultLocale,
  );

  return Object.freeze({
    locale,
    supportedLocales: config.supportedLocales,
  });
}
