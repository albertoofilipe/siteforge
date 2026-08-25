/** Cria um seletor de idioma nativo em um contêiner declarado pela página. */
export function initLanguageSelector(container, options) {
  if (!container) {
    return null;
  }

  const label = document.createElement('label');
  const select = document.createElement('select');

  label.textContent = options.label;
  select.setAttribute('aria-label', options.label);

  for (const locale of options.locales) {
    const option = document.createElement('option');
    option.value = locale;
    option.textContent = locale;
    option.selected = locale === options.currentLocale;
    select.append(option);
  }

  select.addEventListener('change', () => options.onChange(select.value));
  label.append(select);
  container.replaceChildren(label);

  return select;
}
