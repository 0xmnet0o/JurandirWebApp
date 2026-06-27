/**
 * Converte a env CORS_ORIGINS numa config de origem para o middleware cors.
 *
 * - Com origens configuradas → lista de origens permitidas.
 * - Sem configuração:
 *   - fora de produção → `true` (libera tudo, conveniente em dev);
 *   - em produção → `[]` (**fail-closed**: nega cross-origin até configurar
 *     `CORS_ORIGINS`, evitando expor a API a qualquer site por descuido).
 */
export function parseCorsOrigins(raw: string | undefined, isProduction = false): true | string[] {
  const list = (raw ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  if (list.length) return list;
  return isProduction ? [] : true;
}
