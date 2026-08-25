/** Converte valores de erro em mensagens seguras para logs de desenvolvimento. */
export function getErrorMessage(error, fallback = 'Ocorreu um erro inesperado.') {
  return error instanceof Error && error.message ? error.message : fallback;
}
