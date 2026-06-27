/**
 * Converte a env CORS_ORIGINS numa config de origem para o middleware cors.
 * Vazio/undefined → `true` (libera todas as origens, útil em dev).
 * Caso contrário → lista de origens permitidas.
 */
export function parseCorsOrigins(raw: string | undefined): true | string[] {
  if (!raw || !raw.trim()) return true;
  return raw.split(",").map((o) => o.trim()).filter(Boolean);
}
