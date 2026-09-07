import { isPlainObject } from '../utils/validation.js';

/** Renderiza as coleções demonstrativas da página inicial com dados do JSON. */
export function initHome(translations, documentRef = document) {
  renderCards(documentRef.querySelector('[data-home-services]'), translations.get('services.items', []));
  renderCards(documentRef.querySelector('[data-home-highlights]'), translations.get('highlights.items', []));
}

function renderCards(container, items) {
  if (!container || !Array.isArray(items)) {
    return;
  }

  const cards = document.createDocumentFragment();

  for (const item of items) {
    if (!isPlainObject(item) || typeof item.title !== 'string' || typeof item.description !== 'string') {
      continue;
    }

    const article = document.createElement('article');
    const title = document.createElement('h3');
    const description = document.createElement('p');

    article.className = 'card flow';
    title.textContent = item.title;
    description.textContent = item.description;
    article.append(title, description);
    cards.append(article);
  }

  if (cards.childNodes.length > 0) {
    container.replaceChildren(cards);
  }
}
