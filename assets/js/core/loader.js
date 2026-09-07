import { isSafeSameOriginUrl } from '../utils/validation.js';

/** Centraliza o carregamento assíncrono de recursos textuais e JSON. */
export function createResourceLoader({ cache } = {}) {
  async function loadJson(resource) {
    return loadResource(resource, 'json');
  }

  async function loadText(resource) {
    return loadResource(resource, 'text');
  }

  async function loadResource(resource, type) {
    const url = new URL(resource, document.baseURI);

    if (!isSafeSameOriginUrl(url, document.baseURI)) {
      throw new TypeError('[loader] Recursos devem usar uma URL HTTP(S) da mesma origem.');
    }

    const key = `${type}:${url.href}`;

    if (cache?.has(key)) {
      return cache.get(key);
    }

    const request = fetchResource(url, type);
    cache?.set(key, request);

    try {
      return await request;
    } catch (error) {
      cache?.delete(key);
      throw error;
    }
  }

  return Object.freeze({ loadJson, loadText });
}

async function fetchResource(url, type) {
  let response;

  try {
    response = await fetch(url);
  } catch (error) {
    throw new Error(`[loader] Não foi possível acessar "${url.href}". Verifique o Live Server.`, {
      cause: error,
    });
  }

  if (!response.ok) {
    throw new Error(`[loader] Não foi possível carregar "${url.href}" (HTTP ${response.status}).`);
  }

  try {
    return type === 'json' ? await response.json() : await response.text();
  } catch (error) {
    const resourceType = type === 'json' ? 'JSON válido' : 'texto válido';
    throw new Error(`[loader] O arquivo "${url.href}" não contém ${resourceType}.`, {
      cause: error,
    });
  }
}
