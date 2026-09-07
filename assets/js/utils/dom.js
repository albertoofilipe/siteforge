/** Atualiza o idioma do documento sem acoplar módulos ao HTML da página. */
export function setDocumentLanguage(locale, documentElement = document.documentElement) {
  documentElement.lang = locale;
}

/** Mantém título e metadados de compartilhamento coerentes com a configuração. */
export function applyDocumentMetadata({ description, locale, siteName, siteUrl, title }, documentRef = document) {
  documentRef.title = title;

  const pathname = documentRef.location?.pathname ?? '/';
  const canonicalPath = /(?:^|\/)index\.html$/.test(pathname) ? '/' : pathname;
  const canonicalUrl = new URL(canonicalPath, siteUrl).href;
  const values = {
    'meta[name="description"]': description,
    'link[rel="canonical"]': canonicalUrl,
    'meta[property="og:title"]': title,
    'meta[property="og:site_name"]': siteName,
    'meta[property="og:description"]': description,
    'meta[property="og:url"]': canonicalUrl,
    'meta[property="og:locale"]': locale.replace('-', '_'),
    'meta[name="twitter:title"]': title,
    'meta[name="twitter:description"]': description,
  };

  for (const [selector, value] of Object.entries(values)) {
    const element = documentRef.head.querySelector(selector);

    if (element) {
      if (element.matches('link')) {
        element.setAttribute('href', value);
      } else {
        element.setAttribute('content', value);
      }
    }
  }
}

/** Aplica somente tokens visuais validados pela configuração central. */
export function applyTheme(theme, documentElement = document.documentElement) {
  documentElement.style.colorScheme = theme.colorScheme;
  documentElement.style.setProperty('--color-primary', theme.primaryColor);
  documentElement.style.setProperty('--color-primary-hover', theme.primaryHoverColor);
  documentElement.style.setProperty('--radius-md', theme.borderRadius);
}
