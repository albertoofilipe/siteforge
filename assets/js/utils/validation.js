/** Verifica se o valor é um texto que contém conteúdo. */
export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Verifica listas usadas em configurações simples. */
export function isStringArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every(isNonEmptyString);
}
