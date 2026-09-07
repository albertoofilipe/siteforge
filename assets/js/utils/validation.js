/** Verifica se o valor é um texto que contém conteúdo. */
export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Verifica objetos de configuração sem arrays ou valores nulos. */
export function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Verifica listas usadas em configurações simples. */
export function isStringArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every(isNonEmptyString);
}

/** Aceita apenas URLs HTTP(S), relativas quando explicitamente permitido, sem credenciais. */
export function isSafeHttpUrl(value, { allowRelative = false, baseUrl = 'https://template.local/' } = {}) {
  const candidate = getUrlCandidate(value);

  if (!candidate || (!allowRelative && !/^[a-z][a-z0-9+.-]*:/i.test(candidate))) {
    return false;
  }

  try {
    const url = allowRelative ? new URL(candidate, baseUrl) : new URL(candidate);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

/** Garante que loaders locais não sejam redirecionados para outra origem. */
export function isSafeSameOriginUrl(value, baseUrl) {
  if (!isSafeHttpUrl(value, { allowRelative: true, baseUrl })) {
    return false;
  }

  try {
    return new URL(value, baseUrl).origin === new URL(baseUrl).origin;
  } catch {
    return false;
  }
}

/** Valida fragmentos HTML controlados pelo repositório antes de inseri-los no DOM. */
export function assertSafeComponentFragment(fragment, baseUrl = document.baseURI) {
  const blockedElement = fragment.querySelector('script, style, iframe, object, embed, base, link, meta, template');

  if (blockedElement) {
    throw new TypeError(`[components] A tag <${blockedElement.localName}> não é permitida em componentes.`);
  }

  for (const element of fragment.querySelectorAll('*')) {
    for (const attribute of element.attributes) {
      if (attribute.name.startsWith('on') || attribute.name === 'srcdoc' || attribute.name === 'style') {
        throw new TypeError(`[components] O atributo "${attribute.name}" não é permitido em componentes.`);
      }
    }

    assertComponentUrls(element, baseUrl);
    assertSafeExternalTarget(element);
  }
}

function assertComponentUrls(element, baseUrl) {
  for (const attributeName of ['src', 'action', 'formaction']) {
    if (element.hasAttribute(attributeName) && !isSafeHttpUrl(element.getAttribute(attributeName), { allowRelative: true, baseUrl })) {
      throw new TypeError(`[components] A URL em "${attributeName}" não é segura.`);
    }
  }

  if (element.hasAttribute('href') && !isSafeNavigationUrl(element.getAttribute('href'), baseUrl)) {
    throw new TypeError('[components] A URL em "href" não é segura.');
  }
}

function assertSafeExternalTarget(element) {
  if (element.getAttribute('target')?.toLowerCase() !== '_blank') {
    return;
  }

  const relTokens = new Set((element.getAttribute('rel') ?? '').toLowerCase().split(/\s+/));

  if (!relTokens.has('noopener') || !relTokens.has('noreferrer')) {
    throw new TypeError('[components] Links com target="_blank" exigem rel="noopener noreferrer".');
  }
}

function isSafeNavigationUrl(value, baseUrl) {
  const candidate = getUrlCandidate(value);

  if (/^(mailto|tel):/i.test(candidate)) {
    return !/[\r\n]/.test(candidate);
  }

  return isSafeHttpUrl(candidate, { allowRelative: true, baseUrl });
}

function getUrlCandidate(value) {
  if (value instanceof URL) {
    return value.href;
  }

  return typeof value === 'string' ? value.trim() : '';
}
