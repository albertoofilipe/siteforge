/** Centraliza o carregamento assíncrono de dados JSON. */
export function createResourceLoader({ cache } = {}) {
  async function loadJson(resource) {
    const url = new URL(resource, document.baseURI);
    const key = url.href;

    if (cache?.has(key)) {
      return cache.get(key);
    }

    const request = fetchJson(url);
    cache?.set(key, request);

    try {
      return await request;
    } catch (error) {
      cache?.delete(key);
      throw error;
    }
  }

  return Object.freeze({ loadJson });
}

async function fetchJson(url) {
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
    return await response.json();
  } catch (error) {
    throw new Error(`[loader] O arquivo "${url.href}" não contém JSON válido.`, {
      cause: error,
    });
  }
}
