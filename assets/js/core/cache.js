/** Cria um cache em memória isolado para recursos já carregados. */
export function createCache() {
  const entries = new Map();

  return Object.freeze({
    clear: () => entries.clear(),
    delete: (key) => entries.delete(key),
    get: (key) => entries.get(key),
    has: (key) => entries.has(key),
    set: (key, value) => entries.set(key, value),
  });
}
