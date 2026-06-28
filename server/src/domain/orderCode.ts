// Crockford base32 (sem I, L, O, U para evitar ambiguidade ao ler/ditar).
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/**
 * Gera um código curto, único e legível por pedido — ex.: `PED-7F3A9C2D`.
 * 8 caracteres base32 (~40 bits): colisão desprezível na escala do app
 * (a coluna `code` tem índice único como garantia adicional).
 */
export function generateOrderCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += ALPHABET[bytes[i] % 32];
  return `PED-${out}`;
}
