/** Atualiza o idioma do documento sem acoplar módulos ao HTML da página. */
export function setDocumentLanguage(locale, documentElement = document.documentElement) {
  documentElement.lang = locale;
}

/** Atualiza o título exibido pelo navegador. */
export function setDocumentTitle(title, documentRef = document) {
  documentRef.title = title;
}
