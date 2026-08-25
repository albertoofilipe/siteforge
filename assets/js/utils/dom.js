/** Atualiza o idioma do documento sem acoplar módulos ao HTML da página. */
export function setDocumentLanguage(locale, documentElement = document.documentElement) {
  documentElement.lang = locale;
}

/** Atualiza o título exibido pelo navegador. */
export function setDocumentTitle(title, documentRef = document) {
  documentRef.title = title;
}

/** Aplica somente tokens visuais validados pela configuração central. */
export function applyTheme(theme, documentElement = document.documentElement) {
  documentElement.style.colorScheme = theme.colorScheme;
  documentElement.style.setProperty('--color-primary', theme.primaryColor);
  documentElement.style.setProperty('--color-primary-hover', theme.primaryHoverColor);
  documentElement.style.setProperty('--radius-md', theme.borderRadius);
}
